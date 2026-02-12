import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.model";
import Pet from "../models/Pet";
import Order from "../models/Order";

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.ADMIN_JWT_SECRET;

    if (!adminUsername || !adminPassword || !secret) {
      return res.status(500).json({ message: "Admin credentials are not configured" });
    }

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ role: "admin", username }, secret, {
      expiresIn: "12h"
    });

    return res.json({ success: true, token });
  } catch (error) {
    return res.status(500).json({ message: "Admin login failed" });
  }
};

export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const [usersCount, petsCount, paidOrdersCount, totalRevenueResult] = await Promise.all([
      User.countDocuments(),
      Pet.countDocuments(),
      Order.countDocuments({ status: "PAID" }),
      Order.aggregate([
        { $match: { status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const now = new Date();
    const startOfWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          status: "PAID",
          createdAt: { $gte: startOfWindow }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1
        }
      }
    ]);

    const monthMap = new Map<string, number>();
    revenueByMonth.forEach((entry) => {
      monthMap.set(`${entry.year}-${entry.month}`, entry.total);
    });

    const chart = Array.from({ length: 6 }).map((_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

      return {
        label: date.toLocaleString("en-US", { month: "short" }),
        total: monthMap.get(key) ?? 0
      };
    });

    return res.json({
      success: true,
      summary: {
        usersCount,
        petsCount,
        paidOrdersCount,
        totalRevenue: totalRevenueResult[0]?.total ?? 0
      },
      chart
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
};

export const getAdminUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();

    const userIds = users.map((user) => user._id);

    const [petCounts, paidOrderCounts] = await Promise.all([
      Pet.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { userId: { $in: userIds }, status: "PAID" } },
        { $group: { _id: "$userId", count: { $sum: 1 } } }
      ])
    ]);

    const petCountMap = new Map<string, number>(
      petCounts.map((entry) => [String(entry._id), entry.count])
    );
    const paidCountMap = new Map<string, number>(
      paidOrderCounts.map((entry) => [String(entry._id), entry.count])
    );

    return res.json({
      success: true,
      users: users.map((user) => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        whatsapp: user.whatsapp,
        isVerified: user.isVerified,
        petCount: petCountMap.get(String(user._id)) ?? 0,
        paidOrders: paidCountMap.get(String(user._id)) ?? 0
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load users" });
  }
};

export const getAdminUserDetails = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId || "");

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [pets, orders] = await Promise.all([
      Pet.find({ userId }).sort({ createdAt: -1 }).lean(),
      Order.find({ userId }).sort({ createdAt: -1 }).lean()
    ]);

    return res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        whatsapp: user.whatsapp,
        isVerified: user.isVerified
      },
      pets,
      orders
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load user details" });
  }
};

