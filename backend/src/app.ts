import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import petRoutes from "./routes/petRoutes";
import orderRoutes from "./routes/orderRoutes";
import publicRoutes from "./routes/publicRoutes";
import adminRoutes from "./routes/adminRoutes";



const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/pet", petRoutes);
app.use("/api/order",orderRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);



export default app;
