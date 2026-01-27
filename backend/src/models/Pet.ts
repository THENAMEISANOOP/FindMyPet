import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: { type: String, required: true },
  age: { type: Number },
  photo: String,

  ownerName: String,
  ownerEmail: String,
  ownerMobile: String,
  ownerWhatsapp: String,

  qrCode: String
}, { timestamps: true });

export default mongoose.model("Pet", petSchema);
