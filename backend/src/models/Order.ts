import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true
    },

    type: {
      type: String,
      enum: ["QR_ONLY", "QR_BELT"],
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["CREATED", "PAID", "SHIPPED"],
      default: "CREATED"
    },

    
    razorpayOrderId: {
      type: String
    },

    razorpayPaymentId: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
