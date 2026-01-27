import express from "express";
import { createPet, getMyPets } from "../controllers/petController";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/create", upload.single("photo"), createPet);
router.get("/my-pets", getMyPets);

export default router;
