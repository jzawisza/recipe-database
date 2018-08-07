const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const userFavorites = sequelizeClient.define('user_favorites', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.BIGINT,
      field: 'user_id',
      unique: 'userFavoriteUniqueIndex',
      allowNull: false
    },
    recipeId: {
      type: DataTypes.BIGINT,
      field: 'recipe_id',
      unique: 'userFavoriteUniqueIndex',
      allowNull: false
    }
  }, {
    timestamps: false,
    
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    },

    classMethods: {
      associate(models) {
        userFavorites.userId.associate(models.users);
        userFavorites.recipeId.associate(models.recipes);
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  userFavorites.associate = function (models) {
  };

  return userFavorites;
};
