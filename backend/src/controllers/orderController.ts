import mongoose from "mongoose";
import { Request, Response } from "express";
import crypto from "crypto";
import Order from "../models/Order";
import User from "../models/User.model";
import Pet from "../models/Pet";
import razorpay from "../utils/razorpay";
import { sendEmail } from "../utils/sendEmail";
import { getOrderConfirmationEmail } from "../utils/emailTemplates";
import QRCode from "qrcode";


//create

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, petId, type, shippingAddress, beltCustomization } = req.body;

    if (!userId || !petId || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (type === "QR_BELT" && (!shippingAddress || !beltCustomization)) {
      return res.status(400).json({ message: "Shipping address and belt customization are required for QR_BELT orders" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(petId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    if (!["QR_ONLY", "QR_BELT"].includes(type)) {
      return res.status(400).json({ message: "Invalid order type" });
    }

    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return res.status(404).json({ message: "User not verified" });
    }

    const pet = await Pet.findOne({ _id: petId, userId });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // 💰 PRICE MAP
    const PRICE_MAP: Record<string, number> = {
      QR_ONLY: 50,
      QR_BELT: 299
    };

    const amountInRupees = PRICE_MAP[type];
    const amountInPaise = amountInRupees * 100;

    // 🔹 CREATE RAZORPAY ORDER
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    const order = await Order.create({
      userId,
      petId,
      type,
      amount: amountInRupees,
      razorpayOrderId: razorpayOrder.id,
      status: "CREATED",
      shippingAddress,
      beltCustomization
    });

    res.json({
      success: true,
      razorpayOrder,
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order creation failed" });
  }
};


/**
 * ✅ GET MY ORDERS
 */
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query as { userId?: string };

    // 1️⃣ Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // 2️⃣ Validate user
    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return res
        .status(404)
        .json({ message: "User not found or not verified" });
    }

    // 3️⃣ Fetch orders
    const orders = await Order.find({ userId: user._id })
      .populate("petId", "name photo qrCode")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      owner: {
        name: user.username,
        email: user.email,
        mobile: user.mobile,
        whatsapp: user.whatsapp
      },
      orders
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "PAID";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 🏆 GENERATE QR CODE for the pet
    try {
      const pet = await Pet.findById(order.petId);
      if (pet) {
        const qrCode = await QRCode.toDataURL(
          `${process.env.CLIENT_URL}/scan/${pet._id}`
        );
        pet.qrCode = qrCode;
        await pet.save();
      }
    } catch (qrError) {
      console.error("QR Generation failed:", qrError);
    }

    // --- NOTIFICATIONS ---
    try {
      const user = await User.findById(order.userId);
      if (user) {
        // 1. Send Email
        const emailContent = getOrderConfirmationEmail(user.username, {
          amount: order.amount,
          date: new Date().toLocaleDateString(),
          items: order.type.replace("_", " "),
          type: order.type,
          shippingAddress: order.shippingAddress as any,
          beltCustomization: order.beltCustomization as any
        });
        const plainText = `Hi ${user.username}, Your order for ${order.type.replace("_", " ")} is confirmed. Amount: ${order.amount}.`;
        
        await sendEmail(user.email, "Order Confirmation - FindMyPet", plainText, emailContent);
      }
    } catch (notifyError) {
      console.error("Notification failed:", notifyError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: "Payment verified successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed" });
  }
};
