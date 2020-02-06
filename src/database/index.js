import Sequelize from 'sequelize';

import User from '../app/models/User';
import RecipientAddress from '../app/models/RecipientAddress';
import File from '../app/models/File';
import UserType from '../app/models/UserType';
import databaseConfig from '../config/database';

const models = [User, RecipientAddress, File, UserType];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
