const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const recipes = sequelizeClient.define('recipes', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    source: DataTypes.TEXT,
    title: { type: DataTypes.TEXT, allowNull: false },
    ingredients: { type: DataTypes.TEXT, allowNull: false },
    preparation: { type: DataTypes.TEXT, allowNull: false },
    notes: DataTypes.TEXT,
    serves: DataTypes.INTEGER,
    caloriesPerServing: { type: DataTypes.INTEGER, field: 'calories_per_serving' },
    data: { type: DataTypes.JSONB, defaultValue: '{}' }
  }, {
    timestamps: true,
    createdAt: 'creation_time',
    updatedAt: 'modified_time',

    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  recipes.associate = function (models) {
  };

  return recipes;
};
