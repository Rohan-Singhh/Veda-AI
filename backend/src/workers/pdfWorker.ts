import { Worker, Job } from "bullmq";
import { getRedisClient } from "../utils/redis";
import { QuestionPaper } from "../models/QuestionPaper";
import { emitToAssignment } from "../socket/socketHandler";
import { setPdfJobState } from "../services/jobStateService";
import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import fs from "fs";

interface PdfJobData {
  assignmentId: string;
}

export async function startPdfWorker(): Promise<Worker> {
  const connection = await getRedisClient();

  const worker = new Worker<PdfJobData>(
    "pdf-generation",
    async (job: Job<PdfJobData>) => {
      const { assignmentId } = job.data;
      console.log(`Generating PDF for assignment: ${assignmentId}`);

      try {
        const paper = await QuestionPaper.findOne({ assignmentId });
        if (!paper) {
          throw new Error(`Question paper not found for assignment: ${assignmentId}`);
        }

        await setPdfJobState(assignmentId, {
          status: "processing",
          progress: 25,
        });
        emitToAssignment(assignmentId, "pdf:processing", { status: "processing" });

        const pdfDir = path.join(__dirname, "../../public/pdfs");
        if (!fs.existsSync(pdfDir)) {
          fs.mkdirSync(pdfDir, { recursive: true });
        }

        await setPdfJobState(assignmentId, {
          status: "processing",
          progress: 55,
        });
        const templatePath = path.join(__dirname, "../templates/pdfTemplate.ejs");
        const html = await ejs.renderFile(templatePath, { paper: paper.toJSON() });

        await setPdfJobState(assignmentId, {
          status: "processing",
          progress: 80,
        });
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "domcontentloaded" });

        const pdfPath = path.join(pdfDir, `${assignmentId}.pdf`);
        await page.pdf({
          path: pdfPath,
          format: "A4",
          margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
          printBackground: true,
        });

        await browser.close();

        const pdfUrl = `/pdfs/${assignmentId}.pdf`;
        await setPdfJobState(assignmentId, {
          status: "completed",
          progress: 100,
          url: pdfUrl,
        });

        emitToAssignment(assignmentId, "pdf:completed", {
          status: "completed",
          url: pdfUrl,
        });

        console.log(`PDF generated for assignment: ${assignmentId}`);
        return { url: pdfUrl };
      } catch (error: any) {
        console.error(`PDF generation failed for: ${assignmentId}`, error.message);
        await setPdfJobState(assignmentId, {
          status: "failed",
          progress: 100,
          errorMessage: error.message,
        });

        emitToAssignment(assignmentId, "pdf:failed", {
          status: "failed",
          error: error.message,
        });

        throw error;
      }
    },
    {
      connection: connection as any,
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Worker: PDF Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Worker: PDF Job ${job?.id} failed:`, err.message);
  });

  console.log("PDF worker started");
  return worker;
}
