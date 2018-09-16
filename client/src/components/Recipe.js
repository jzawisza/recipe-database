import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {debounce} from 'throttle-debounce';
import TagBar from './TagBar';
import RecipeLinks from './RecipeLinks';

const REQUIRED_FIELD_LABEL = "This field is required."

const styles = theme => ({
    root: {
      flexGrow: 1
    },
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      justifyContent: 'space-evenly',
      maxWidth: 1000
    },
    componentContainer: {
        paddingTop: 50
    },
    formControl: {
        display: 'block'
    },
  });

class Recipe extends Component {
    state = {
        saveSnackbarVisible: false
    };

    constructor(props) {
        super(props);
        this.handleChangeEvent = debounce(500, this.handleChangeEvent);
    }

    handleChange = name => event => {
        this.handleChangeEvent(name, event.target.value);
      };

    handleChangeEvent(name, value) {
          this.setState({
            [name]: value,
            saveSnackbarVisible: true
          });
    }

    handleCloseSaveSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        this.setState({ saveSnackbarVisible: false });
      };

    render() {
        const { classes } = this.props;
        // let isEditing = this.props.edit;
        // let recipeId = this.props.id;

        let showNameError = !this.state.name;
        let nameErrorText = showNameError ? REQUIRED_FIELD_LABEL : "";
        let showIngredientsError = !this.state.ingredients;
        let ingredientsErrorText = showIngredientsError ? REQUIRED_FIELD_LABEL : "";
        let showPreparationError = !this.state.preparation;
        let preparationErrorText = showPreparationError ? REQUIRED_FIELD_LABEL : "";

        return (
            <div className={classes.root}>
                <form className={classes.container}>
                    <Grid container spacing={0} wrap="wrap">
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl} error={showNameError} aria-describedby="name-error-text">
                                <InputLabel htmlFor="name">Recipe name</InputLabel>
                                <Input
                                    id="name"
                                    onChange={this.handleChange('name').bind(this)}
                                    fullWidth
                                    margin="dense"
                                />
                                <FormHelperText id="name-error-text">{nameErrorText}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="source"
                                label="Recipe source"
                                onChange={this.handleChange('source').bind(this)}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                id="serves"
                                label="Serves"
                                type="number"
                                onChange={this.handleChange('serves').bind(this)}
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                id="calories"
                                label="Calories per Serving"
                                type="number"
                                onChange={this.handleChange('calories').bind(this)}
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={12} className={classes.componentContainer}>
                            <InputLabel>Tags</InputLabel>
                            <TagBar />
                        </Grid>

                        <Grid item xs={12} className={classes.componentContainer}>
                            <InputLabel>Related Recipes</InputLabel>
                            <RecipeLinks />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl className={classes.formControl} error={showIngredientsError} aria-describedby="ingredients-error-text">
                                <InputLabel htmlFor="name">Ingredients</InputLabel>
                                <Input
                                    id="ingredients"
                                    onChange={this.handleChange('ingredients').bind(this)}
                                    fullWidth
                                    margin="dense"
                                    multiline
                                    rows="8"
                                />
                                <FormHelperText id="ingredients-error-text">{ingredientsErrorText}</FormHelperText>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl className={classes.formControl} error={showPreparationError} aria-describedby="preparation-error-text">
                                <InputLabel htmlFor="name">Preparation</InputLabel>
                                <Input
                                    id="preparation"
                                    onChange={this.handleChange('preparation').bind(this)}
                                    fullWidth
                                    margin="dense"
                                    multiline
                                    rows="8"
                                />
                                <FormHelperText id="preparation-error-text">{preparationErrorText}</FormHelperText>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                id="notes"
                                label="Notes"
                                multiline
                                rows="8"
                                onChange={this.handleChange('notes').bind(this)}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                    </Grid>
                </form>

                {/* Snackbar to indicate if results were saved successfully */}
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.saveSnackbarVisible}
                    autoHideDuration={2000}
                    onClose={this.handleCloseSaveSnackbar}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">Changes saved</span>}
                    action={[
                        <IconButton
                          key="close"
                          aria-label="Close"
                          color="inherit"
                          className={classes.close}
                          onClick={this.handleCloseSaveSnackbar}
                        >
                          <CloseIcon />
                        </IconButton>
                      ]} />
            </div>
        );
    }
}

Recipe.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Recipe); 