import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { Grid } from '@material-ui/core';

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

 function renderInput(inputProps) {
   const { classes, ref, ...other } = inputProps;
  
   return (
     <TextField
       fullWidth       
       InputProps={{
         inputRef: ref,
         classes: {
           input: classes.input,
         },
         ...other,
       }}
     />
   );
 }

 function renderSuggestion(suggestion, { query, isHighlighted }) {
   const matches = match(suggestion.tagName, query);
   const parts = parse(suggestion.tagName, matches);
  
   return (
     <MenuItem selected={isHighlighted} component="div">
       <div>
         {parts.map((part, index) => {
           return part.highlight ? (
             <span key={String(index)} style={{ fontWeight: 'bold' }}>
               {part.text}
             </span>
           ) : (
             <strong key={String(index)} style={{ fontWeight: 'normal' }}>
               {part.text}
             </strong>
           );
         })}
       </div>
     </MenuItem>
   );
 }

function renderSuggestionsContainer(options) {
  const { containerProps, children } = options;
  
  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  );
}
  
function getSuggestionValue(suggestion) {
  return suggestion.tagName;
}

class TagBar extends Component {
    // TODO: replace this test data with real data
    state = {
        currentTags: [
            { id: 2, tagName: 'Vegetarian' },
            { id: 3, tagName: 'Gluten Free' }
        ],
        allOtherTags: [
            { id: 1, tagName: 'Passover' },
            { id: 4, tagName: 'Indian' },
            { id: 5, tagName: 'Fish' }
        ],
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
        // (and therefore wasn't part of that list int he first place)
        let tagToDeleteIndex = allOtherTags.indexOf(newSuggestion);
        if (tagToDeleteIndex !== -1) {
          allOtherTags.splice(tagToDeleteIndex, 1);
        }
        return { currentTags, allOtherTags };
      });
    };
    
    handleAutoSuggestChange = (event, { newValue }) => {
      this.setState({
        tagValue: newValue,
      });
    };

    render() {
        const { classes } = this.props;
        // TODO: pass IDs to this component to load existing recipes
        // let recipeId = this.props.recipeId;

        const tagList = this.state.currentTags.map(tagData =>
            <Chip
                key={tagData.id}                   
                label={tagData.tagName}
                onDelete={this.handleDeleteTag(tagData)}
                className={classes.chip}
            />
        );

        return (
            <React.Fragment>
              <Grid item xs={12}>
                {tagList}
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
                    placeholder: 'Enter a new tag',
                    value: this.state.tagValue,
                    onChange: this.handleAutoSuggestChange,
                    }}
                />
              </Grid>
            </React.Fragment>
        );
    }
}

TagBar.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TagBar);