import { StatusCodes } from "http-status-codes";
import { MongoDBStatusCodes } from "../utils.js";

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, try again later"
  };

  if (err.name && err.name === "MongoServerError") {
    switch (err.code) {
      case MongoDBStatusCodes.DUPLICATE:
        customError.statusCode = StatusCodes.BAD_REQUEST;
        customError.msg = `The ${Object.keys(err.keyValue)[0]} - '${
          Object.values(err.keyValue)[0]
        }', already in use.`;
        break;
      default:
      // do nothing for now.
    }
  }

  if (err.name && err.name === "ValidationError") {
    customError.statusCode = StatusCodes.BAD_REQUEST;

    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (err.name && err.name === "CastError") {
    customError.statusCode = StatusCodes.NOT_FOUND;
    customError.msg = `Item with value of ${err.value} not found.`;
  }

  //return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
