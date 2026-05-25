import { Router } from "express";
import {
  createAssignment,
  getAssignment,
  getAllAssignments,
  getQuestionPaper,
  regeneratePaper,
  generatePdf,
  deleteAssignment,
} from "../controllers/assignmentController";

const router = Router();

router.post("/", createAssignment);
router.get("/", getAllAssignments);
router.get("/:id", getAssignment);
router.delete("/:id", deleteAssignment);
router.get("/:id/paper", getQuestionPaper);
router.post("/:id/regenerate", regeneratePaper);
router.post("/:id/pdf", generatePdf);

export default router;
