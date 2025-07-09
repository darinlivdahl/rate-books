import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import Header from './Header';
import Menu from './Menu';
import BookDetail from './BookDetail';
import Books from './Books';
import Footer from './Footer';

function App() {
	const [user, setUser] = useState(null);
	const [isSearchVisible] = useState(true);
	const [bookListName, setBookListName] = useState('hardcover-fiction');
	const [bookListDisplayName, setBookListDisplayName] = useState('Hardcover Fiction');
	const [isBookDetail, setIsBookDetail] = useState(false);
	const [bookShowDetails, setBookShowDetails] = useState({});

	useEffect(() => {
		axios.get('http://localhost:8080/auth/current-user', { withCredentials: true })
		.then(res => setUser(res.data.user))
		.catch(() => setUser(null));
	}, []);

	const handleLogout = () => {
		axios.get('http://localhost:8080/auth/logout', { withCredentials: true })
		.then(() => setUser(null));
	}

	function handleListChange(listDetail) {
		setIsBookDetail(false); // reset Book content area
		setBookListName(listDetail.encodedListName);
		setBookListDisplayName(listDetail.displayListName);
	}

	function handleBookShowDetail(detail) {
		setBookShowDetails(detail);
		setIsBookDetail(true);
	}

	function BookContent() {
		if (isBookDetail) {
			return <BookDetail
				appUser={user}
				bookId={bookShowDetails.bookId}
				image={bookShowDetails.bookImage}
				title={bookShowDetails.bookTitle}
				author={bookShowDetails.bookAuthor}
				description={bookShowDetails.bookDescription}
				publisher={bookShowDetails.bookPublisher}
				rank={bookShowDetails.bookRank}
			/>;
		} else {
			return <Books
				list={bookListName}
				listheading={bookListDisplayName}
				onBookShowDetail={handleBookShowDetail}
			/>;
		}
	}

	return (
		<>
			<Header appUser={user} showSearch={isSearchVisible} onHandleLogout={handleLogout} />
			<main>
				<div class="container w-[90%] md:w-[80%] 2xl:w-[70%] mx-auto mt-4 md:mt-6 lg:mt-10">
					<section>
						<div class="container">
							<div class="flex flex-col lg:flex-row">
								<div class="flex-1">
									<Menu onListChange={handleListChange} />
								</div>
								<div class="flex-2">
									<BookContent />
								</div>
							</div>
						</div>
					</section>
				</div>
			</main>
			<Footer />
		</>
	)
}

export default App;
