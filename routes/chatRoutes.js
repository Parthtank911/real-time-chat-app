
import express from "express";
import { chatPage, users, fetchMessages } from "../controllers/chatController.js";

const router = express.Router();

router.get("/", chatPage);
router.get("/users", users);
router.get("/fetch", fetchMessages);

export default router;
