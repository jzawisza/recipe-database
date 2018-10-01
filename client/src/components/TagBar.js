import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { Grid } from '@material-ui/core';
import { renderInput, renderSuggestion, renderSuggestionsContainer, getSuggestionValue } from './utils/AutoCompleteUtils';

// NOTE: much of the code here comes from Material UI's sample implementation
// of react-autosuggest at https://material-ui.com/demos/autocomplete/

const NEW_TAG_ID = 0;
const NEW_TAG_STRING = ' (New tag)';

const styles = theme => ({
    root: {
      display: 'flex',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
    },
    chip: {
      margin: theme.spacing.unit,
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

const CURRENT_TAGS_TEST = [
  { id: 2, tagName: 'Vegetarian' },
  { id: 3, tagName: 'Gluten Free' }
];

const ALL_OTHER_TAGS_TEST = [
  { id: 1, tagName: 'Passover' },
  { id: 4, tagName: 'Indian' },
  { id: 5, tagName: 'Fish' }
];

const ALL_OTHER_TAGS_ALL = [
  { id: 1, tagName: 'Passover' },
  { id: 2, tagName: 'Vegetarian' },
  { id: 3, tagName: 'Gluten Free' },
  { id: 4, tagName: 'Indian' },
  { id: 5, tagName: 'Fish' }
];

class TagBar extends Component {
    constructor(props) {
      super(props);

      // If we're viewing an recipe, simulate having tag data
      // TODO: replace this with database fetch
      let hasData = props.recipeId;
      this.state.currentTags = hasData ? CURRENT_TAGS_TEST : [];
      this.state.allOtherTags = hasData ? ALL_OTHER_TAGS_TEST : ALL_OTHER_TAGS_ALL;
    }

    state = {
        currentTags: [],
        tagValue: '',
        suggestions: [],
    };      

    handleDeleteTag = data => () => {
        this.setState(state => {
            let currentTags = [...state.currentTags];
            let allOtherTags = [...state.allOtherTags];
            let tagToDeleteIndex = currentTags.indexOf(data);
            currentTags.splice(tagToDeleteIndex, 1);
            // A tag that's deleted is available to be added again
            allOtherTags.push(data);
            return { currentTags, allOtherTags };
          });
    };

    handleSuggestionsFetchRequested = ({value}) => {
        const inputValue = value.trim();
        const inputLength = inputValue.length;
        let count = 0;
            
        let newSuggestions = (inputLength === 0)
            ? []
            : this.state.allOtherTags.filter(suggestion => {
                const keep =
                count < 5 && suggestion.tagName.slice(0, inputLength) === inputValue;
        
                if (keep) {
                count += 1;
                }
        
                return keep;
            });

        // Unless we have an exact match, give the user the option
        // to create a new tag
        let exactMatch = this.state.allOtherTags.some(tag => {
          return tag.tagName.trim() === inputValue;
        });
        if (exactMatch === false) {
          newSuggestions.push(
            { id: NEW_TAG_ID, tagName: `${inputValue}${NEW_TAG_STRING}` }
          );
        }

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
      // If this is a new tag, process it appropriately
      let newSuggestion = suggestion;
      if (suggestion.id === NEW_TAG_ID) {
        // TODO: write to DB, get new ID back, and update here
        // Remove "( New tag)" suffix from new tag
        let helperTextIndex = suggestion.tagName.indexOf(NEW_TAG_STRING);
        newSuggestion.tagName = suggestion.tagName.slice(0, helperTextIndex);
      }
      this.setState(state => {
        let currentTags = [...state.currentTags];
        let allOtherTags = [...state.allOtherTags];
        // Add item to list of selected tags
        currentTags.push(newSuggestion);
        // Remove item from list of non-selected tags unless it's a new tag
        // (and therefore wasn't part of that list in the first place)
        let tagToDeleteIndex = allOtherTags.indexOf(newSuggestion);
        if (tagToDeleteIndex !== -1) {
          allOtherTags.splice(tagToDeleteIndex, 1);
        }
        let newState = { currentTags, allOtherTags }
        newState['tagValue'] = '';
        return newState;
      });
    };
    
    handleAutoSuggestChange = (event, { newValue }) => {
      this.setState({
        tagValue: newValue,
      });
    };

    render() {
        const { classes, editMode } = this.props;

        return (
            <React.Fragment>
              <Grid item xs={12}>
                {this.state.currentTags.map(tagData => {
                  let onDeleteFunc = editMode ? this.handleDeleteTag(tagData) : null;
                  return (
                    <Chip
                      key={tagData.id}
                      label={tagData.tagName}
                      onDelete={onDeleteFunc}
                      className = {classes.chip}
                    />
                  );
                })}
              </Grid>
              <Grid item xs={12}>
                {editMode &&
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
                    placeholder: 'Enter a new tag',
                    value: this.state.tagValue,
                    onChange: this.handleAutoSuggestChange,
                    }}
                  />
                }
              </Grid>
            </React.Fragment>
        );
    }
}

TagBar.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TagBar);