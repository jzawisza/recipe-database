import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Router, Route } from 'react-router-dom';
import history from './components/utils/History';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabContainer from './components/TabContainer';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';
import CreateIcon from '@material-ui/icons/Create';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import AddRecipe from './components/tabs/AddRecipe';
import ImportRecipe from './components/tabs/ImportRecipe';
import SearchRecipes from './components/tabs/SearchRecipes';
import ViewRecipe from './components/tabs/ViewRecipe';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper
  },
  viewTab: {
    display: 'none'
  }
});

class App extends Component {
  // The Link component from react-router doesn't play well with the Tab component
  // from Material UI, so we'll do history management programatically
  // See: https://github.com/ReactTraining/react-router/blob/master/FAQ.md#how-do-i-access-the-history-object-outside-of-components
  changeTab = (event, value) => {
    history.push(`/${value}`);
  };

  componentDidMount() {
    // Automatically redirect to the search route when we load the app
    history.push('/search');
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <Router history={history}>
      <div className={classes.root}>
        
        <Typography variant="title" align="center" gutterBottom>Recipe Database 2.0</Typography>

        <AppBar position="static" color="default">
          <Tabs
            value="search"
            onChange={this.changeTab}
            indicatorColor="primary"
            textColor="primary"
            fullWidth={true}
          >

            <Tab icon={<SearchIcon />} label="Search" value="search" />
            <Tab icon={<CreateIcon />} label="Add" value="add" />
            <Tab icon={<CloudDownloadIcon />} label="Import" value="import" />
            <Tab className={classes.viewTab} label="View" value="recipes" />
          </Tabs>
        </AppBar>

        <Route path='/search' render={() => <TabContainer dir={theme.direction}><SearchRecipes /></TabContainer>} />
        <Route path='/add' render={() => <TabContainer dir={theme.direction}><AddRecipe /></TabContainer>} />
        <Route path='/import' render={() => <TabContainer dir={theme.direction}><ImportRecipe /></TabContainer>} />
        <Route path='/recipes/:id' render={() => <TabContainer dir={theme.direction}><ViewRecipe /></TabContainer>} />

      </div>
      </Router>
    );
  }
}
App.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(App);
