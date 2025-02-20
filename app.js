import dotenv from "dotenv";
import path from "path";
import "express-async-errors";
import { xss } from "express-xss-sanitizer";
import express from "express";
import connectDb from "./db/connect.js";
import authMiddleware from "./middleware/auth.js";
import helmet from "helmet";

const app = express();
dotenv.config();

import authRouter from "./routes/auth.js";
import jobsRouter from "./routes/jobs.js";

// error handler
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";

app.set("trust proxy", 1);

app.use(express.static(path.join(import.meta.dirname, "./client/build")));
app.use(express.json());
app.use(helmet());
app.use(xss());

// extra packages

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/jobs", authMiddleware, jobsRouter);

app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(import.meta.dirname, "./client/build", "index.html")
  );
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = (async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error(`Failed to connect to db - ${err}`);
  }
})();
