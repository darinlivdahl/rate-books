import { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewForm from './ReviewForm';
import ReviewFormEdit from './ReviewFormEdit';
import Review from './Review';
import StarRating from './StarRating';

function BookDetail(props) {
    /*
        Use function to rerender component to show new or
        updated review and book rating
    */
    const [key, setKey] = useState(0);
    const forceRerender = () => {
        setKey(prevKey => prevKey + 1); // Changing key forces re-render
    }
    // Props
    const { appUser, bookId, image, title, author, description, publisher, rank } = props;
    const [loggedInUserHasReviewed, setLoggedInUserHasReviewed] = useState(false);
    const [showReviewSection, setShowReviewSection] = useState(false);
    const [isReviewEdit, setIsReviewEdit] = useState(false);
    const [reviewId, setReviewId] = useState(null);
    const [displayRating, setDisplayRating] = useState(0);
    const [reviewList, setReviewList] = useState([]);

    useEffect(() => { 
        const fetchData = async () => {
            try {
                // Get book reviews data
                const getReviewsResponse = await axios.get('/api/reviews/' + bookId);
                setReviewList(getReviewsResponse.data);

                // Check if logged in user has already reviewed the book
                if (appUser) {
                    let tempReviewsArray = getReviewsResponse.data;
                    let checkReviewed = false;
                    tempReviewsArray.forEach(r => {
                        if (r.user_id == appUser.id) {
                            // console.log('logged in user has already reviewed this book, do not show form.');
                            checkReviewed = true;
                            return false;
                        } else {
                            // console.log('logged in user does not own this review');
                            checkReviewed = false;
                        }
                    });
                    setLoggedInUserHasReviewed(checkReviewed);
                    tempReviewsArray = [];
                    // Determine if the review section with form should be displayed
                    if (loggedInUserHasReviewed === false || (loggedInUserHasReviewed && isReviewEdit)) {
                        setShowReviewSection(true);
                    } else {
                        setShowReviewSection(false);
                    }
                }
                
                // Get book ratings data
                const getRatingResponse = await axios.get('/api/rating/' + bookId);
                if (getRatingResponse.data[0] !== undefined) {
                    setDisplayRating(getRatingResponse.data[0].rating);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Axios Error:', error.response ? error.response.data : error.message);
                } else {
                    console.error('General Error:', error.message);
                }
            }
        };
        fetchData();
    }, [key, appUser, bookId, loggedInUserHasReviewed, showReviewSection, isReviewEdit]);

    function handleReviewEdit(reviewId) {
        setIsReviewEdit(true);
        setReviewId(reviewId);
        // scroll to review section
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function handleCancelReviewEdit() {
        setIsReviewEdit(false);
    }

    function handleRerender() {
        forceRerender();
        setIsReviewEdit(false);
    }

    function ReviewContainerAlt() {
        if (appUser && loggedInUserHasReviewed) {
            return <p class="mb-8">You have reviewed this book.</p>;
        } else {
            return <p class="mb-8"><a href="/login" class="text-emerald-600 cursor-pointer">Login</a> to post a book review.</p>;
        }
    }

    return (
        <div key={key}>
            <div class="flex flex-col md:flex-row gap-2 mb-6">
                <div class="flex-1">
                    <img src={image} alt="book cover" />
                </div>
                <div class="flex-1">
                    <dl>
                        <dt class="font-bold font-sans">Title</dt>
                        <dd class="font-serif mb-2">{title}</dd>
                        
                        <dt class="font-sans font-bold">Author</dt>
                        <dd class="font-serif mb-2">{author}</dd>
                        
                        <dt class="font-sans font-bold">Description</dt>
                        <dd class="font-serif mb-2">{description}</dd>
                        
                        <dt class="font-sans font-bold">Publisher</dt>
                        <dd class="font-serif mb-2">{publisher}</dd>
                        
                        <dt class="font-sans font-bold">Rank</dt>
                        <dd class="font-serif mb-2">{rank}</dd>
                        
                        <dt class="font-sans font-bold">Rating</dt>
                        <dd class="font-serif mb-2"><StarRating rating={displayRating} /></dd>
                    </dl>
                </div>
            </div>

            <div id="review-container">
            {showReviewSection ? (
                    <>
                        {isReviewEdit ? (<ReviewFormEdit bookId={bookId} reviewId={reviewId} onCancelReviewEdit={handleCancelReviewEdit} onSuccess={handleRerender} />) : (<ReviewForm loggedInUser={appUser} bookId={bookId} onSuccess={handleRerender} />)}
                    </>
                ) : (
                    <ReviewContainerAlt />
                )
            }
            </div>
            
            <div class="mb-6">
                <h2 class="font-serif text-1xl md:text-2xl font-semibold mb-2">Reviews</h2>
                {reviewList.length ? (reviewList.map(r => 
                    <Review key={r.id} loggedInUser={appUser} reviewUserName={r.name} id={r.id} reviewUserId={r.user_id} title={r.title} body={r.body} rating={r.rating} onEdit={handleReviewEdit} />
                )) : (<p>No reviews at this time.</p>)}         
            </div>
        </div>
    );
}

export default BookDetail;