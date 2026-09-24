import express from "express";
import { signup, login } from "../controllers/authController";

const router = express.Router();

router.post("/signup", async (req: any, res: any) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  await signup(req, res);
});

router.post("/login", async (req: any, res: any) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  await login(req, res);
});

export default router;
