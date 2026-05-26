import { GeneratedPaper, generatedPaperSchema } from "../validators/questionPaperValidator";

export function sanitizeGeneratedPaper(
  rawPaper: unknown,
  expected: {
    subject: string;
    topic: string;
    totalMarks: number;
    numberOfQuestions: number;
  }
): GeneratedPaper {
  const parsed = generatedPaperSchema.parse(rawPaper);

  let questionNumber = 1;
  parsed.sections = parsed.sections
    .map((section) => ({
      ...section,
      questions: section.questions.map((question) => ({
        ...question,
        questionNumber: questionNumber++,
        difficulty: question.difficulty || "medium",
        marks: question.marks || 1,
      })),
    }))
    .filter((section) => section.questions.length > 0);

  parsed.subject = expected.subject;
  parsed.topic = expected.topic;
  parsed.totalMarks = expected.totalMarks;

  if (questionNumber - 1 !== expected.numberOfQuestions) {
    throw new Error(
      `AI generated ${questionNumber - 1} questions, expected ${expected.numberOfQuestions}`
    );
  }

  rebalanceMarks(parsed, expected.totalMarks);
  return generatedPaperSchema.parse(parsed);
}

function rebalanceMarks(paper: GeneratedPaper, targetTotal: number): void {
  const questions = paper.sections.flatMap((section) => section.questions);
  if (questions.length === 0) {
    throw new Error("Generated paper has no questions");
  }

  let currentTotal = questions.reduce((sum, question) => sum + question.marks, 0);

  if (currentTotal === targetTotal) {
    return;
  }

  while (currentTotal < targetTotal) {
    const index = (targetTotal - currentTotal - 1) % questions.length;
    questions[index].marks += 1;
    currentTotal += 1;
  }

  while (currentTotal > targetTotal) {
    const question = [...questions].reverse().find((item) => item.marks > 1);
    if (!question) {
      throw new Error("Unable to rebalance marks without assigning zero marks");
    }

    question.marks -= 1;
    currentTotal -= 1;
  }
}
