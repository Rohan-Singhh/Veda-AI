import { Router } from "express";
import {
  createAssignment,
  getAssignment,
  getAllAssignments,
  getAssignmentStatus,
  getQuestionPaper,
  regeneratePaper,
  generatePdf,
  deleteAssignment,
} from "../controllers/assignmentController";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateObjectIdParam } from "../middleware/validateObjectId";

const router = Router();
const validateAssignmentId = validateObjectIdParam("id");

router.post("/", asyncHandler(createAssignment));
router.get("/", asyncHandler(getAllAssignments));
router.get("/:id/status", validateAssignmentId, asyncHandler(getAssignmentStatus));
router.get("/:id/paper", validateAssignmentId, asyncHandler(getQuestionPaper));
router.post("/:id/regenerate", validateAssignmentId, asyncHandler(regeneratePaper));
router.post("/:id/pdf", validateAssignmentId, asyncHandler(generatePdf));
router.get("/:id", validateAssignmentId, asyncHandler(getAssignment));
router.delete("/:id", validateAssignmentId, asyncHandler(deleteAssignment));

export default router;
