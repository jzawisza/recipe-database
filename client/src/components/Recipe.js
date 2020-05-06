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
import Fade from '@material-ui/core/Fade';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import { debounce } from 'throttle-debounce';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import TagBar from './TagBar';
import RecipeLinks from './RecipeLinks';
import { MAIN_TITLE, DEFAULT_USER_ID, FAVORITE_TYPE_STR, MEAL_PLANNER_TYPE_STR } from '../App';
import { doGet, isErrorResponse, getErrMsg, doPost, doPatch } from '../utils/AjaxUtils';
import { modifyRecipe, clearRecipe, clearFavoritesCache, clearMealPlannerCache } from '../actions/actions';

const REQUIRED_FIELD_LABEL = "This field is required."

// Default number of rows for text areas that contain no text
const DEFAULT_ROWS = 8;

const styles = theme => ({
    root: {
      flexGrow: 1
    },
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      justifyContent: 'space-evenly',
      maxWidth: '1000px'
    },
    tagBarContainer: {
        paddingTop: '40px'
    },
    recipeLinksContainer: {
        paddingTop: '40px',
        paddingBottom: '40px'
    },
    formControl: {
        display: 'block'
    },
    topIcons: {
        float: 'right',
        display: 'block'
    },
    snackbarContent: {
        color: 'black',
        backgroundColor: theme.palette.background.default,
        [theme.breakpoints.up('md')]: {
            minWidth: 100,
            maxWidth: 200,
            borderRadius: theme.shape.borderRadius,
        }
    }
  });

class Recipe extends Component {
    constructor(props) {
        super(props);

        this.persistChange = debounce(500, this.persistChange);
    }

    state = {
        saveSnackbarVisible: false,
        editMode: false,
        loading: true,
        savedRecipeIsFavorite: false,
        savedRecipeIsMealPlanner: false,
        hasRequiredFields: false
    };

    componentDidMount() {
        // If we're calling this component in the context of viewing an existing recipe,
        // load that recipe from the database
        if(this.props.id) {
            doGet(`recipes/${this.props.id}`).then(responseJson => {
                // If the server returns an error, display an appropriate message
                if(isErrorResponse(responseJson)) {
                    this.setState({
                        loadingErrMsg: getErrMsg(responseJson),
                        loading: false
                    });
                    return;
                }
                this.setState(state => {
                    let newState = state;
                    for (let key in responseJson) {
                        newState[key] = responseJson[key];
                    }
                    newState.loading = false;
                    return newState;
                });

                this.setHasRequiredFields();
            });

            // Also get saved recipe information to see if this is a Favorite
            // or Meal Planner recipe (multi-user support to be added later)
            doGet(`saved-recipes?recipeId=${this.props.id}&userId=${DEFAULT_USER_ID}`).then(responseJson => {
                for (let index in responseJson.data) {
                    let savedValue = responseJson.data[index];
                    switch(savedValue.type) {
                        case FAVORITE_TYPE_STR:
                            this.setState({
                                savedRecipeFavoriteId: savedValue.id,
                                savedRecipeIsFavorite: savedValue.value
                            });
                            break;
                        case MEAL_PLANNER_TYPE_STR:
                            this.setState({
                                savedRecipeMealPlannerId: savedValue.id,
                                savedRecipeIsMealPlanner: savedValue.value
                            });
                            break;
                        default:
                            break;
                    }
                }
            });
        }
        else {
            this.setState({
                loading: false
            })
        }
    }

    componentWillUnmount() {
        this.props.clearRecipe();
    }

    componentDidUpdate(prevProps, prevState) {
        this.setHasRequiredFields(prevState);
    }

    setHasRequiredFields(prevState = {}) {
        // If the title, ingredients, and preparation fields all have values, we have all the required fields
        let { title, ingredients, preparation } = this.state;
        if(prevState.title !== title || prevState.ingredients !== ingredients || prevState.preparation !== preparation) {
            let hasRequiredFields = Boolean(title && ingredients && preparation);
            this.setState({ hasRequiredFields });
        }
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
        this.persistChange(name, event.target.value);
      };

    persistChange(name, value) {
        let { id, newRecipe } = this.props;
        this.props.modifyRecipe(name, value, id, newRecipe);

        this.setState({
            saveSnackbarVisible: true
        });
    }

    handleCloseSaveSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        this.setState({ saveSnackbarVisible: false });
      };

    toggle = name => event => {
        let prevValue = this.state[name];
        this.setState({
          [name]: !prevValue
        })
    };

    // Toggle the state of one of the variables representing a
    // saved recipe, and update the database accordingly
    toggleSavedRecipeState = toggleFavorite => event => {
        let idKey = undefined;
        let valueKey = undefined;
        let clearCacheFunc = null;
        let { clearFavoritesCache, clearMealPlannerCache } = this.props;

        if (toggleFavorite) {
            idKey = 'savedRecipeFavoriteId';
            valueKey = 'savedRecipeIsFavorite';
            clearCacheFunc = clearFavoritesCache;
        }
        else {
            idKey = 'savedRecipeMealPlannerId';
            valueKey = 'savedRecipeIsMealPlanner';
            clearCacheFunc = clearMealPlannerCache;
        }
        let prevValue = this.state[valueKey];
        let savedRecipeId = this.state[idKey];

        if (savedRecipeId) {
            // If we have a saved recipe ID, the record already exists
            // in the database, so do a PATCH to update it
            let payload = {
                value: !prevValue
            }
            doPatch(`saved-recipes/${savedRecipeId}`, payload)
            .then(responseJson => {
                if (isErrorResponse(responseJson)) {
                    console.error('Error deleting saved recipe information from database');
                    console.error(getErrMsg(responseJson));
                }
                else {
                    this.setState({
                        [valueKey]: !prevValue
                    });
                    if (clearCacheFunc) {
                        clearCacheFunc();
                    }
                }
            })
            .catch(err => {
                console.error('Error connecting to database');
                console.error(err);
            });
        }
        else {
            // If we don't have a saved recipe ID, we need to create a new
            // database record, so do a POST
            let typeStr = toggleFavorite ? FAVORITE_TYPE_STR : MEAL_PLANNER_TYPE_STR;
            let payload = {
                recipeId: this.props.id,
                userId: DEFAULT_USER_ID,
                type: typeStr,
                value: true
            };
            doPost('saved-recipes', payload)
            .then(responseJson => {
                if (isErrorResponse(responseJson)) {
                    console.error('Error adding saved recipe information to database');
                    console.error(getErrMsg(responseJson));
                }
                else {
                    this.setState({
                        [idKey]: responseJson.id,
                        [valueKey]: true
                    });
                    if (clearCacheFunc) {
                        clearCacheFunc();
                    }
                }
            })
            .catch(err => {
                console.error('Error connecting to database');
                console.error(err);
            });
        }
    };

    render() {
        // The id and newRecipe props have the following meaning.
        //
        // id = undefined, newRecipe = true   - Add Recipe tab, initial load
        // id = some value, newRecipe = true  - Add Recipe tab, recipe created on server
        // id = some value, newRecipe = false - View Recipe tab
        const { classes, id, newRecipe } = this.props;
        const { hasRequiredFields, editMode, loadingErrMsg, loading, savedRecipeIsFavorite, savedRecipeIsMealPlanner,
                saveSnackbarVisible, title, ingredients, preparation, source, serves, caloriesPerServing, notes }
                = this.state;

        
        // Enable editing if this is a new recipe
        let disableEditing = false;
        // Only update the page title if this is an existing recipe:
        // otherwise, the update has already been made outside this component
        let titleStr = null;
        // If this is an existing recipe, editing is disabled by default,
        // and enabled only if the user has explicitly requested edit mode
        if (!newRecipe) {
            disableEditing = !editMode;
            titleStr = `${title} - ${MAIN_TITLE}`;
        }

        let showTitleError = !title && !disableEditing;
        let titleErrorText = showTitleError ? REQUIRED_FIELD_LABEL : "";
        let showIngredientsError = !ingredients && !disableEditing;
        let ingredientsErrorText = showIngredientsError ? REQUIRED_FIELD_LABEL : "";
        let showPreparationError = !preparation && !disableEditing;
        let preparationErrorText = showPreparationError ? REQUIRED_FIELD_LABEL : "";

        // Display an error message if we tried to load data
        // from the server and failed
        if(loadingErrMsg) {
            return (
                <div className={classes.root}>
                    {titleStr &&
                        <Helmet>
                            <title>{titleStr}</title>
                        </Helmet>
                    }
                    <Typography
                        color='error'
                        variant='body1'
                        gutterBottom
                    >
                        Error loading recipe: {loadingErrMsg}
                    </Typography>
                </div>
            );
        }

        // Show spinner while we're loading data
        if(loading) {
            return (
                <div className={classes.root}>
                {titleStr &&
                    <Helmet>
                        <title>{titleStr}</title>
                    </Helmet>
                }
                    <Grid
                        container
                        spacing={0}
                        direction='column'
                        alignItems='center'
                        justify='center'
                    >
                        <Grid item xs={3}>
                            <CircularProgress
                                size={200}
                            />
                        </Grid>
                    </Grid>
                </div>
            );
        }

        return (
            <div className={classes.root}>
                {titleStr &&
                    <Helmet>
                        <title>{titleStr}</title>
                    </Helmet>
                }
                <form className={classes.container}>
                    <Grid container spacing={0} wrap="wrap">
                        {!newRecipe &&
                            <Grid item xs={12}>
                                <Tooltip title={editMode ? 'Finish editing recipe' : 'Edit recipe'}>
                                    <IconButton
                                        key='editMode'
                                        color='primary'
                                        aria-label='Toggle edit mode'
                                        className={classes.topIcons}
                                        onClick={this.toggle('editMode').bind(this)}
                                    >
                                        {editMode ? <DoneIcon /> : <EditIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={savedRecipeIsFavorite ? 'Remove from Favorites' : 'Add to Favorites'}>
                                    <IconButton
                                        key='isFavorite'
                                        color='primary'
                                        aria-label='Mark as favorite'
                                        className={classes.topIcons}
                                        onClick={this.toggleSavedRecipeState(true).bind(this)}
                                    >
                                        {savedRecipeIsFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={savedRecipeIsMealPlanner ? 'Remove from Meal Planner' : 'Add to Meal Planner'}>
                                    <IconButton
                                        key='isMealPlanner'
                                        color='primary'
                                        aria-label='Add to Meal Planner'
                                        className={classes.topIcons}
                                        onClick={this.toggleSavedRecipeState(false).bind(this)}
                                    >
                                        {savedRecipeIsMealPlanner ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl} error={showTitleError} aria-describedby="title-error-text">
                                <InputLabel htmlFor="name">Recipe name</InputLabel>
                                <Input
                                    id="title"
                                    onChange={this.handleChange('title').bind(this)}
                                    fullWidth
                                    margin="dense"
                                    disabled={disableEditing}
                                    value={title || ''}
                                />
                                <FormHelperText id="title-error-text">{titleErrorText}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="source"
                                label="Recipe source"
                                onChange={this.handleChange('source').bind(this)}
                                fullWidth
                                margin="normal"
                                disabled={disableEditing || !hasRequiredFields}
                                value={source || ''}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                id="serves"
                                label="Serves"
                                type="number"
                                onChange={this.handleChange('serves').bind(this)}
                                margin="normal"
                                disabled={disableEditing || !hasRequiredFields}
                                value={serves || ''}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                id="calories"
                                label="Calories per Serving"
                                type="number"
                                onChange={this.handleChange('caloriesPerServing').bind(this)}
                                margin="normal"
                                disabled={disableEditing || !hasRequiredFields}
                                value={caloriesPerServing || ''}
                            />
                        </Grid>

                        <Grid item xs={12} className={classes.tagBarContainer}>
                            <InputLabel>Tags</InputLabel>
                            <TagBar recipeId={id} editMode={!disableEditing && hasRequiredFields} />
                        </Grid>

                        <Grid item xs={12} className={classes.recipeLinksContainer}>
                            <InputLabel>Related Recipes</InputLabel>
                            <RecipeLinks recipeId={id} editMode={!disableEditing && hasRequiredFields} />
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
                                    autoFocus={true}
                                    rows={ingredients ? undefined : DEFAULT_ROWS}
                                    disabled={disableEditing}
                                    value={ingredients || ''}
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
                                    autoFocus={true}
                                    rows={preparation ? undefined : DEFAULT_ROWS}
                                    disabled={disableEditing}
                                    value={preparation || ''}
                                />
                                <FormHelperText id="preparation-error-text">{preparationErrorText}</FormHelperText>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                id="notes"
                                label="Notes"
                                multiline
                                autoFocus={true}
                                rows={notes ? undefined : DEFAULT_ROWS}
                                onChange={this.handleChange('notes').bind(this)}
                                fullWidth
                                margin="normal"
                                disabled={disableEditing || !hasRequiredFields}
                                value={notes || ''}
                            />
                        </Grid>
                    </Grid>
                </form>

                {/* Snackbar to indicate if results were saved successfully */}
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    open={saveSnackbarVisible}
                    autoHideDuration={2000}
                    onClose={this.handleCloseSaveSnackbar}
                    TransitionComponent={Fade}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                        className: classes.snackbarContent
                    }}
                    message={<span id="message-id">Changes saved</span>}
                    />
            </div>
        );
    }
}

Recipe.propTypes = {
    classes: PropTypes.object.isRequired,
    modifyRecipe: PropTypes.func.isRequired,
    clearRecipe: PropTypes.func.isRequired,
    id: PropTypes.string,
    newRecipe: PropTypes.bool.isRequired,
    clearFavoritesCache:  PropTypes.func.isRequired,
    clearMealPlannerCache:  PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
    if(state.editRecipe.recipe) {
        return {
            id: state.editRecipe.recipe.id
        }
    }
    else {
        return { id: ownProps.id }
    }
}

export default connect(mapStateToProps, { modifyRecipe, clearRecipe, clearFavoritesCache, clearMealPlannerCache })(withStyles(styles, { withTheme: true })(Recipe));