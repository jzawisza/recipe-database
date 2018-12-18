import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { Grid } from '@material-ui/core';
import { renderInput, renderSuggestion, renderSuggestionsContainer, getSuggestionValue } from '../utils/AutoCompleteUtils';
import { doGet, doPost } from '../utils/AjaxUtils';
import { connect } from 'react-redux';
import { addTag } from '../actions/actions';
import { store } from '../configureStore';

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

class TagBar extends Component {
    constructor(props) {
      super(props);

      store.subscribe(() => {
        this.setState(state => {
          return { currentTags: store.getState().manageTags.tags };
        })
      });

      // TODO: fetch tag information from the database if we have a recipe ID
      let hasData = props.recipeId;
      this.state.currentTags = [];
    }

    state = {
        tagValue: '',
        suggestions: [],
    };      

    handleDeleteTag = data => () => {
        this.setState(state => {
            let currentTags = [...state.currentTags];
            let tagToDeleteIndex = currentTags.indexOf(data);
            currentTags.splice(tagToDeleteIndex, 1);
            return { currentTags };
          });
    };

    handleSuggestionsFetchRequested = ({value}) => {
        const inputValue = value.trim();

        // Create query parameters to remove current tags from server results,
        // so that we can't add duplicate tags
        let notInParams = '';
        this.state.currentTags.forEach(existingTag => {
          notInParams += `&id[$notIn][]=${existingTag.id}`;
        });
        
        doGet(`tags?name[$like]=${inputValue}%${notInParams}`).then(responseJson => {
          let serverSuggestions = responseJson.data;

          // Unless we have an exact match, give the user the option
          // to create a new tag
          let currentExactMatch = false;
          let serverExactMatch = serverSuggestions.some(tag => {
            return tag.name.trim() === inputValue;
          });
          // The results from the server omit existing tags,
          // so if we don't find anything there, we have to check
          // the current tags as well
          if (serverExactMatch === false) {
            currentExactMatch = this.state.currentTags.some(tag => {
              return tag.name.trim() === inputValue;
            });
          }
          if (!(serverExactMatch || currentExactMatch)) {
            serverSuggestions.push(
              { id: NEW_TAG_ID, name: `${inputValue}${NEW_TAG_STRING}` }
            );
          }

          this.setState({
            suggestions: serverSuggestions
          });
        });
    };
    
    handleSuggestionsClearRequested = () => {
      this.setState({
        suggestions: [],
      });
    };

    handleSuggestionSelected = (event, { suggestion }) => {
      // If this is a new tag, add it to the database and then add to local state
      if (suggestion.id === NEW_TAG_ID) {
        // Remove "( New tag)" suffix from new tag
        let helperTextIndex = suggestion.name.indexOf(NEW_TAG_STRING);
        let newTagName = suggestion.name.slice(0, helperTextIndex);
        doPost('tags', { 'name': newTagName }).then(responseJson => {
          this.updateStateWithSelectedSuggestion(responseJson);
        })
      }
      else {
        this.updateStateWithSelectedSuggestion(suggestion);
      }
    };

    updateStateWithSelectedSuggestion = suggestion => {
      // Add to Redux store
      // Because we subscribe to the store, this updates the local state as well
      this.props.addTag(suggestion);

      this.setState(state => {
        let newState = state;
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
                      label={tagData.name}
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
    classes: PropTypes.object.isRequired,
    addTag: PropTypes.func.isRequired
};

export default connect(null, { addTag })(withStyles(styles)(TagBar));
