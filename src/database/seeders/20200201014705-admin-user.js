const bcrypt = require('bcryptjs');

module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'users',
      [
        {
          name: 'FastFeet Distributor',
          email: 'admin@fastfeet.com',
          password_hash: bcrypt.hashSync('123456', 8),
          phone: '+1(778)751-3207',
          user_type_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
