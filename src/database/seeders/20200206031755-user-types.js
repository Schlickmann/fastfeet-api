module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'user_types',
      [
        {
          type: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          type: 'recipient',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          type: 'deliveryman',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
