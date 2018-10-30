import React, { Component } from 'react';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import TableCell from '@material-ui/core/TableCell';
import DeleteIcon from '@material-ui/icons/Delete';
import SortablePaginatedTable from './SortablePaginatedTable';
import { getSorting } from '../utils/SortUtils';

const HEADER_ROWS = [
    { id: 'title', numeric: false, disablePadding: true, label: 'Title' },
    { id: 'source', numeric: false, disablePadding: false, label: 'Source' },
    { id: 'serves', numeric: true, disablePadding: false, label: 'Serves' },
    { id: 'tags', numeric: false, disablePadding: false, label: 'Tags' },
    { id: 'modified_time', numeric: false, disablePadding: false, label: 'Last Modified' },
];
          
const DATA = [
  {
    "id": "1",
    "source": "Cooking Light, August 2018",
    "title": "Thai Peach Punch",
    "serves": 4,
    "data": '{ "tags": [ { "id": 2, "name": "Drink" }, { "id": 5, "name": "Summer" } ]}',
    "modified_time": "2018-08-31T00:05:50.162Z"
  },
  {
    "id": "2",
    "source": "Cooking Light, July 2018",
    "title": "Chicken With Honey-Bourbon Glaze",
    "serves": 6,
    "data": '{ "tags": [ { "id": 3, "name": "Chicken" } ]}',
    "modified_time": "2018-08-29T19:14:50.162Z"
  },
  {
    "id": "3",
    "source": "New York Times",
    "title": "Recipe With A Very Long Title That Will Test Word Wrapping In The Recipe Table",
    "serves": 4,
    "data": '{ "tags": []}',
    "modified_time": "2018-08-15T14:34:50.162Z"
  },
  {
    "id": "4",
    "source": "Cooking Light, March 2018",
    "title": "Matzoh Brie",
    "serves": 8,
    "data": '{ "tags": [ { "id": 12, "name": "Passover" } ]}',
    "modified_time": "2018-04-04T07:26:50.162Z"
  },
  {
    "id": "5",
    "source": "Bon Appetit, July 2018",
    "title": "Tahini-Ginger Ice Cream",
    "serves": 12,
    "data": '{ "tags": [ { "id": 7, "name": "Dessert" }, { "id": 5, "name": "Summer" }, { "id": 17, "name": "Middle Eastern" }, { "id": 21, "name": "Fusion" } ]}',
    "modified_time": "2018-07-15T15:43:50.162Z"
  },
  {
    "id": "6",
    "source": "Cooking Light, February 2017",
    "title": "Grilled Cheese Sandwich",
    "serves": 1,
    "data": '{ "tags": [ { "id": 9, "name": "Cheese" } ]}',
    "modified_time": "2017-03-11T23:53:50.162Z"
  },
];
  
class RecipeTable extends Component {
  // Take tag data from JSON payload and convert it to alphabetized comma-delimited string
    processTags = data => {
      let tagStr = '';
      let sortedTags = data.tags.sort(getSorting('asc', 'name'));
      sortedTags.forEach(function(tagInfo) {
        tagStr += tagInfo.name + ', ';
      });
      // Remove the trailing newlines
      let tagsLen = tagStr.length;
      tagStr = tagStr.substring(0, tagsLen - 2);

      return tagStr;
    };

    // Render a row in the recipe table
    renderRecipeRow = row => {
      return (
        <React.Fragment>
          <TableCell component="th" scope="row" padding="none">
            <Link to={`/recipes/${row.id}`}>
              {row.title}
            </Link>
          </TableCell>
          <TableCell>{row.source}</TableCell>
          <TableCell numeric>{row.serves}</TableCell>
          <TableCell>{this.processTags(JSON.parse(row.data))}</TableCell>
          <TableCell>
          <Moment format="YYYY-MM-DD h:mm A">
            {row.modified_time}
          </Moment>
          </TableCell>
        </React.Fragment>
      );
    };

    render() {
      return (
        <SortablePaginatedTable
          order='asc'
          orderBy='title'
          rowsPerPage={10}
          data={DATA}
          headerRows={HEADER_ROWS}
          rowRenderFunc={this.renderRecipeRow}
          title='Recipes'
          removeLabel='Delete'
          removeIcon={<DeleteIcon />}
        />
      );
    }
}
  
export default RecipeTable;