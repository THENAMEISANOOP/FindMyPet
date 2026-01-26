import express from "express";
import { checkEmail, registerUser, sendLoginOTP, verifyOTP } from "../controllers/authController";

const router = express.Router();

router.post("/check-email", checkEmail);
router.post("/register", registerUser);
router.post("/login", sendLoginOTP);
router.post("/verify-otp", verifyOTP);

export default router;
