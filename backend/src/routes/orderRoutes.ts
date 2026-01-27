import express from "express";
import { createOrder, getMyOrders } from "../controllers/orderController";

const router = express.Router();

router.post("/create", createOrder);
router.get("/my-orders", getMyOrders);

export default router;
