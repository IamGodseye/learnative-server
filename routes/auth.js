import express from "express";
import cors from "cors";
import { requireSignin } from "../middlewares";
const router = express.Router();
import {
  register,
  login,
  logout,
  currentUser,
  sendTestEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth";

router.post("/register", cors(), register);
router.post("/login", cors(), login);
router.get("/logout", cors(), logout);
router.get("/current-user", cors(), requireSignin, currentUser);
router.get("/send-email", sendTestEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
