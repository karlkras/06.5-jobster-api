import { StatusCodes } from "http-status-codes";
import UserModel from "../models/User.js";
import {
  createAuthError,
  createBadRequestError
} from "../errors/custom-error.js";

export const register = async (req, res, next) => {
  const user = await UserModel.create({ ...req.body });

  const token = user.generateToken();
  const { name, lastName, email, location } = user;
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name, lastName, email, location, token } });
};

export const updateUser = async (req, res, next) => {
  const { email, name, lastName, location } = req.body;
  if (!email && !name && !lastName && !location) {
    throw createBadRequestError("nothing to update");
  }

  const {
    user: { userId }
  } = req;

  const user = await UserModel.findOne({ _id: userId });
  user.location = location ?? user.location;
  user.lastName = lastName ?? user.lastName;
  user.name = name ?? user.name;
  user.email = email ?? user.email;

  await user.save();
  const token = user.generateToken();

  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      lastName: user.lastName,
      location: user.location,
      email: user.email,
      token
    }
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw createBadRequestError(
      "Password and Email are required to login. Try again"
    );
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw createAuthError("User not found");
  }

  if (await user.comparePassword(password)) {
    const token = user.generateToken();
    const { name, lastName, email, location } = user;
    res
      .status(StatusCodes.OK)
      .json({ user: { name, lastName, email, location, token } });
  } else {
    throw createAuthError("Bad credentials");
  }
};
