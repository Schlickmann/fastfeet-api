import Sequelize, { Model } from 'sequelize';

class Orders extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
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
