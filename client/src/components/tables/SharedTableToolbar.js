import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { lighten } from '@material-ui/core/styles/colorManipulator';


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

// Class representing a toolbar for a table that shows the number of selected items,
// and displays a custom icon indicating that those items should be removed
class SharedTableToolbar extends Component {
    render() {
        const { numSelected, classes, title, removeLabel, removeIcon } = this.props;
    
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
                {title}
                </Typography>
            )}
            </div>
            <div className={classes.spacer} />
            <div className={classes.actions}>
            {numSelected > 0 &&
                <Tooltip title={removeLabel}>
                <IconButton aria-label={removeLabel}>
                    {removeIcon}
                </IconButton>
                </Tooltip>
            }
            </div>
        </Toolbar>
        );
    }
};
  
SharedTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    removeLabel: PropTypes.string.isRequired,
    removeIcon: PropTypes.element.isRequired
};
  
export default withStyles(toolbarStyles)(SharedTableToolbar);
