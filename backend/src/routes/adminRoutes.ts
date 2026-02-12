import express from "express";
import {
  adminLogin,
  getAdminDashboard,
  getAdminUserDetails,
  getAdminUsers
} from "../controllers/adminController";
import { adminAuth } from "../middleware/adminAuth";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/dashboard", adminAuth, getAdminDashboard);
router.get("/users", adminAuth, getAdminUsers);
router.get("/users/:userId/details", adminAuth, getAdminUserDetails);

export default router;

