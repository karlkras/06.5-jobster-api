import startDb from "./db/connect.js";

export const MongoSeeder = class {
  constructor(mongoModel, seedJson, mongoUri) {
    this.mongoModel = mongoModel;
    this.mongoUri = mongoUri;
    this.seedJson = seedJson;
  }
  async run() {
    try {
      await startDb(this.mongoUri);
      await this.mongoModel.deleteMany();
      await this.mongoModel.create(this.seedJson);
      console.log("wahoo!");
      process.exit(0);
    } catch (err) {
      console.error(`Bad bad, ${err}`);
      process.exit(1);
    }
  }
};

export const MongoDBStatusCodes = Object.freeze({
  DUPLICATE: 11000
});
