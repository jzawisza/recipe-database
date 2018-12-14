import React from 'react';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

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
    let nameKey = getNameKey(suggestion);
    const matches = match(suggestion[nameKey], query);
    const parts = parse(suggestion[nameKey], matches);
   
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
    let nameKey = getNameKey(suggestion);
    return suggestion[nameKey];
}

// Given a JSON object of the form
//
// { id: value1, someKey: value2 }
//
// Return the value of the key that's not 'id', i.e. 'someKey'.
function getNameKey(suggestion) {
    return Object.keys(suggestion).filter(k => k !== 'id')[0];
}
  

 export { renderInput, renderSuggestion, renderSuggestionsContainer, getSuggestionValue };