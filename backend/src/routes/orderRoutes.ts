import express from "express";
import { createOrder, getMyOrders ,verifyPayment } from "../controllers/orderController";

const router = express.Router();

router.post("/create", createOrder);
router.get("/my-orders", getMyOrders);
router.post("/verify-payment", verifyPayment);

export default router;
