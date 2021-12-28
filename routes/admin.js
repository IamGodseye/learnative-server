import express from "express";
import { requireSignin } from "../middlewares";
const router = express.Router();
import { currentAdmin } from "./../controllers/admin";
router.get("/current-admin", requireSignin, currentAdmin);

module.exports = router;
