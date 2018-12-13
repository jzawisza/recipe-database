import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Recipe from '../Recipe';
import { Helmet } from 'react-helmet';
import { MAIN_TITLE } from '../../App';

class AddRecipe extends Component {
    render() {
        return (
            <React.Fragment>
                <Helmet>
                    <title>{`Add Recipe - ${MAIN_TITLE}`}</title>
                </Helmet>
                <Typography variant="body1" gutterBottom>
                    Fill out this form to manually add a recipe the database.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    You do not need to explicitly save: your results will be saved as you enter them.
                </Typography>

                <Recipe newRecipe={true}/>
            </React.Fragment>
        );
    }
}

export default AddRecipe; 