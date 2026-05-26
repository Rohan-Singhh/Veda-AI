import express from "express";
import cors from "cors";
import http from "http";
import { config } from "./utils/config";
import { connectDB } from "./utils/db";
import { initSocket } from "./socket/socketHandler";
import { startGenerationWorker } from "./workers/generationWorker";
import { getGenerationQueue } from "./queues/generationQueue";
import { getPdfQueue } from "./queues/pdfQueue";
import { startPdfWorker } from "./workers/pdfWorker";
import assignmentRoutes from "./routes/assignmentRoutes";
import { errorHandler } from "./middleware/errorHandler";
import path from "path";

async function main() {
  const app = express();
  const httpServer = http.createServer(app);

  // Middleware
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));

  // Static files for PDFs
  app.use("/pdfs", express.static(path.join(__dirname, "../public/pdfs")));

  // Routes
  app.get("/", (_req, res) => {
    res.json({ message: "VedaAI API Running", status: "ok" });
  });
  app.use("/api/assignments", assignmentRoutes);
  app.use(errorHandler);

  // Initialize services
  await connectDB();
  initSocket(httpServer);
  await getGenerationQueue();
  await startGenerationWorker();
  await getPdfQueue();
  await startPdfWorker();

  // Start server
  httpServer.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
