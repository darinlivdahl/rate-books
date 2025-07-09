function StarRating(props) {

    const { rating } = props;

    function Stars() {
        let starString = "";
        if (rating > 0) {
            for (let i = 0; i < rating; i++) {
                starString += "⭐";
            }
            return starString + ' (' + rating + ' out of 5 stars)';
        } else {
            return "(not yet rated)";
        }
    }
    return (
        <Stars />
    );
}

export default StarRating;