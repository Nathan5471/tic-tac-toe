import express from "express";
import { signup, login } from "../controllers/authController";
import authenticate from "../middleware/authenticate";
import type { AuthUser } from "../middleware/authenticate";

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

router.post("/logout", (req: any, res: any) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
});

router.get("/me", authenticate, (req: any, res: any) => {
  const user = req.user as AuthUser;
  return res.status(200).json({
    id: user.id,
    username: user.username,
    ongoingGames: [...user.games1, ...user.games2],
  });
});

export default router;
