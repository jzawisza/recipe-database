import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import ReviewTable from '../ReviewTable';

const TITLE_MEAL_PLANNER = 'Meal Planner';
const TITLE_FAVORITES = 'Favorites';

const CONTENT_MEAL_PLANNER = [
    'Use this page to review your meal plan for a given time period, e.g. the upcoming week.',
    'Recipes can be deleted from the meal plan one at a time, or all at once.'
];

const CONTENT_FAVORITES = [
    'See all the recipes that you have marked as favorites.',
    'Recipes can be removed from your favorites one at a time, or all at once.'
];

class ReviewRecipes extends Component {
    render() {
        const { isMealPlanner } = this.props;

        let content = isMealPlanner ? CONTENT_MEAL_PLANNER : CONTENT_FAVORITES;
        // Counter to generate unique keys for each paragraph
        let paraCount = 0;

        return (
            <React.Fragment>
                <Typography variant='display1' gutterBottom>
                    {isMealPlanner ? TITLE_MEAL_PLANNER : TITLE_FAVORITES}
                </Typography>       
                {content.map(para => {
                    return (
                        <Typography key={`para${paraCount++}`} variant='body1' gutterBottom>
                            {para}
                        </Typography>
                    );
                })}
                <ReviewTable isMealPlanner={isMealPlanner} />
            </React.Fragment>
        );
    }
}

ReviewRecipes.propTypes = {
    isMealPlanner: PropTypes.bool.isRequired
  };

export default ReviewRecipes;