import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type AdminJwtPayload = {
  role: "admin";
  username: string;
};

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.ADMIN_JWT_SECRET;

    if (!secret) {
      return res.status(500).json({ message: "ADMIN_JWT_SECRET is not configured" });
    }

    const decoded = jwt.verify(token, secret) as AdminJwtPayload;

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};