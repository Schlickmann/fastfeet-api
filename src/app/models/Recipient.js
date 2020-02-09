import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        phone: Sequelize.STRING,
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
