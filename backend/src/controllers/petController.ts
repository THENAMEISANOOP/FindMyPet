import Pet from "../models/Pet";
import User from "../models/User.model";
import cloudinary from "../utils/cloudinary";
import QRCode from "qrcode";


export const createPet = async (req: any, res: any) => {
  try {
    const { userId, name, age } = req.body;

    const user = await User.findById(userId);
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

    // 3️⃣ Generate QR with real petId
    const qrCode = await QRCode.toDataURL(
      `${process.env.CLIENT_URL}/scan/${pet._id}`
    );

    // 4️⃣ Save QR to pet
    pet.qrCode = qrCode;
    await pet.save();

    res.json({
      success: true,
      pet
    });
  } catch (error) {
    res.status(500).json({ message: "Pet creation failed" });
  }
};

/**
 * ✅ GET MY PETS (AUTO owner data included)
 */
export const getMyPets = async (req: any, res: any) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return res.status(404).json({ message: "User not found or not verified" });
    }

    const pets = await Pet.find({ userId: user._id }).sort({ createdAt: -1 });

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
    res.status(500).json({ message: "Failed to fetch pets" });
  }
};
