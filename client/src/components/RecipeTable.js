import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import { lighten } from '@material-ui/core/styles/colorManipulator';

// NOTE: this code is adapted from the Material UI table samples at
// https://material-ui.com/demos/tables/

const headerRows = [
    { id: 'title', numeric: false, disablePadding: true, label: 'Title' },
    { id: 'source', numeric: false, disablePadding: false, label: 'Source' },
    { id: 'serves', numeric: true, disablePadding: false, label: 'Serves' },
    { id: 'tags', numeric: false, disablePadding: false, label: 'Tags' },
    { id: 'modified_time', numeric: false, disablePadding: false, label: 'Last Modified' },
];

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}
  
class RecipeTableHead extends React.Component {
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const { order, orderBy } = this.props;

        return (
            <TableHead>
                <TableRow>
                  <TableCell key='checkboxPadding' />
                {headerRows.map(row => {
                    return (
                    <TableCell
                        key={row.id}
                        numeric={row.numeric}
                        padding={row.disablePadding ? 'none' : 'default'}
                        sortDirection={orderBy === row.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === row.id}
                            direction={order}
                            onClick={this.createSortHandler(row.id)}
                        >
                            {row.label}
                        </TableSortLabel>
                    </TableCell>
                    );
                }, this)}
                </TableRow>
            </TableHead>
        );
    }
}
  
RecipeTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
};

const toolbarStyles = theme => ({
    root: {
      paddingRight: theme.spacing.unit,
    },
    highlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    spacer: {
      flex: '1 1 100%',
    },
    actions: {
      color: theme.palette.text.secondary,
    },
    title: {
      flex: '0 0 auto',
    },
});
  
 let RecipeTableToolbar = props => {
    const { numSelected, classes } = props;
  
    return (
      <Toolbar
        className={classNames(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        <div className={classes.title}>
          {numSelected > 0 ? (
            <Typography color="inherit" variant="subheading">
              {numSelected} selected
            </Typography>
          ) : (
            <Typography variant="title" id="tableTitle">
              Recipes
            </Typography>
          )}
        </div>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          {numSelected > 0 &&
            <Tooltip title="Delete">
              <IconButton aria-label="Delete">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          }
        </div>
      </Toolbar>
    );
};
  
RecipeTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
};
  
RecipeTableToolbar = withStyles(toolbarStyles)(RecipeTableToolbar);

const styles = theme => ({
    root: {
      width: '75%',
      marginTop: theme.spacing.unit * 3,
    }
});
  
class RecipeTable extends Component {
    state = {
      order: 'asc',
      orderBy: 'title',
      selected: [],
      data: [
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
      ],
      page: 0,
      rowsPerPage: 10,
    };
  
    handleRequestSort = (event, property) => {
      const orderBy = property;
      let order = 'desc';
  
      if (this.state.orderBy === property && this.state.order === 'desc') {
        order = 'asc';
      }
  
      this.setState({ order, orderBy });
    };
  
    handleClick = (event, id) => {
      const { selected } = this.state;
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];
  
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }
  
      this.setState({ selected: newSelected });
    };
  
    handleChangePage = (event, page) => {
      this.setState({ page });
    };
  
    handleChangeRowsPerPage = event => {
      this.setState({ rowsPerPage: event.target.value });
    };
  
    isSelected = id => this.state.selected.indexOf(id) !== -1;

    // Take tag data from JSON payload and convert it to alphabetized comma-delimited string
    processTags(tagData) {
      let tagStr = '';
      let tagJson = JSON.parse(tagData);
      let sortedTags = tagJson.tags.sort(getSorting('asc', 'name'));
      sortedTags.forEach(function(tagInfo) {
        tagStr += tagInfo.name + ', ';
      });
      // Remove the trailing newlines
      let tagsLen = tagStr.length;
      tagStr = tagStr.substring(0, tagsLen - 2);

      return tagStr;
    };
  
    render() {
      const { classes } = this.props;
      const { data, order, orderBy, selected, rowsPerPage, page } = this.state;
      const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
  
      return (
        <Paper className={classes.root}>
          <RecipeTableToolbar numSelected={selected.length} />
          <div className={classes.tableWrapper}>
            <Table className={classes.table} aria-labelledby="tableTitle">
              <RecipeTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onRequestSort={this.handleRequestSort}
                rowCount={data.length}
              />
              <TableBody>
                {data
                  .sort(getSorting(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(n => {
                    const isSelected = this.isSelected(n.id);
                    let tags = this.processTags(n.data);
                    return (
                      <TableRow
                        hover
                        onClick={event => this.handleClick(event, n.id)}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                        key={n.id}
                        selected={isSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isSelected} />
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Link to={`/recipes/${n.id}`}>
                            {n.title}
                          </Link>
                        </TableCell>
                        <TableCell>{n.source}</TableCell>
                        <TableCell numeric>{n.serves}</TableCell>
                        <TableCell>{tags}</TableCell>
                        <TableCell>
                          <Moment format="YYYY-MM-DD h:mm A">
                            {n.modified_time}
                          </Moment>
                          </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 49 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            backIconButtonProps={{
              'aria-label': 'Previous Page',
            }}
            nextIconButtonProps={{
              'aria-label': 'Next Page',
            }}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
        </Paper>
      );
    }
  }
  
RecipeTable.propTypes = {
    classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(RecipeTable);