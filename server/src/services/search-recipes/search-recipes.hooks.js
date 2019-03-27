const errors = require('@feathersjs/errors');
const qs = require('qs');
const { checkWithSavedRecipesParam } = require('../helpers/check-params');

const SEARCH_FIELDS = [
  { field: 'any', column: 'document_vector', isVector: true }, 
  { field: 'ingredients', column: 'ingredients_vector', isVector: true },
  { field: 'serves', column: 'serves', isVector: false },
  { field: 'source', column: 'source_vector', isVector: true },
  { field: 'tags', column: 'tags_vector', isVector: true },
  { field: 'title', column: 'title_vector', isVector: true }
];

// TODO: get these column names programatically
const SAVED_RECIPE_TABLE_COLUMNS = ['id', 'user_id', 'recipe_id', 'type', 'value'];

// Helper function to convert snake case (e.g. recipe_id) to camel case (e.g. recipeId)
// Taken from https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript
const snakeToCamelCase = (s) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

function buildSearchQuery(context) {
  let { keywords, field } = context.params.query;
  if (!keywords) {
    throw new errors.BadRequest('keywords field is required');
  }
  if(!field) {
    throw new errors.BadRequest('field field is required');
  }

  // Make sure the field name is valid
  const validFieldNames = SEARCH_FIELDS.map(entry => entry.field);
  if (!validFieldNames.includes(field)) {
    throw new errors.BadRequest(`${field} is not a valid search field.`);
  }

  // Aliases to use in the query
  const RECIPE_TABLE_ALIAS = 'r';
  const SAVED_RECIPE_TABLE_ALIAS = 'sr';

  // Create the raw database query, starting with the WHERE clause
  let fieldInfo = SEARCH_FIELDS.filter(entry => entry.field === field)[0];
  let whereClause = 'WHERE ';
  if (fieldInfo.isVector) {
    whereClause += `${fieldInfo.column} @@ plainto_tsquery(\'${keywords}\')`;
  }
  else {
    whereClause += `${fieldInfo.column} = ${keywords}`;
  }

  let metaParams = qs.parse(context.params.query);
  let { withSavedRecipes } = metaParams;
  checkWithSavedRecipesParam(metaParams);
  // Add inner join clause to query if we need to filter by saved recipes
  if (withSavedRecipes) {  
    whereClause += ` AND ${RECIPE_TABLE_ALIAS}.id = ${SAVED_RECIPE_TABLE_ALIAS}.recipe_id AND ${SAVED_RECIPE_TABLE_ALIAS}.type = '${withSavedRecipes}' AND ${SAVED_RECIPE_TABLE_ALIAS}.value = 'true'`;
  }

  // Support parameters from Feathers database API
  let skipCount = (metaParams['$skip'] || 0);
  let limitCount = (metaParams['$limit'] || '10');
  let offsetClause = 'OFFSET ' + (metaParams['$skip'] || '0');
  let limitClause = 'LIMIT ' + (metaParams['$limit'] || 'ALL');

  // Build SELECT clause, including saved_recipes columns if withSavedRecipes query parameter is specified
  // If we include saved_recipes columns, format them as savedRecipe.<COLUMN_NAME> for compatibility with recipes endpoint
  // Use a Postgres window function to get the total count even if we're using LIMIT and OFFSET clauses
  let selectClause = 'SELECT count(*) OVER() AS total, ';
  let fieldsToInclude = metaParams['$select'];
  if (fieldsToInclude) {
    let fieldsWithRecipeAlias = fieldsToInclude.map(field => {
      return `${RECIPE_TABLE_ALIAS}.${field}`;
    });
    selectClause += fieldsWithRecipeAlias.join(',');
  }
  else {
    selectClause += `${RECIPE_TABLE_ALIAS}.*`;
  }
  if (withSavedRecipes) {
    SAVED_RECIPE_TABLE_COLUMNS.forEach(column => {
      let camelCaseColumnName = snakeToCamelCase(column);
      selectClause += `, ${SAVED_RECIPE_TABLE_ALIAS}.${column} AS "savedRecipe.${camelCaseColumnName}"`;
    });
  }
  selectClause += ` FROM recipes AS ${RECIPE_TABLE_ALIAS}`;
  if (withSavedRecipes) {
    selectClause += `, saved_recipes AS ${SAVED_RECIPE_TABLE_ALIAS}`;
  }

  let orderByClause = '';
  let sortInfo = metaParams['$sort'];
  if (sortInfo) {
    let sortFields = Object.keys(sortInfo);
    orderByClause = 'ORDER BY ' + sortFields.map(sortKey => {
      let sortDir = sortInfo[sortKey] == 1 ? 'ASC' : 'DESC';
      return `${sortKey} ${sortDir}`;
    }).join(',');  
  }
  
  let selectStatement = `${selectClause} ${whereClause} ${orderByClause} ${limitClause} ${offsetClause};`;

  const sequelize = context.app.get('sequelizeClient');
  return sequelize.query(selectStatement).then(results => {
    // If we have results, get the total from the result set, and pull that data out of the result set
    // Otherwise, return a total of 0
    let totalCount = 0;
    if (results[0].length > 0) {
      let objWithTotal = results[0][0];
      totalCount = objWithTotal.total;
      delete objWithTotal.total;
    }
    context.result = {
      total: totalCount,
      limit: limitCount,
      skip: skipCount,
      data: results[0]
    };
    return context;
  });
}

module.exports = {
  before: {
    all: [],
    find: [buildSearchQuery],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
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
