const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.TEXT, unique: true, allowNull: false },
    displayName: { type: DataTypes.TEXT, allowNull: false, field: 'display_name', }
  }, {
    timestamps: false,
    
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  users.associate = function (models) {
  };

  return users;
};
