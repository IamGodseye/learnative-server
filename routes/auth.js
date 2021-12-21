import express from "express";
import { requireSignin } from "../middlewares";
const router = express.Router();
import optionHandler from "./../utils/auth";
import {
  register,
  login,
  logout,
  currentUser,
  sendTestEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth";

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/current-user", requireSignin, currentUser);
router.get("/send-email", sendTestEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
