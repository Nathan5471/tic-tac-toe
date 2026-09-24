import prisma from "../prisma/client";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken";

export const signup = async (req: any, res: any) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const token = generateToken(newUser.id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({ error: "Failed to sign up user" });
  }
};

export const login = async (req: any, res: any) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Username or password is incorrect" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(400)
        .json({ error: "Username or password is incorrect" });
    }

    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ error: "Failed to log in user" });
  }
};
