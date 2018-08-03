import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper
  },
});

class App extends Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { classes, theme } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        
        <Typography variant="title" align="center" gutterBottom>Recipe Database 2.0</Typography>

        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >
            <Tab icon={<SearchIcon />} label="Search" />
            <Tab icon={<CreateIcon />} label="Add" />
            <Tab icon={<CloudDownloadIcon />} label="Import" />
          </Tabs>
        </AppBar>

        {value === 0 && <TabContainer dir={theme.direction}>Search tab</TabContainer>}
        {value === 1 && <TabContainer dir={theme.direction}><AddRecipe /></TabContainer>}
        {value === 2 && <TabContainer dir={theme.direction}><ImportRecipe /></TabContainer>}
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(App);
