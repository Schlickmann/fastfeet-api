import Sequelize, { Model } from 'sequelize';

class UserType extends Model {
  static init(sequelize) {
    super.init(
      {
        type: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }
}

export default UserType;
