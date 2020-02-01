import Sequelize from 'sequelize';

import User from '../app/models/User';
import RecipientAddress from '../app/models/RecipientAddress';
import databaseConfig from '../config/database';

const models = { User, RecipientAddress };

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    Object.keys(models).forEach(model => {
      models[model].init(this.connection);
    });

    Object.keys(models).forEach(model => {
      if ('associate' in models[model]) {
        models[model].associate(models);
      }
    });
  }
}

export default new Database();
