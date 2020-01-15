
export const up = (queryInterface, Sequelize) => queryInterface.createTable('Rooms', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  accommodationId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { // Room belongsTo Accommodation 1:1
      model: 'Accommodation',
      key: 'id'
    }
  },
  roomType: {
    type: Sequelize.STRING
  },
  numberOfPeople: {
    type: Sequelize.INTEGER
  },
  numberOfRooms: {
    type: Sequelize.INTEGER
  },
  roomPrice: {
    type: Sequelize.DECIMAL(10, 2)
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE
  }
});

export const down = (queryInterface) => queryInterface.dropTable('Rooms');
