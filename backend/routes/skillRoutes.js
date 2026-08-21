import express from "express";
import {
  addSkill,
  getSkills,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addSkill);
router.get("/", authMiddleware, getSkills);
router.put("/:id", authMiddleware, updateSkill);
router.delete("/:id", authMiddleware, deleteSkill);

export default router;