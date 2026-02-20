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
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zip: String
    },
    beltCustomization: {
      color: String,
      style: String
    }
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ petId: 1 });

export default mongoose.model("Order", orderSchema);
