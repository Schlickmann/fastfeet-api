import Sequelize, { Model } from 'sequelize';

class Orders extends Model {
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
    this.belongsTo(models.Couriers, {
      as: 'deliveryman',
      foreignKey: 'deliveryman_id',
    });
    this.belongsTo(models.Recipients, {
      as: 'recipient',
      foreignKey: 'recipient_id',
    });
    this.belongsTo(models.Files, {
      as: 'signature',
      foreignKey: 'signature_id',
    });
  }
}

export default Orders;
