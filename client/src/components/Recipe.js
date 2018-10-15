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
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { debounce } from 'throttle-debounce';
import TagBar from './TagBar';
import RecipeLinks from './RecipeLinks';
import { Helmet } from 'react-helmet';
import { MAIN_TITLE } from '../App';

const REQUIRED_FIELD_LABEL = "This field is required."

const SAMPLE_DATA = {
    "id": "23",
    "source": "Cooking Light, September 2018",
    "title": "Thai Chicken Pizza",
    "ingredients": "10 ounces fresh prepared whole-wheat pizza dough, at room temperature\n1/4 cup well-shaken and stirred light coconut milk\n3 tablespoons creamy peanut butter\n1 tablespoon fresh lime juice\n2 teaspoons lower-sodium soy sauce\n2 teaspoons Sriracha chili sauce\n1 teaspoon light brown sugar\n1/2 teaspoon grated peeled fresh ginger\n<a href=\"https://www.cookinglight.com/recipes/french-onion-roast-chicken\">1 1/2 cups shredded chicken (from French Onion Roast Chicken)</a>\n1/2 cup matchstick-cut carrots\n1 1/2 ounces Monterey Jack cheese, finely shredded (about 2/3 cup)\n2  scallions, thinly sliced\n1/3 cup fresh bean sprouts\n1/4 cup fresh cilantro leaves",
    "preparation": "Preheat oven to 500°F. Place a pizza stone in oven while it preheats.\n\nPlace pizza dough on a lightly floured surface; roll into a 14- x 10-inch rectangle. Transfer to parchment paper. Pierce all over with a fork. Transfer dough and parchment to hot pizza stone; bake at 500°F until lightly browned, about 5 minutes.\n\nCombine coconut milk and next 6 ingredients (through ginger) in a bowl. Remove crust on parchment from oven. Spread 1/2 cup coconut milk mixture on crust, leaving a 1/2-inch border. Top with chicken, carrots, and cheese. Return pizza on parchment to hot pizza stone in oven; bake at 500°F until cheese melts, about 4 minutes. Drizzle with remaining coconut milk mixture; top with scallions, sprouts, and cilantro. Cut into 8 pieces.",
    "serves": 4,
    "caloriesPerServing": 353,
    "data": "{}",
    "creation_time": "2018-09-13T02:18:13.466Z",
    "modified_time": "2018-09-13T02:18:13.466Z"
};

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
    }
  });

class Recipe extends Component {
    constructor(props) {
        super(props);

        if (props.id) {
            // TODO: fetch data from database
            for (let key in SAMPLE_DATA) {
                this.state[key] = SAMPLE_DATA[key];
            }
        }

        this.persistChange = debounce(500, this.persistChange);
    }

    state = {
        saveSnackbarVisible: false,
        isFavorite: false,
        editMode: false
    };

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

      handleToggleFavorite = event => {
        this.setState(state => {
            let prevIsFavorite = state.isFavorite;

            return { isFavorite: !prevIsFavorite };
        });
      };

      handleToggleEditMode = event => {
        this.setState(state => {
            let prevEditMode = state.editMode;

            return { editMode: !prevEditMode };
        });
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
                                <IconButton
                                    key='editMode'
                                    color='primary'
                                    aria-label='Toggle edit mode'
                                    className={classes.topIcons}
                                    onClick={this.handleToggleEditMode}
                                >
                                    {this.state.editMode ? <DoneIcon /> : <EditIcon />}
                                </IconButton>
                                <IconButton
                                    key="setFavorite"
                                    color="primary"
                                    aria-label="Mark as favorite"
                                    className={classes.topIcons}
                                    onClick={this.handleToggleFavorite}
                                >
                                    {this.state.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                </IconButton>
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