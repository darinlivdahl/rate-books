import StarRating from './StarRating';

function Review(props) {

    const { loggedInUser, reviewUserName, reviewUserId, id, title, body, rating, onEdit } = props;

    function handleReviewEdit() {
        onEdit(id);
    }

    function EditButton() {
        if (loggedInUser !== null && loggedInUser.id == reviewUserId) {
            return (
                <div class="float-right">
                    <button class="block bg-emerald-600 text-white rounded-xl p-2 pr-4 pl-4 cursor-pointer" onClick={handleReviewEdit}>Edit</button>
                </div>
            );
        }
    }

    return (
        <>
            <hr />
            <div class="mt-4 mb-4">
                <EditButton />
                <dl>
                    <dt class="font-sans font-bold">User</dt>
                    <dd class="pl-4 mb-2">{reviewUserName}</dd>
                    <dt class="font-sans font-bold">Title</dt>
                    <dd class="pl-4 mb-2">{title}</dd>
                    <dt class="font-sans font-bold">Review</dt>
                    <dd class="pl-4 mb-2">{body}</dd>
                    <dt class="font-sans font-bold">Rating</dt>
                    <dd class="pl-4 mb-2"><StarRating rating={rating} /></dd>
                </dl>
            </div>
        </>
    );
}

export default Review;