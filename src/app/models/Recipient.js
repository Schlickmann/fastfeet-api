import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        country: Sequelize.STRING,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.STRING,
        complement: Sequelize.STRING,
        zip_code: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }
}

export default Recipient;
