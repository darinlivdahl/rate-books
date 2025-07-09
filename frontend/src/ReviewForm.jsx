import { useState } from 'react';

function ReviewForm(props) {

    const { loggedInUser, bookId, onSuccess } = props;
    const [formData, setFormData] = useState({ userId: loggedInUser.id, bookId: bookId, reviewTitle: '', reviewBody: '', reviewRating: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //? Use Axios instead
            const response = await fetch("http://localhost:8080/api/create-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            /* 
                If successfull, update status message to user and reset form
            */
            if (result.success) {
                onSuccess();
                // setMessage("Review submitted successfully!");
            } else {
                setMessage("Failed to submit review.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error occurred.");
        }
    };

    return (
        <>
            <h2 class="font-serif text-1xl md:text-2xl font-semibold mb-4">Write a Review</h2>
            <form id="review-form" onSubmit={handleSubmit} class="mb-10">
                <div class="mb-4">
                    <label class="inline-block font-sans font-bold" htmlFor="review-title">Title</label>
                    <input type="text" id="review-title" name="reviewTitle" class="block w-full bg-white inset-shadow-xs border border-gray-300 rounded-xl p-2 pr-4 pl-4 mr-1" onChange={handleChange} required />
                </div>
                <div class="mb-4">
                    <label class="inline-block font-sans font-bold" htmlFor="review-body">Body</label>
                    <textarea id="review-body" name="reviewBody" class="block w-full h-[160] bg-white inset-shadow-xs border border-gray-300 rounded-xl p-2 pr-4 pl-4 mr-1" onChange={handleChange}></textarea>
                </div>
                <div class="mb-6">
                    <label class="inline-block font-sans font-bold" htmlFor="review-rating">Rating</label>
                    <select id="review-rating" name="reviewRating" class="block bg-white inset-shadow-xs border border-gray-300 rounded-xl p-2 pr-4 pl-4 mr-1" onChange={handleChange} required>
                        <option>Please Select</option>
                        <option value="1">⭐</option>
                        <option value="2">⭐⭐</option>
                        <option value="3">⭐⭐⭐</option>
                        <option value="4">⭐⭐⭐⭐</option>
                        <option value="5">⭐⭐⭐⭐⭐</option>
                    </select>
                </div>
                <div class="block">
                    <button type="submit" class="inline-block bg-emerald-600 text-white rounded-xl p-2 pr-4 pl-4 mr-2 cursor-pointer">Submit</button>
                </div>
                <p class="mt-4">{message}</p>
            </form>
        </>
    )
}

export default ReviewForm;