import { createAuthError } from "../errors/custom-error.js";
import jwToken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createAuthError("Missing or bad access token");
  }

  const theToken = authHeader.split(" ")[1];
  try {
    const decoded = jwToken.verify(theToken, process.env.JWT_SECRET);
    const { userId } = decoded;
    const testUser = userId === "67b3fb2dd6ae5071fca87459";
    req.user = { userId, testUser };
  } catch (err) {
    throw createAuthError("Not authorize to access service");
  }
  next();
};

export default auth;
