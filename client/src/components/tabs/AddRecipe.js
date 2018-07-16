import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Recipe from '../Recipe';

class AddRecipe extends Component {
    render() {
        return (
            <div>
                <Typography variant="body1" gutterBottom>
                    Fill out this form to manually add a recipe the database.
                </Typography>
                <Typography variant="body1" gutterBottom>
                    You do not need to explicitly save: your results will be saved as you enter them.
                </Typography>

                <Recipe edit='true' />
            </div>
        );
    }
}

export default AddRecipe; 