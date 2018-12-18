function joinWithRecipes(context) {
  const sequelize = context.app.get('sequelizeClient');
  const { recipes } = sequelize.models;

  // TODO: figure out how to only include title here, not entire recipe object
  context.params.sequelize = {
    include: [ { model: recipes, as: 'SourceRecipe' }, { model: recipes, as: 'DestRecipe' } ]
  }

  return context;
}

// Until we figure out the above TODO, filter the final result so that it only
// includes the fields we're interested in
function filterOutput(context) {
  let newData = context.result.data.map(recipe => {
    let newRecipe = (({ id, sourceId, destId }) => ({ id, sourceId, destId }))(recipe);
    newRecipe['sourceTitle'] = recipe['SourceRecipe.title'];
    newRecipe['destTitle'] = recipe['DestRecipe.title'];
    return newRecipe;
  });

  context.result.data = newData;
  return context;
}

module.exports = {
  before: {
    all: [],
    find: [joinWithRecipes],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [filterOutput],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
