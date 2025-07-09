import { useState, useEffect } from 'react';
import axios from 'axios';

function ReviewFormEdit(props) {

    const { reviewId, onSuccess, onCancelReviewEdit } = props;
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');

    useEffect(() => { 
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/review/' + reviewId);
                setFormData({
                    id: response.data[0].id,
                    userId: response.data[0].user_id,
                    bookId: response.data[0].book_id,
                    reviewTitle: response.data[0].title,
                    reviewBody: response.data[0].body,
                    reviewRating: response.data[0].rating
                });
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [reviewId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8080/api/update-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                // setMessage("Review updated successfully!");
                onSuccess();
            } else {
                setMessage("Failed to update.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error occurred.");
        }
    };

    function handleCancelEdit() {
        onCancelReviewEdit();
    }

    const handleDelete = async () => {
        let userConfirmed = confirm('Are you sure you want to delete this review?');
        if (userConfirmed) {
            try {
                const response = await fetch("http://localhost:8080/api/delete-review", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();
                if (result.success) {
                    // setMessage("Review deleted successfully!");
                    // Reset review form after successful delete
                    onSuccess();
                } else {
                    setMessage("Failed to delete.");
                }
            } catch (err) {
                console.error(err);
                setMessage("Error occurred.");
            }
        }
    };

    return (
        <>
            <h2 class="font-serif text-1xl md:text-2xl font-semibold mb-4">Edit a Review</h2>
            <form onSubmit={handleUpdate} class="mb-10">
                <div class="mb-4">
                    <label class="inline-block font-sans font-bold" htmlFor="review-title">Title</label>
                    <input type="text" id="review-title" name="reviewTitle" class="block w-full bg-white inset-shadow-xs border border-gray-300 rounded-xl p-2 pr-4 pl-4 mr-1" onChange={handleChange} value={formData.reviewTitle} required />
                </div>
                <div class="mb-4">
                    <label class="inline-block font-sans font-bold" htmlFor="review-body">Body</label>
                    <textarea id="review-body" name="reviewBody" class="block w-full h-[160] bg-white inset-shadow-xs border border-gray-300 rounded-xl p-2 pr-4 pl-4 mr-1" onChange={handleChange} value={formData.reviewBody}></textarea>
                </div>
                <div class="mb-6">
                    <label class="inline-block font-sans font-bold" htmlFor="review-rating">Rating</label>
                    <select id="review-rating" name="reviewRating" class="block bg-white inset-shadow-xs border border-gray-300 rounded-xl p-2 pr-4 pl-4 mr-1" onChange={handleChange} value={formData.reviewRating} required>
                        <option>Please Select</option>
                        <option value="1">⭐</option>
                        <option value="2">⭐⭐</option>
                        <option value="3">⭐⭐⭐</option>
                        <option value="4">⭐⭐⭐⭐</option>
                        <option value="5">⭐⭐⭐⭐⭐</option>
                    </select>
                </div>
                <div class="block">
                    <button type="button" class="inline-block bg-gray-300 text-black rounded-xl p-2 pr-4 pl-4 mr-2 cursor-pointer" onClick={handleCancelEdit}>Cancel</button>
                    <button type="submit" class="inline-block bg-emerald-600 text-white rounded-xl p-2 pr-4 pl-4 mr-2 cursor-pointer">Update</button>
                    <button type="button" class="inline-block bg-red-600 text-white rounded-xl p-2 pr-4 pl-4 cursor-pointer" onClick={handleDelete}>Delete</button>
                </div>
                <p class="mt-4">{message}</p>
            </form>
        </>
    )
}

export default ReviewFormEdit;