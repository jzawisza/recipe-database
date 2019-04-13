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
import { toggleSearchTabOnlyFavorites, setSearchBy, setSearchKeywords } from '../../actions/actions';

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
    constructor(props) {
        super(props);
        this.handleSearchBarChangeEvent = debounce(500, this.handleSearchBarChangeEvent);
    }

    handleSearchBarChange = event => {
        this.handleSearchBarChangeEvent(event);
    }

    handleSearchBarChangeEvent(value) {
        this.props.setSearchKeywords(value);
    }

    handleOnlyFavoritesChange = event => {
        this.props.toggleSearchTabOnlyFavorites();
    }

    handleSearchByChange = event => {
        this.props.setSearchBy(event.target.value);
     }

    render() {
        const { classes, showOnlyFavorites, searchBy, searchKeywords } = this.props;

        let emptySearch = !searchKeywords || searchKeywords === '';

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
                            value={searchBy}
                            onChange={this.handleSearchByChange}
                            inputProps={{
                                name: 'searchBy',
                                id: 'search-by-label',
                            }}
                            displayEmpty
                            className={classes.selectEmpty}
                        >
                            <MenuItem value={'any'}>any</MenuItem>
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
                    value={searchKeywords}
                    onChange={this.handleSearchBarChange.bind('this')}
                    placeholder="Search for recipe"
                />

                <RecipeTable
                    onlyFavorites={showOnlyFavorites || false}
                    searchBy={emptySearch ? undefined : searchBy}
                    searchKeywords={searchKeywords}
                />

            </div>
        );
    }
}

SearchRecipes.propTypes = {
    classes: PropTypes.object.isRequired,
    showOnlyFavorites: PropTypes.bool,
    searchBy: PropTypes.string,
    searchKeywords: PropTypes.string,
    toggleSearchTabOnlyFavorites: PropTypes.func.isRequired,
    setSearchBy: PropTypes.func.isRequired,
    setSearchKeywords: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    const { showOnlyFavorites, searchBy, searchKeywords } = state.searchTab;
    return { showOnlyFavorites, searchBy, searchKeywords };
};

export default connect(mapStateToProps, { toggleSearchTabOnlyFavorites, setSearchBy, setSearchKeywords })(withStyles(styles, { withTheme: true })(SearchRecipes));

