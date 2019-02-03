import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { doDelete, isErrorResponse, getErrMsg } from '../../utils/AjaxUtils';


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
    state = {
        removeModalVisible: false
    };

    removeRecipes = () => {
        const { selected, removeAPI, refreshFunc, clearCacheFunc } = this.props;
        // Start all the delete operations, and wait for them to finish before proceeding
        let promiseArray = selected.map(recipeId => {
            return doDelete(`${removeAPI}/${recipeId}`);
        });
        Promise.all(promiseArray).then(values => {
            values.forEach(returnVal => {
                if (isErrorResponse(returnVal)) {
                    console.error('Error deleting from database');
                    console.error(getErrMsg(returnVal));
                }
            });
            // Once all the promises have returned, force a refresh from the server,
            // clearing the cache first to require a refresh
            clearCacheFunc();
            refreshFunc({});
        })
        this.hideRemoveModal();
    }

    showRemoveModal = () => {
        this.setState({
            removeModalVisible: true
        });
    }

    hideRemoveModal = () => {
        this.setState({
            removeModalVisible: false
        });
    }

    render() {
        const { selected, classes, title, removeLabel, removeIcon, removeModalTitle, removeModalButtonName } = this.props;
        const { removeModalVisible } = this.state;
        let numSelected = selected.length;
    
        return (
            <React.Fragment>
                <div>
                    <Dialog
                        open={removeModalVisible}
                        onClose={this.hideRemoveModal}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                    <DialogTitle id="alert-dialog-title">{removeModalTitle}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.hideRemoveModal} color="primary" autoFocus>
                            Cancel
                        </Button>
                        <Button onClick={this.removeRecipes} color="primary">
                            {removeModalButtonName}
                        </Button>
                    </DialogActions>
                    </Dialog>
                </div>
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
                        <IconButton aria-label={removeLabel} onClick={this.showRemoveModal}>
                            {removeIcon}
                        </IconButton>
                        </Tooltip>
                    }
                    </div>
                </Toolbar>
            </React.Fragment>
        );
    }
};
  
SharedTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    selected: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    removeLabel: PropTypes.string.isRequired,
    removeIcon: PropTypes.element.isRequired,
    removeModalTitle: PropTypes.string.isRequired,
    removeModalButtonName: PropTypes.string.isRequired,
    removeAPI: PropTypes.string.isRequired,
    refreshFunc: PropTypes.func.isRequired,
    clearCacheFunc: PropTypes.func.isRequired
};
  
export default withStyles(toolbarStyles)(SharedTableToolbar);
