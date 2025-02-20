import { createBadRequestError } from "../errors/custom-error.js";

const testUser = (req, res, next) => {
  if (req.user.testUser) {
    throw createBadRequestError("Test User is read only");
  }
  next();
};

export default testUser;
