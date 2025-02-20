import express from "express";
import {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats
} from "../controllers/jobs.js";
import testUserMiddleware from "../middleware/testUser.js";

const router = express.Router();

router.route("/").get(getAllJobs).post(testUserMiddleware, createJob);
router.route("/stats").get(showStats);
router
  .route("/:id")
  .get(getJob)
  .delete(testUserMiddleware, deleteJob)
  .patch(testUserMiddleware, updateJob);

export default router;
