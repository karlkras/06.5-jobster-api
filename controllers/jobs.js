import { StatusCodes } from "http-status-codes";
import JobModel from "../models/Job.js";
import {
  createBadRequestError,
  createNotFoundError
} from "../errors/custom-error.js";
import moment from "moment/moment.js";
import mongoose from "mongoose";

export const getAllJobs = async (req, res, next) => {
  const { search, sort, status, jobType } = req.query;
  const queryObj = {
    createdBy: req.user.userId
  };

  if (search) {
    queryObj.position = { $regex: search, $options: "i" };
  }

  if (status && status !== "all") {
    queryObj.status = status;
  }

  if (jobType && jobType !== "all") {
    queryObj.jobType = jobType;
  }

  let theJobSearch = JobModel.find(queryObj);

  switch (sort) {
    case "latest":
      theJobSearch = theJobSearch.sort("-createdAt");
      break;
    case "oldest":
      theJobSearch = theJobSearch.sort("createdAt");
      break;
    case "a-z":
      theJobSearch = theJobSearch.sort("position");
      break;
    case "z-a":
      theJobSearch = theJobSearch.sort("-position");
      break;
    default:
      throw createBadRequestError(`${sort} not recognized as valid option.`);
  }

  const page = req.query.page ?? 1;
  const limit = req.query.limit ?? 10;
  const skip = (page - 1) * limit;

  theJobSearch = theJobSearch.skip(skip).limit(limit);

  const jobs = await theJobSearch;

  const totalJobs = await JobModel.countDocuments(queryObj);
  const numOfPages = Math.ceil(totalJobs / limit);
  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

export const getJob = async (req, res, next) => {
  const {
    user: { userId },
    params: { id: jobId }
  } = req;
  const job = await JobModel.findOne({
    _id: jobId,
    createdBy: userId
  });
  if (!job) {
    throw createNotFoundError("Job not found");
  }
  res.status(StatusCodes.OK).json({ job });
};

export const createJob = async (req, res, next) => {
  const { position, company } = req.body;
  if (!position || !company) {
    throw createBadRequestError("company and position values are required");
  }
  req.body.jobLocation = req.body.jobLocation ?? req.params.user.location;
  const aJob = await JobModel.create({
    ...req.body,
    createdBy: req.user.userId
  });
  res.status(StatusCodes.CREATED).json({ aJob });
};

export const showStats = async (req, res, next) => {
  let stats = await JobModel.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  stats = stats.reduce((acc, cur) => {
    const { _id: title, count } = cur;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending ?? 0,
    interview: stats.interview ?? 0,
    declined: stats.declined ?? 0
  };

  let monthlyApplications = await JobModel.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 }
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MM Y");
      return { date, count };
    })
    .reverse();

  console.log(monthlyApplications);

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

export const updateJob = async (req, res, next) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId }
  } = req;

  if (!position && !company) {
    throw createBadRequestError("Requires position and/or company to update");
  }

  const filter = {
    _id: jobId,
    createdBy: userId
  };

  //const updateItems = { company, position };
  const job = await JobModel.findOneAndUpdate(filter, req.body, {
    returnOriginal: false
  });

  if (!job) {
    throw createNotFoundError("Job not found");
  }

  res.status(StatusCodes.OK).json({ job });
};

export const deleteJob = async (req, res, next) => {
  const {
    user: { userId },
    params: { id: jobId }
  } = req;

  const filter = {
    _id: jobId,
    createdBy: userId
  };

  const job = await JobModel.findOneAndDelete(filter);

  if (!job) {
    throw createNotFoundError("Job not found");
  }

  res.status(StatusCodes.OK).send("Job Deleted");
};
