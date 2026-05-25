import { config } from "../utils/config";
import { IAssignment } from "../models/Assignment";
import { getRedisClient } from "../utils/redis";
import crypto from "crypto";

interface GeneratedPaper {
  title: string;
  subject: string;
  topic: string;
  totalMarks: number;
  duration: string;
  sections: {
    title: string;
    instruction: string;
    questions: {
      questionNumber: number;
      text: string;
      type: string;
      difficulty: "easy" | "medium" | "hard";
      marks: number;
      options?: string[];
    }[];
  }[];
}

export async function generateQuestionPaper(
  assignment: IAssignment
): Promise<GeneratedPaper> {
  const difficultyDistribution = getDifficultyDistribution(
    assignment.difficulty,
    assignment.numberOfQuestions
  );

  const questionTypeLabels: Record<string, string> = {
    mcq: "Multiple Choice Questions (with 4 options each)",
    short_answer: "Short Answer Questions (2-3 lines)",
    long_answer: "Long Answer Questions (detailed)",
    true_false: "True or False",
    fill_blank: "Fill in the Blanks",
  };

  const typesDescription = assignment.questionTypes
    .map((t) => questionTypeLabels[t] || t)
    .join(", ");

  const prompt = `You are an expert exam paper creator. Generate a structured question paper based on the following specifications.

SUBJECT: ${assignment.subject}
TOPIC: ${assignment.topic}
TOTAL QUESTIONS: ${assignment.numberOfQuestions}
TOTAL MARKS: ${assignment.totalMarks}
QUESTION TYPES: ${typesDescription}
DIFFICULTY DISTRIBUTION: ${difficultyDistribution}
${assignment.additionalInstructions ? `ADDITIONAL INSTRUCTIONS: ${assignment.additionalInstructions}` : ""}
${assignment.uploadedFileText ? `REFERENCE MATERIAL:\n${assignment.uploadedFileText.substring(0, 3000)}` : ""}

RULES:
1. Group questions into logical sections (Section A, Section B, etc.)
2. Each section should have questions of a similar type
3. Total marks across all questions must equal exactly ${assignment.totalMarks}
4. Each section must have a clear instruction (e.g., "Attempt all questions", "Answer any 3 out of 5")
5. For MCQ questions, provide exactly 4 options labeled a), b), c), d)
6. Assign difficulty: easy, medium, or hard to each question
7. Questions should be academically rigorous and well-formed
8. Number questions sequentially across sections

RESPOND WITH ONLY VALID JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "title": "Question Paper - [Subject]",
  "subject": "${assignment.subject}",
  "topic": "${assignment.topic}",
  "totalMarks": ${assignment.totalMarks},
  "duration": "appropriate duration based on question count",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks.",
      "questions": [
        {
          "questionNumber": 1,
          "text": "Question text here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["a) Option 1", "b) Option 2", "c) Option 3", "d) Option 4"]
        }
      ]
    }
  ]
}`;

  // Generate a cache key based on the prompt
  const promptHash = crypto.createHash("md5").update(prompt).digest("hex");
  const cacheKey = `ai:prompt:${promptHash}`;
  
  let text = "";
  let usedCache = false;
  
  try {
    const redis = await getRedisClient();
    const cachedResponse = await redis.get(cacheKey);
    if (cachedResponse) {
      text = cachedResponse;
      usedCache = true;
      console.log(`⚡ Using cached AI response for assignment`);
    }
  } catch (error) {
    console.warn("Failed to check Redis cache for AI prompt", error);
  }

  if (!usedCache) {
    console.log(`🧠 Generating new AI response via OpenRouter...`);
    
    if (!config.openRouterApiKey) {
      throw new Error("OpenRouter API key is missing from environment variables.");
    }

    const freeModels = [
      'poolside/laguna-xs.2:free',
      'deepseek/deepseek-v4-flash:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemma-4-31b-it:free',
      'qwen/qwen3-coder:free',
      'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'
    ];

    let success = false;
    let lastError = null;

    for (const model of freeModels) {
      try {
        console.log(`⏳ Trying model: ${model}...`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.openRouterApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 429) {
            console.warn(`⚠️ Model ${model} hit rate limit (429). Trying next...`);
            lastError = new Error(`429 Too Many Requests on ${model}`);
            continue; // Try next model
          }
          throw new Error(`OpenRouter API failed with status ${response.status}: ${errText}`);
        }

        const data: any = await response.json();
        text = data.choices[0]?.message?.content || "";
        success = true;
        console.log(`✅ Successfully generated using ${model}`);
        break; // Stop looping on success
      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ Model ${model} failed: ${err.message}. Trying next...`);
        continue;
      }
    }

    if (!success) {
      console.error("❌ All fallback models failed.");
      throw lastError || new Error("Failed to generate response from all models.");
    }
    
    // Cache the new response for 7 days
    try {
      const redis = await getRedisClient();
      await redis.set(cacheKey, text, "EX", 60 * 60 * 24 * 7);
    } catch (error) {
      console.warn("Failed to cache AI response", error);
    }
  }

  // Clean potential markdown formatting
  let cleanedText = text.trim();
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith("```")) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  let parsed: GeneratedPaper;
  try {
    parsed = JSON.parse(cleanedText);
  } catch {
    console.error("Failed to parse AI response:", cleanedText.substring(0, 500));
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  // Validate and fix the response
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error("AI response missing sections array");
  }

  // Ensure all questions have required fields
  let questionNum = 1;
  for (const section of parsed.sections) {
    if (!section.questions) section.questions = [];
    for (const q of section.questions) {
      q.questionNumber = questionNum++;
      if (!q.difficulty) q.difficulty = "medium";
      if (!q.marks) q.marks = 1;
      if (!q.type) q.type = "short_answer";
    }
  }

  parsed.subject = assignment.subject;
  parsed.topic = assignment.topic;
  parsed.totalMarks = assignment.totalMarks;

  return parsed;
}

function getDifficultyDistribution(
  difficulty: string,
  totalQuestions: number
): string {
  switch (difficulty) {
    case "easy":
      return `All ${totalQuestions} questions should be Easy difficulty`;
    case "medium":
      return `All ${totalQuestions} questions should be Medium difficulty`;
    case "hard":
      return `All ${totalQuestions} questions should be Hard difficulty`;
    case "mixed":
    default: {
      const easy = Math.round(totalQuestions * 0.4);
      const medium = Math.round(totalQuestions * 0.4);
      const hard = totalQuestions - easy - medium;
      return `${easy} Easy, ${medium} Medium, ${hard} Hard questions`;
    }
  }
}
