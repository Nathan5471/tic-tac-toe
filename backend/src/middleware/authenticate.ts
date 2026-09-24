import jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import { Prisma } from "../generated/prisma/client";

export type AuthUser = Prisma.UserGetPayload<{
  include: {
    games1: true;
    games2: true;
  };
}>;

const authenticate = async (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    return res.status(500).json({ message: "Failed to authenticate" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        games1: { where: { status: "IN_PROGRESS" } },
        games2: { where: { status: "IN_PROGRESS" } },
      },
    });
    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authenticate;
