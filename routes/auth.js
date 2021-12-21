import express from "express";
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

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get(
  "/current-user",
  (req, res, next) => {
    console.log(req.cookies);
    if (!req.cookies.token) return res.json({ ok: false });
    next();
  },
  requireSignin,
  currentUser
);
router.get("/send-email", sendTestEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
