import express from "express";
import {
  showLogin,
  showRegister,
  login,
  register,
  logout
} from "../controllers/authController.js";

const router = express.Router();

router.get("/", showLogin);
router.get("/register", showRegister);

router.post("/login", login);
router.post("/register", register);

router.get("/logout", logout);

export default router;
