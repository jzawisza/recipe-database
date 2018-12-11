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
import TagBar from './TagBar';
import RecipeLinks from './RecipeLinks';
import { MAIN_TITLE } from '../App';
import { doGet } from './utils/AjaxUtils';

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
        isFavorite: false,
        isMealPlanner: false,
        editMode: false,
        loading: true,
    };

    componentDidMount() {
        // If we're calling this component in the context of viewing an existing recipe,
        // load that recipe from the database
        if(this.props.id) {
            doGet(`recipes/${this.props.id}`).then(responseJson => {
                // If the server returns an error, display an appropriate message
                if(responseJson.code && responseJson.message) {
                    this.setState({
                        loadingErrMsg: responseJson.message,
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
            })
        }
        else {
            this.setState({
                loading: false
            })
        }
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
        this.persistChange(name, event.target.value);
      };

    persistChange(name, value) {
        // TODO: persist change to database here
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

    render() {
        const { classes, id } = this.props;
        
        // If a recipe ID was passed into this component,
        // we're asking to view an existing recipe, so 'id' will evaluate to true.
        // Otherwise, we're asking to enter a new recipe into the database,
        // and 'id' will evaluate to false.
        let isNewRecipe = !id;
        // Enable editing if this is a new recipe
        let disableEditing = false;
        // Only update the page title if this is an existing recipe:
        // otherwise, the update has already been made outside this component
        let titleStr = null;
        // If this is an existing recipe, editing is disabled by default,
        // and enabled only if the user has explicitly requested edit mode
        if (!isNewRecipe) {
            disableEditing = !this.state.editMode;
            titleStr = `${this.state.title} - ${MAIN_TITLE}`;
        }

        let showTitleError = !this.state.title && !disableEditing;
        let titleErrorText = showTitleError ? REQUIRED_FIELD_LABEL : "";
        let showIngredientsError = !this.state.ingredients && !disableEditing;
        let ingredientsErrorText = showIngredientsError ? REQUIRED_FIELD_LABEL : "";
        let showPreparationError = !this.state.preparation && !disableEditing;
        let preparationErrorText = showPreparationError ? REQUIRED_FIELD_LABEL : "";

        // Display an error message if we tried to load data
        // from the server and failed
        if(this.state.loadingErrMsg) {
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
                        Error loading recipe: {this.state.loadingErrMsg}
                    </Typography>
                </div>
            );
        }

        // Show spinner while we're loading data
        if(this.state.loading) {
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
                        {!isNewRecipe &&
                            <Grid item xs={12}>
                                <Tooltip title={this.state.editMode ? 'Finish editing recipe' : 'Edit recipe'}>
                                    <IconButton
                                        key='editMode'
                                        color='primary'
                                        aria-label='Toggle edit mode'
                                        className={classes.topIcons}
                                        onClick={this.toggle('editMode').bind(this)}
                                    >
                                        {this.state.editMode ? <DoneIcon /> : <EditIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={this.state.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}>
                                    <IconButton
                                        key='isFavorite'
                                        color='primary'
                                        aria-label='Mark as favorite'
                                        className={classes.topIcons}
                                        onClick={this.toggle('isFavorite').bind(this)}
                                    >
                                        {this.state.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={this.state.isMealPlanner ? 'Remove from Meal Planner' : 'Add to Meal Planner'}>
                                    <IconButton
                                        key='isMealPlanner'
                                        color='primary'
                                        aria-label='Add to Meal Planner'
                                        className={classes.topIcons}
                                        onClick={this.toggle('isMealPlanner').bind(this)}
                                    >
                                        {this.state.isMealPlanner ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
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
                                    value={this.state.title || ''}
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
                                disabled={disableEditing}
                                value={this.state.source || ''}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                id="serves"
                                label="Serves"
                                type="number"
                                onChange={this.handleChange('serves').bind(this)}
                                margin="normal"
                                disabled={disableEditing}
                                value={this.state.serves || ''}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                id="calories"
                                label="Calories per Serving"
                                type="number"
                                onChange={this.handleChange('calories').bind(this)}
                                margin="normal"
                                disabled={disableEditing}
                                value={this.state.caloriesPerServing || ''}
                            />
                        </Grid>

                        <Grid item xs={12} className={classes.tagBarContainer}>
                            <InputLabel>Tags</InputLabel>
                            <TagBar recipeId={id} editMode={!disableEditing} />
                        </Grid>

                        <Grid item xs={12} className={classes.recipeLinksContainer}>
                            <InputLabel>Related Recipes</InputLabel>
                            <RecipeLinks recipeId={id} editMode={!disableEditing} />
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
                                    rows={this.state.ingredients ? undefined : DEFAULT_ROWS}
                                    disabled={disableEditing}
                                    value={this.state.ingredients || ''}
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
                                    rows={this.state.preparation ? undefined : DEFAULT_ROWS}
                                    disabled={disableEditing}
                                    value={this.state.preparation || ''}
                                />
                                <FormHelperText id="preparation-error-text">{preparationErrorText}</FormHelperText>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                id="notes"
                                label="Notes"
                                multiline
                                rows={this.state.notes ? undefined : DEFAULT_ROWS}
                                onChange={this.handleChange('notes').bind(this)}
                                fullWidth
                                margin="normal"
                                disabled={disableEditing}
                                value={this.state.notes || ''}
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
                    open={this.state.saveSnackbarVisible}
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
    id: PropTypes.string
};

export default withStyles(styles, { withTheme: true })(Recipe); 