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
var corsOptions = {
  origin: "https://learnative-client.vercel.app",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
router.post("/register", cors(corsOptions), register);
router.post("/login", cors(corsOptions), login);
router.get("/logout", logout);

router.get("/current-user", cors(corsOptions), currentUser);
router.get("/send-email", sendTestEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
