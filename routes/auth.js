import express from "express";
import { requireSignin } from "../middlewares";
const router = express.Router();
import cors from "cors";
import {
  register,
  login,
  logout,
  currentUser,
  sendTestEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth";

router.post("/register", cors(corsOptions), register);
router.post("/login", cors(corsOptions), login);
router.get("/logout", cors(corsOptions), logout);

router.get("/current-user", cors(corsOptions), requireSignin, currentUser);
router.get("/send-email", cors(corsOptions), sendTestEmail);
router.post("/forgot-password", cors(corsOptions), forgotPassword);
router.post("/reset-password", cors(corsOptions), resetPassword);

module.exports = router;
