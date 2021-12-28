import express from "express";
import { requireSignin } from "../middlewares";
const router = express.Router();
import { currentAdmin, totalStudents } from "./../controllers/admin";
router.get("/current-admin", requireSignin, currentAdmin);
router.get("/total-students", requireSignin, totalStudents);
module.exports = router;
