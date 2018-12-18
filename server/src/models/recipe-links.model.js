const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const recipeLinks = sequelizeClient.define('recipe_links', {
    sourceId: {
      type: DataTypes.BIGINT,
      field: 'source_id',
      unique: 'recipeLinkUniqueIndex',
      allowNull: false
    },
    destId: {
      type: DataTypes.BIGINT,
      field: 'dest_id',
      unique: 'recipeLinkUniqueIndex',
      allowNull: false
    }    
  }, {
    timestamps: false,

    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  recipeLinks.associate = function (models) {
    recipeLinks.belongsTo(models.recipes, { as: 'SourceRecipe', foreignKey: 'sourceId'});
    recipeLinks.belongsTo(models.recipes, { as: 'DestRecipe', foreignKey: 'destId'});
  };

  return recipeLinks;
};
