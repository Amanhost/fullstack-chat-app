import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import cors from "cors";
import path from "path";
import messageRoutes from "./routes/message.route.js";
import { connectionDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";

dotenv.config();
// const app = express();    removwed due to implementation of socket.io

const PORT = process.env.PORT;
const _dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(_dirname, "../frontendchat/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(_dirname, "../frontendchat", "dist", "index.html"));
  });
}
server.listen(PORT, () => {
  console.log("SERVER runining on port", PORT);
  connectionDB();
});
