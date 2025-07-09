import { useState, useEffect } from 'react';
import axios from 'axios';
import BookPreview from './BookPreview';

function Books(props) {

    const { list, listheading, search, onBookShowDetail } = props;
    const [bookList, setBookList] = useState([]);

    useEffect(() => { 
        if (search) {
            const storedSearchDataStr = sessionStorage.getItem('searchData');
            const searchContextData = JSON.parse(storedSearchDataStr);
            // Filter searchContextData based on search term
            const searchResults = searchContextData.filter(b => {
                const searchTerm = search.toLowerCase();
                const searchTitle = b.title.toLowerCase();
                const searchAuthor = b.author.toLowerCase();
                return searchTitle.includes(searchTerm) || searchAuthor.includes(searchTerm);
            });
            // Set bookList property with filtered data
            setBookList(searchResults);
        } else {
            const storedBookListStr = sessionStorage.getItem(list);
            if (storedBookListStr) {
                const storedBookList = JSON.parse(storedBookListStr);
                setBookList(storedBookList);
            } else {
                const fetchData = async () => {
                    try {
                        const response = await axios.get('/api/books/' + list);
                        let tempArr = [];
                        const bookData = response.data;
                        bookData.forEach(b => {
                            tempArr.push({
                                author: b.author,
                                book_image: b.book_image,
                                description: b.description,
                                publisher: b.publisher,
                                rank: b.rank,
                                title: b.title,
                                isbns: [{
                                    isbn10: b.isbns[0].isbn10,
                                    isbn13: b.isbns[0].isbn13
                                }]
                            });
                        });
                        setBookList(tempArr);
                        sessionStorage.setItem(list, JSON.stringify(tempArr));
                    } catch (error) {
                        console.error(error);
                    }
                };
                fetchData();
            }
        }
    }, [list, search]);
    
    function handleBookSelected(bookDetail) {
        onBookShowDetail(bookDetail);
    }

    return (
        <>
            <h2 class="font-serif text-1xl md:text-2xl font-semibold mb-4 md:mb-6 lg:mb-12">
                {search ? (
                    <>Search Results for : {search}</>
                ) : (
                    <>Best Sellers List - {listheading}</>
                )}
            </h2> 
            <ul class="grid grid-cols-1 lg:grid-cols-2 gap-y-12 mb-12">
                {bookList.map(b =>
                    <BookPreview
                        key={b.isbns[0].isbn10 || b.isbns[0].isbn13}
                        id={b.isbns[0].isbn10 || b.isbns[0].isbn13}
                        image={b.book_image}
                        title={b.title}
                        author={b.author}
                        description={b.description}
                        publisher={b.publisher}
                        rank={b.rank}
                        list={b.list}
                        onBookSelected={handleBookSelected}
                    />
                )}
            </ul>
        </>
    )
}

export default Books;