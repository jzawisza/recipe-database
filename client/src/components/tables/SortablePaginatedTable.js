import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import SharedTableHead from './SharedTableHead';
import SharedTableToolbar from './SharedTableToolbar';
import { getSorting } from '../../utils/SortUtils';

// NOTE: this code is adapted from the Material UI table samples at
// https://material-ui.com/demos/tables/

const styles = theme => ({
    root: {
      width: '75%',
      marginTop: theme.spacing.unit * 3,
    }
});
  
class SortablePaginatedTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            order: props.order || 'asc',
            orderBy: props.orderBy,
            selected: [],
            page: 0,
            rowsPerPage: props.rowsPerPage || 10,
            data: props.data
        };
    }
  
    handleRequestSort = (event, property) => {
      const orderBy = property;
      let order = 'desc';
  
      if (this.state.orderBy === property && this.state.order === 'desc') {
        order = 'asc';
      }
  
      this.setState({ order, orderBy });
    };

    handleSelectAllClick = event => {
      if (event.target.checked) {
        this.setState(state => ({ selected: state.data.map(n => n.id) }));
        return;
      }
      this.setState({ selected: [] });
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
  
    render() {
      const { classes, title, removeLabel, removeIcon, headerRows, rowRenderFunc } = this.props;
      const { data, order, orderBy, selected, rowsPerPage, page } = this.state;
      const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
  
      return (
        <Paper className={classes.root}>
          <SharedTableToolbar
            numSelected={selected.length}
            title={title}
            removeLabel={removeLabel}
            removeIcon={removeIcon}
          />
          <div className={classes.tableWrapper}>
            <Table className={classes.table} aria-labelledby="tableTitle">
              <SharedTableHead
                headerRows={headerRows}
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onRequestSort={this.handleRequestSort}
                rowCount={data.length}
                onSelectAllClick={this.handleSelectAllClick}
              />
              <TableBody>
                {data
                  .sort(getSorting(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(n => {
                    const isSelected = this.isSelected(n.id);
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
                        {rowRenderFunc(n)}
                      </TableRow>
                    )})}
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
  
  SortablePaginatedTable.propTypes = {
    classes: PropTypes.object.isRequired,
    order: PropTypes.string,
    orderBy: PropTypes.string.isRequired,
    rowsPerPage: PropTypes.number,
    data: PropTypes.array.isRequired,
    headerRows: PropTypes.array.isRequired,
    rowRenderFunc: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    removeLabel: PropTypes.string.isRequired,
    removeIcon: PropTypes.element.isRequired,
};
  
export default withStyles(styles)(SortablePaginatedTable);