import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import Users from '../app/models/Users';
import Recipients from '../app/models/Recipients';
import Files from '../app/models/Files';
import Couriers from '../app/models/Couriers';
import Orders from '../app/models/Orders';
import databaseConfig from '../config/database';

const models = [Users, Recipients, Files, Couriers, Orders];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      `${process.env.MONGO_CONNECTION_STRING}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
      }
    );
  }
}

export default new Database();
