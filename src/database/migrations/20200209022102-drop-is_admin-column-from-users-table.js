module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('users', 'is_admin');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
};
