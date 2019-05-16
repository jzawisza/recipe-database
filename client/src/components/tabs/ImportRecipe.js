import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Grid } from '@material-ui/core';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import {debounce} from 'throttle-debounce';
import isURL from 'validator/lib/isURL';
import TagBar from '../TagBar';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { MAIN_TITLE } from '../../App';
import { clearTags, clearRecipesCache } from '../../actions/actions';
import { store } from '../../configureStore';
import { doPost } from '../../utils/AjaxUtils';

const URL_ERROR_TEXT = 'The URL entered is not valid.';
const URL_INPUT_ID = "urlInput";
const IMPORT_BUTTON_ID = "import-button";
const IMPORT_BUTTON_DEFAULT_TEXT = "Import";
const IMPORT_BUTTON_IMPORTING_TEXT = "Importing...";
const IMPORT_STATUS_OK = "Import succeeded";
const IMPORT_STATUS_ERROR = "Import failed";

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        justifyContent: 'space-evenly',
        maxWidth: 1000
      },
      tagContainer: {
        paddingTop: 20
    },
    button: {
        margin: theme.spacing.unit,
    },
    firstDivider: {
        marginTop: 20,
        marginBottom: 10
    },
    otherDivider: {
        marginBottom: 20
    },
    formControl: {
        display: 'block'
    },
    importOk: {
        backgroundColor: green[600]
    },
    importError: {
        backgroundColor: theme.palette.error.dark
    }
  });

  const SpinnerAdornment = withStyles(styles)(props => (
    <CircularProgress
      className={props.classes.spinner}
      size={20}
    />
  ))

  const defaultState = {
    hasURLValue: false,
    isValidURL: false,
    importErrorText: null,
    importing: false,
    importButtonText: IMPORT_BUTTON_DEFAULT_TEXT,
    importNotes: false,
    url: undefined,
    importSucceeded: true,
    importStatusMsg: ''
  };

class ImportRecipe extends Component {
    constructor(props) {
        super(props);
        this.state = this.getDefaultState();
        this.handleChangeEvent = debounce(500, this.handleChangeEvent);
    }

    // Return a default state object that includes all the pre-defined values
    getDefaultState(showSnackbar = false) {
        return Object.assign(defaultState, { importSnackbarVisible: showSnackbar });
    }

    handleCloseImportSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        this.setState({ importSnackbarVisible: false });
      };

    handleChange = name => event => {
        this.handleChangeEvent(name, event.target.value);
      };

    handleChangeEvent(name, value) {
        this.setState(state => {
            let hasURLValue = state.hasURLValue;
            let isValidURL = state.isValidURL;
            let newState = { hasURLValue, isValidURL };
            if (name === 'url') {
                hasURLValue = value.length > 0;
                isValidURL = isURL(value);
                newState = { hasURLValue, isValidURL };
                newState[name] = isValidURL ? value : null;
            }
            else {
                newState[name] = value;
            }

            return newState;
          });
    }

    handleImportNotesChange = event => {
        this.setState({
            importNotes: event.target.checked
        });
    }

    handleImport = () => {
        if (this.state.hasURLValue && !this.state.isValidURL) {
            this.setState({
                importErrorText: 'You must specify a valid URL before importing.'
            });
            return;
        }
        if (!this.state.url) {
            this.setState({
                importErrorText: 'Please specify a URL to import.'
            });
            return;
        }

        // Set state appropriately prior to doing import
        this.setState(prevState => {
            return {
                importErrorText: null,
                importing: true,
                importButtonText: IMPORT_BUTTON_IMPORTING_TEXT
            }
        });

        let encodedTags = window.btoa(JSON.stringify(store.getState().manageTags.tags));
        let postBody = {
            url: this.state.url,
            tags: encodedTags,
            importNotes: this.state.importNotes
        };
        doPost('recipe-import', postBody)
        .then(responseJson => {
            // If the call succeeds, the data returned by the server will have an 'id' field
            // representing the new record created
            let importSucceeded = responseJson.id;
            // If the call fails, the message parameter gives details about the failure
            let errMsg = responseJson.message;
            // If the response JSON has an errors array, use that to get additional context
            if(Array.isArray(responseJson.errors)) {
                errMsg += ` (${responseJson.errors[0].message})`;
            }
            let importStatusMsg = importSucceeded ? IMPORT_STATUS_OK : `${IMPORT_STATUS_ERROR}: ${errMsg}`;

            if(importSucceeded) {
                // Force data to be reloaded from the server, since we have new data if the import succeeded
                this.props.clearRecipesCache();
            }

            // Clear out data that was entered in UI
            document.getElementById(URL_INPUT_ID).value = '';
            this.props.clearTags();
            this.setState(state => {
                let newState = this.getDefaultState(true);
                newState['importSucceeded'] = importSucceeded;
                newState['importStatusMsg'] = importStatusMsg;
                return newState;
            });
        });
    }

    render() {
        const { classes } = this.props;

        let urlErrorText = '';
        let hasURLError = false;
        if (this.state.hasURLValue && !this.state.isValidURL) {
            hasURLError = true;
            urlErrorText = URL_ERROR_TEXT;
        }
        let importErrorText = this.state.importErrorText;
        let hasImportError = (importErrorText !== null);
        let snackbarClass = this.state.importSucceeded ? classes.importOk : classes.importError;

        return (
            <div>
                <Helmet>
                    <title>{`Import Recipe - ${MAIN_TITLE}`}</title>
                </Helmet>
                <Typography variant="body1" gutterBottom>
                        Use this form to import a recipe from one of the following web sites:
                </Typography>
                <ul>
                    <li><a href="https://bonappetit.com" target="_blank" rel="noopener noreferrer">Bon Appetit</a></li>
                    <li><a href="https://cookinglight.com" target="_blank" rel="noopener noreferrer">Cooking Light</a></li>
                    <li><a href="http://eatingwell.com" target="_blank" rel="noopener noreferrer">Eating Well</a></li>
                    <li><a href="https://pinchofyum.com" target="_blank" rel="noopener noreferrer">Pinch of Yum</a></li>
                    <li><a href="https://realsimple.com" target="_blank" rel="noopener noreferrer">Real Simple</a></li>
                    <li><a href="https://skinnytaste.com" target="_blank" rel="noopener noreferrer">Skinny Taste</a></li>
                    <li><a href="https://smittenkitchen.com" target="_blank" rel="noopener noreferrer">Smitten Kitchen</a> (2017 and newer)</li>
                </ul>


                <form className={classes.container}>
                    <Grid container spacing={0} wrap="wrap">
                        <Grid item xs={12}>
                            <Divider className={classes.firstDivider} />
                            <InputLabel>1) Enter URL of recipe to import:</InputLabel>
                            <FormControl className={classes.formControl} error={hasURLError} aria-describedby="url-error-text">
                                <InputLabel htmlFor={URL_INPUT_ID}>URL</InputLabel>
                                <Input
                                id={URL_INPUT_ID}
                                type="url"
                                onChange={this.handleChange('url').bind(this)}
                                fullWidth />
                                <FormHelperText id="url-error-text">{urlErrorText}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} className={classes.tagContainer}>
                            <Divider className={classes.otherDivider} />
                            <InputLabel>2) Specify tags for recipe (optional):</InputLabel>
                            <TagBar editMode={true} />
                        </Grid>
                        <Grid item xs={10} className={classes.tagContainer}>
                            <Divider className={classes.otherDivider} />
                            <InputLabel>3) Select whether to include notes when importing the recipe (optional):</InputLabel>
                            <FormControl className={classes.formControl}> 
                                <FormControlLabel
                                control={
                                    <Switch
                                    checked={this.state.importNotes}
                                    onChange={this.handleImportNotesChange.bind('this')}
                                    value='importNotes'
                                    color='primary'
                                    />
                                }
                                label="Include notes in import"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={3} className={classes.tagContainer}>
                            <FormControl className={classes.formControl} error={hasImportError} aria-describedby="import-error-text">
                                <Button
                                    id={IMPORT_BUTTON_ID}
                                    disabled={this.state.importing}
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    onClick={this.handleImport}
                                >
                                    {this.state.importing && <SpinnerAdornment />}
                                    {this.state.importButtonText}
                                </Button>
                                <FormHelperText id="import-error-text">{importErrorText}</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>

                {/* Snackbar to indicate status of import */}
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.importSnackbarVisible}
                    autoHideDuration={2000}
                    onClose={this.handleCloseImportSnackbar}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                        className: snackbarClass
                    }}
                    message={<span id="message-id">{this.state.importStatusMsg}</span>}
                    action={[
                        <IconButton
                          key="close"
                          aria-label="Close"
                          color="inherit"
                          className={classes.close}
                          onClick={this.handleCloseImportSnackbar}
                        >
                          <CloseIcon />
                        </IconButton>
                      ]} />
            </div>
        )
    }
}

ImportRecipe.propTypes = {
    classes: PropTypes.object.isRequired,
    clearTags: PropTypes.func.isRequired,
    clearRecipesCache: PropTypes.func.isRequired
};

export default connect(null, { clearTags, clearRecipesCache })(withStyles(styles, { withTheme: true })(ImportRecipe));