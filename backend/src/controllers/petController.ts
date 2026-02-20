import { Request, Response, NextFunction } from "express";
import Pet from "../models/Pet";
import User from "../models/User.model";
import cloudinary from "../utils/cloudinary";

export const createPet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, name, age } = req.body;

    const user = await User.findById(userId).lean();
    if (!user || !user.isVerified) {
      return res.status(404).json({ message: "User not found or not verified" });
    }

    // 1️⃣ Upload image
    let imageUrl = "";
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path);
      imageUrl = upload.secure_url;
    }

    // 2️⃣ Create pet FIRST (no qr yet)
    const pet = await Pet.create({
      userId: user._id,
      name,
      age,
      photo: imageUrl,

      ownerName: user.username,
      ownerEmail: user.email,
      ownerMobile: user.mobile,
      ownerWhatsapp: user.whatsapp
    });

    res.json({
      success: true,
      pet
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ GET MY PETS (AUTO owner data included)
 */
export const getMyPets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId).lean();
    if (!user || !user.isVerified) {
      return res.status(404).json({ message: "User not found or not verified" });
    }

    const pets = await Pet.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      owner: {
        name: user.username,
        email: user.email,
        mobile: user.mobile,
        whatsapp: user.whatsapp
      },
      pets
    });
  } catch (error) {
    next(error);
  }
};
