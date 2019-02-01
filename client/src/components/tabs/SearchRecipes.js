import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import SearchBar from 'material-ui-search-bar'
import {debounce} from 'throttle-debounce';
import RecipeTable from '../tables/RecipeTable';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { MAIN_TITLE } from '../../App';
import { toggleSearchTabOnlyFavorites } from '../../actions/actions';

const SEARCH_ANY = 'any';

const styles = theme => ({
    container: {
        width: '90%',
        maxWidth: 1000
    },
    searchByFormControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    }
  });

class SearchRecipes extends Component {
    state = {
        searchBarValue: '',
        searchBy: SEARCH_ANY
    };

    constructor(props) {
        super(props);
        this.handleSearchBarChangeEvent = debounce(500, this.handleSearchBarChangeEvent);
    }

    handleSearchBarChange = event => {
        this.handleSearchBarChangeEvent(event);
    }

    handleSearchBarChangeEvent(value) {
        this.setState({
          searchBarValue: value
        });
    }

    handleOnlyFavoritesChange = event => {
        this.props.toggleSearchTabOnlyFavorites();
    }

    handleSearchByChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
     }

    render() {
        const { classes, showOnlyFavorites } = this.props;

        return (
            <div>
                <Helmet>
                    <title>{`Search Recipes - ${MAIN_TITLE}`}</title>
                </Helmet>
                <Typography variant="body1" gutterBottom>
                    Search for recipes using the search bar below.
                </Typography>

                <FormGroup row>
                    <FormControlLabel
                        control={
                            <Switch
                            checked={showOnlyFavorites}
                            onChange={this.handleOnlyFavoritesChange.bind('this')}
                            value='onlyFavorites'
                            color='primary'
                            />
                        }
                        label="Only show favorites"
                    />
                </FormGroup>

                <FormGroup row>
                    <FormControl className={classes.searchByFormControl}>
                        <InputLabel htmlFor="search-by-label">
                            Search by...
                        </InputLabel>
                        <Select
                            value={this.state.searchBy}
                            onChange={this.handleSearchByChange}
                            inputProps={{
                                name: 'searchBy',
                                id: 'search-by-label',
                            }}
                            displayEmpty
                            className={classes.selectEmpty}
                        >
                            <MenuItem value={SEARCH_ANY}>any</MenuItem>
                            <MenuItem value={'title'}>title</MenuItem>
                            <MenuItem value={'source'}>source</MenuItem>
                            <MenuItem value={'tags'}>tags</MenuItem>
                            <MenuItem value={'ingredients'}>ingredients</MenuItem>
                            <MenuItem value={'serves'}>number of servings</MenuItem>
                        </Select>
                    </FormControl>
                </FormGroup>

                <SearchBar
                    className={classes.container}
                    value={this.state.searchBarValue}
                    onChange={this.handleSearchBarChange.bind('this')}
                    placeholder="Search for recipe"
                />

                <RecipeTable onlyFavorites={showOnlyFavorites || false} />

            </div>
        );
    }
}

SearchRecipes.propTypes = {
    classes: PropTypes.object.isRequired,
    showOnlyFavorites: PropTypes.bool,
    toggleSearchTabOnlyFavorites: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    const { showOnlyFavorites } = state.searchTabOnlyFavorites;
    return { showOnlyFavorites };
};

export default connect(mapStateToProps, { toggleSearchTabOnlyFavorites })(withStyles(styles, { withTheme: true })(SearchRecipes));

