import express from "express";
import { publicScanPet } from "../controllers/publicController";

const router = express.Router();

router.get("/scan/:petId", publicScanPet);

export default router;
