const errors = require('@feathersjs/errors');
const qs = require('qs');

const SEARCH_FIELDS = [
  { field: 'any', column: 'document_vector', isVector: true }, 
  { field: 'ingredients', column: 'ingredients_vector', isVector: true },
  { field: 'serves', column: 'serves', isVector: false },
  { field: 'source', column: 'source_vector', isVector: true },
  { field: 'tags', column: 'tags_vector', isVector: true },
  { field: 'title', column: 'title_vector', isVector: true }
];

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

  // Create the raw database query, starting with the WHERE clause
  let fieldInfo = SEARCH_FIELDS.filter(entry => entry.field === field)[0];
  let whereClause = 'WHERE ';
  if (fieldInfo.isVector) {
    whereClause += `${fieldInfo.column} @@ to_tsquery(\'${keywords}\')`;
  }
  else {
    whereClause += `${fieldInfo.column} = ${keywords}`;
  }

  // Support parameters from Feathers database API
  let metaParams = qs.parse(context.params.query);
  let skipCount = (metaParams['$skip'] || 0);
  let limitCount = (metaParams['$limit'] || '10');
  let offsetClause = 'OFFSET ' + (metaParams['$skip'] || '0');
  let limitClause = 'LIMIT ' + (metaParams['$limit'] || 'ALL');
  // Default to all fields if this parameter isn't specified
  // Use a Postgres window function to get the total count even if we're using LIMIT and OFFSET clauses
  let columns = 'count(*) OVER() AS total, ' + (metaParams['$select'] ? metaParams['$select'].join(',') : '*');

  let orderByClause = '';
  let sortInfo = metaParams['$sort'];
  if (sortInfo) {
    let sortFields = Object.keys(sortInfo);
    orderByClause = 'ORDER BY ' + sortFields.map(sortKey => {
      let sortDir = sortInfo[sortKey] == 1 ? 'ASC' : 'DESC';
      return `${sortKey} ${sortDir}`;
    }).join(',');  
  }
  
  let selectStatement = `SELECT ${columns} FROM recipes ${whereClause} ${orderByClause} ${limitClause} ${offsetClause};`;

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
