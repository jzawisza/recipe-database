import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { renderInput, renderSuggestion, renderSuggestionsContainer, getSuggestionValue } from './utils/AutoCompleteUtils';


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
    }
});

class RecipeLinkItem extends Component {
    onClickCloseIcon = (e) => {
        e.preventDefault();
        this.props.onDelete(this.props.value);
    }
    
    render() {
      return (
        <li>
            {this.props.value.title}
                <IconButton aria-label="Delete" onClick={this.onClickCloseIcon}>
                  <CloseIcon />
                </IconButton>
        </li>
      );
    }
}

class RecipeLinks extends Component {
    constructor(props, state) {
        super(props);

        // TODO: replace test data with real data
        this.state = {
            linkedRecipes: [
                {id: 2, title: 'Chicken Curry'},
                {id: 3, title: 'Raita'}
            ],
            otherRecipes: [
                {id: 4, title: 'Fettucine Alfredo'},
                {id: 5, title: 'Fish and Chips'},
                {id: 6, title: 'Miso-Glazed Salmon'}
            ],
            recipeLinkValue: '',
            suggestions: []
        };

        this.deleteLinkItem = this.deleteLinkItem.bind(this);
    }

    deleteLinkItem(linkItem) {
        this.setState(state => {
            let linkedRecipes = [...state.linkedRecipes];
            let otherRecipes = [...state.otherRecipes];
            let linkToDeleteIndex = linkedRecipes.indexOf(linkItem);
            linkedRecipes.splice(linkToDeleteIndex, 1);
            otherRecipes.push(linkItem);
            return { linkedRecipes, otherRecipes };
          });
    };

    handleSuggestionsFetchRequested = ({value}) => {
        const inputValue = value.trim();
        const inputLength = inputValue.length;
        let count = 0;
            
        let newSuggestions = (inputLength === 0)
            ? []
            : this.state.otherRecipes.filter(suggestion => {
                const keep =
                count < 5 && suggestion.title.slice(0, inputLength) === inputValue;
        
                if (keep) {
                    count += 1;
                }
        
                return keep;
            });

        this.setState({
            suggestions: newSuggestions
        });
    };

    handleSuggestionsClearRequested = () => {
        this.setState({
          suggestions: [],
        });
    };

    handleSuggestionSelected = (event, { suggestion }) => {
        this.setState(state => {
          let linkedRecipes = [...state.linkedRecipes];
          let otherRecipes = [...state.otherRecipes];
          // Add item to linked recipe list
          linkedRecipes.push(suggestion);
          // Remove item from other recipe list
          otherRecipes.splice(otherRecipes.indexOf(suggestion), 1);
          let newState = { linkedRecipes, otherRecipes };
          newState['recipeLinkValue'] = '';
          return newState;
        });
      };

    handleAutoSuggestChange = (event, { newValue }) => {
        this.setState({
            recipeLinkValue: newValue,
        });
      };

    render() {
        const { classes } = this.props;

        const linksList = this.state.linkedRecipes.map(linkData =>
            <RecipeLinkItem key={linkData.id} value={linkData} onDelete={this.deleteLinkItem} />
        );

        return (
            <React.Fragment>
              <Grid item xs={4}>
                <ul>
                    {linksList}
                </ul>
              </Grid>
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
                    placeholder: 'Enter recipe name',
                    value: this.state.recipeLinkValue,
                    onChange: this.handleAutoSuggestChange,
                    }}
                />
              </Grid>
            </React.Fragment>
        );
    }
}

RecipeLinks.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(RecipeLinks);