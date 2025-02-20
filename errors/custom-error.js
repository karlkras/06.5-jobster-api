import { StatusCodes } from "http-status-codes";

export const CustomAPIError = class extends Error {
  constructor(msg, statusCode) {
    super(msg);
    this._statusCode = statusCode;
  }
  get statusCode() {
    return this._statusCode;
  }
};

const UnathenticatedError = class extends CustomAPIError {
  constructor(msg) {
    super(msg, StatusCodes.UNAUTHORIZED);
  }
};

const BadRequestError = class extends CustomAPIError {
  constructor(msg) {
    super(msg, StatusCodes.BAD_REQUEST);
  }
};

const NotFoundError = class extends CustomAPIError {
  constructor(msg) {
    super(msg, StatusCodes.NOT_FOUND);
  }
};

export const createAuthError = (msg) => {
  return new UnathenticatedError(msg);
};

export const createBadRequestError = (msg) => {
  return new BadRequestError(msg);
};

export const createNotFoundError = (msg) => {
  return new NotFoundError(msg);
};
