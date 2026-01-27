import mongoose from "mongoose";
import Pet from "../models/Pet";
import Order from "../models/Order";

export const publicScanPet = async (req: any, res: any) => {
  try {
    const { petId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "Invalid petId" });
    }

    // ✅ Check pet
    const pet = await Pet.findById(petId).select(
      "name age photo ownerName ownerEmail ownerMobile ownerWhatsapp"
    );

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // ✅ OPTIONAL (but recommended): ensure order is PAID
    const paidOrder = await Order.findOne({
      petId: pet._id,
      status: "PAID"
    });

    if (!paidOrder) {
      return res.status(403).json({
        message: "QR code not activated"
      });
    }

    res.json({
      success: true,
      pet
    });
  } catch (error) {
    res.status(500).json({ message: "Public scan failed" });
  }
};
