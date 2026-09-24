import prisma from "../prisma/client";
import jwt from "jsonwebtoken";

const socketAuthenticate = async (token: string) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    throw new Error("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      include: {
        games1: true,
        games2: true,
      },
    });
    if (!user) {
      throw new Error("Unauthorized");
    }
    return user;
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

export default socketAuthenticate;
