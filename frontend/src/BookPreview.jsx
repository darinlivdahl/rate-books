function BookPreview(props) {

    const { id, image, title, author, description, publisher, rank, list, onBookSelected } = props;

    // Create reference to proxy image of book from external source
    const encodedUrl = encodeURIComponent(image);
    const proxiedImage = `http://localhost:8080/api/proxy-image?url=${encodedUrl}`;

    function handleBookClick(event) {
        event.preventDefault();
        onBookSelected({
            bookId: id,
            bookImage: proxiedImage,
            bookTitle: title,
            bookAuthor: author,
            bookDescription: description,
            bookPublisher: publisher,
            bookRank: rank
        });
    }

    return (
        <li class="flex-1">
            <div class="flex flex-col md:flex-row gap-2">
                <div class="flex-1">
                    <a href="#" onClick={handleBookClick}><img src={proxiedImage} alt="book cover" /></a>
                </div>
                <div class="flex-1">
                    <dl>
                        <dt class="font-bold font-sans">Title</dt>
                        <dd class="font-serif mb-2"><a href="#" class="text-emerald-600" onClick={handleBookClick}>{title}</a></dd>
                        
                        <dt class="font-sans font-bold">Author</dt>
                        <dd class="font-serif mb-2">{author}</dd>
                        
                        <dt class="font-sans font-bold">Publisher</dt>
                        <dd class="font-serif mb-2">{publisher}</dd>
                        
                        <dt class="font-sans font-bold">Rank</dt>
                        <dd class="font-serif mb-2">{rank}</dd>

                        {list && (
                            <>
                                <dt class="font-sans font-bold">List</dt>
                                <dd class="font-serif mb-2">{list}</dd>
                            </>
                        )}
                    </dl>
                    <a href="#" class="block text-emerald-600" onClick={handleBookClick}>Write a Review</a>
                </div>
            </div>
        </li>
    );
}

export default BookPreview;