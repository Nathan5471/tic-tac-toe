import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import matchSocket from "./socket/matchSocket";
import authRouter from "./routes/authRouter";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    credentials: true,
  },
});
const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

matchSocket(io);

app.use("/api/auth", authRouter);

if (process.env.IS_DEV) {
  app.use(
    "",
    createProxyMiddleware({
      target: "http://localhost:5173",
      changeOrigin: true,
    }),
  );
}

server.listen(3000, () => {
  console.log("Server is running on port 3000!");
});
