import React, { Component } from 'react';
import Recipe from '../Recipe';

class ViewRecipe extends Component {
    render() {
        const { recipeId } = this.props;
        
        return (
            <React.Fragment>
                <Recipe id={recipeId}/>
            </React.Fragment>
        );
    }
}

export default ViewRecipe; 