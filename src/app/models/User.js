import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        phone: Sequelize.STRING,
        is_admin: Sequelize.BOOLEAN,
      },
      { sequelize }
    );

    // Generates password hash before saving user
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    this.hasMany(models.RecipientAddress, {
      as: 'recipient_addresses',
      foreignKey: 'user_id',
      onDelete: 'cascade',
      hooks: true,
    });
  }

  checkPassword(password) {
    if (!this.password_hash) return false;
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
