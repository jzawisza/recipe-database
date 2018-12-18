import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { renderInput, renderSuggestion, renderSuggestionsContainer, getSuggestionValue } from '../utils/AutoCompleteUtils';
import { doGet, isErrorResponse, getErrMsg, doPost, doDelete } from '../utils/AjaxUtils';
import '../App.css';

const styles = theme => ({
    root: {
      display: 'block',
    },
    container: {
      flexGrow: 1,
      position: 'relative'
    },
    suggestionsContainerOpen: {
      position: 'absolute',
      zIndex: 1,
      marginTop: theme.spacing.unit,
      left: 0,
      right: 0,
    },
    suggestion: {
      display: 'block',
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: 'none',
    },
    smallIcon: {
        height: 24,
        width: 24
    },
});

class RecipeLinkItem extends Component {
    onClickCloseIcon = (e) => {
        e.preventDefault();
        this.props.onDelete(this.props.value);
    }
    
    render() {
         return (
            <div className="recipe-link">
                <div className="recipe-link-item recipe-link-title">
                    <Link to={`/recipes/${this.props.value.recipeId}`}>
                        {this.props.value.title}
                    </Link>
                </div>
                {this.props.editMode &&
                    <div className="recipe-link-item">
                        <IconButton aria-label="Delete" onClick={this.onClickCloseIcon} className={this.props.className}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                }
            </div>
        );
        }
}

class RecipeLinks extends Component {
    constructor(props) {
        super(props);

        this.deleteLinkItem = this.deleteLinkItem.bind(this);
    }

    state = {
        recipeLinkValue: '',
        suggestions: [],
        linkedRecipes: []
    };

    componentDidMount() {
        let recipeId = this.props.recipeId;
        doGet(`recipe-links/?$or[0][sourceId]=${recipeId}&$or[1][destId]=${recipeId}`)
        .then(responseJson => {
            if (isErrorResponse(responseJson)) {
                console.error('Error retrieving saved recipe information from database');
                console.error(getErrMsg(responseJson));
            }
            else {
                let linkedRecipes = responseJson.data.map(recipe => {
                    let newRecipe = (({ id }) => ({ id }))(recipe);
                    // Because links are bidirectional, either the source or the destination can be
                    // the recipe we're linking to (as opposed to the current recipe).
                    // Check both cases so that we construct our array of linked recipes correctly.
                    if(recipe.sourceId === recipeId) {
                        newRecipe.recipeId = recipe.destId;
                        newRecipe.title = recipe.destTitle;
                    }
                    else {
                        newRecipe.recipeId = recipe.sourceId;
                        newRecipe.title = recipe.sourceTitle;
                    }

                    return newRecipe;
                });
                this.setState( { linkedRecipes } );
            }
        })
    }
    

    deleteLinkItem(linkItem) {
        doDelete(`recipe-links/${linkItem.id}`)
        .then(responseJson => {
            if (isErrorResponse(responseJson)) {
                console.error('Error adding saved recipe information to database');
                console.error(getErrMsg(responseJson));
            }
            else {
                this.setState(state => {
                    let linkedRecipes = [...state.linkedRecipes];
                    let linkToDeleteIndex = linkedRecipes.indexOf(linkItem);
                    linkedRecipes.splice(linkToDeleteIndex, 1);
                    return { linkedRecipes  };
                  });
            }
        });
    };

    handleSuggestionsFetchRequested = ({value}) => {
        const inputValue = value.trim();

        // Create a query for all recipes matching the input that will
        // - Exclude the current recipe
        // - Return only the id and title fields
        // - Limit the search results to 5 recipes
        doGet(`recipes?title[$like]=${inputValue}%&id[$ne]=${this.props.recipeId}&$select[]=id&$select[]=title&$limit=5`)
        .then(responseJson => {
            if (isErrorResponse(responseJson)) {
                console.error('Error adding saved recipe information to database');
                console.error(getErrMsg(responseJson));
            }
            else {
                this.setState({
                    suggestions: responseJson.data
                });
            }
        })
        .catch(err => {
            console.error('Error getting linked recipe suggestions');
            console.error(err);
        });
    };

    handleSuggestionsClearRequested = () => {
        this.setState({
          suggestions: [],
        });
    };

    handleSuggestionSelected = (event, { suggestion }) => {
        let payload = {
          sourceId: this.props.recipeId,
          destId: suggestion.id  
        };
        doPost('recipe-links', payload)
        .then(responseJson => {
            let linkedRecipe = {
                id: responseJson.id,
                recipeId: responseJson.destId,
                title: suggestion.title
            }
            this.setState(state => {
                let linkedRecipes = [...state.linkedRecipes];
                linkedRecipes.push(linkedRecipe);
                let newState = { linkedRecipes };
                newState['recipeLinkValue'] = '';
                return newState;
              });
        });
      };

    handleAutoSuggestChange = (event, { newValue }) => {
        this.setState({
            recipeLinkValue: newValue,
        });
      };

    render() {
        const { classes, editMode } = this.props;

        const linksList = this.state.linkedRecipes.map(linkData =>
            <RecipeLinkItem key={linkData.id} value={linkData} onDelete={this.deleteLinkItem} className={classes.smallIcon} editMode={editMode} />
        );

        return (
            <React.Fragment>
              <Grid item xs={8}>
                <div className="recipe-link-list">
                    {linksList}
                </div>
              </Grid>
              {editMode &&
                <Grid item xs={12}>
                    <Autosuggest
                        theme={{
                        container: classes.container,
                        suggestionsContainerOpen: classes.suggestionsContainerOpen,
                        suggestionsList: classes.suggestionsList,
                        suggestion: classes.suggestion,
                        }}
                        renderInputComponent={renderInput}
                        suggestions={this.state.suggestions}
                        onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
                        onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
                        renderSuggestionsContainer={renderSuggestionsContainer}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        onSuggestionSelected={this.handleSuggestionSelected}
                        inputProps={{
                        classes,
                        placeholder: 'Enter recipe to link to',
                        value: this.state.recipeLinkValue,
                        onChange: this.handleAutoSuggestChange,
                        }}
                    />
                </Grid>
              }
            </React.Fragment>
        );
    }
}

RecipeLinks.propTypes = {
    classes: PropTypes.object.isRequired,
    recipeId: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired
  };
  
  export default withStyles(styles)(RecipeLinks);