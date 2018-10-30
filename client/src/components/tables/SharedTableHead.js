import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';

// Class representing a header row for a table
class SharedTableHead extends Component {
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const { headerRows, order, orderBy } = this.props;

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
  
SharedTableHead.propTypes = {
    headerRows: PropTypes.array.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
};

export default SharedTableHead;