import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();
const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

if (process.env.IS_DEV) {
  app.use(
    "",
    createProxyMiddleware({
      target: "http://localhost:5173",
      changeOrigin: true,
    }),
  );
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
