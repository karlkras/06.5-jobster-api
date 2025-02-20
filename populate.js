import JobModel from "./models/Job.js";
import seedProducts from "./jobs.json" assert { type: "json" };
import dotenv from "dotenv";
import { MongoSeeder } from "./utils.js";

dotenv.config();

const start = async () => {
  const theRunner = new MongoSeeder(
    JobModel,
    seedProducts,
    process.env.MONGO_URI
  );
  await theRunner.run();
};

start();
