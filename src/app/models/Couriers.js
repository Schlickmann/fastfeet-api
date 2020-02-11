import Sequelize, { Model } from 'sequelize';

class Couriers extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        phone: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Files, { as: 'avatar', foreignKey: 'avatar_id' });
  }
}

export default Couriers;
