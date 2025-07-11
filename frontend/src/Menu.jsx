import { useState, useEffect } from 'react';
import axios from 'axios';

function Menu(props) {
	const [menuList, setMenuList] = useState([]);

	useEffect(() => {
		const storedMenuStr = sessionStorage.getItem('menu');
		if (storedMenuStr) {
			const storedMenu = JSON.parse(storedMenuStr);
			setMenuList(storedMenu);
		} else {
			const fetchData = async () => {
				try {
					const response = await axios.get('/api/menu'); // Express endpoint
					
					let tempListArr = [];
					let tempSearchDataArr = [];
					const overviewData = response.data;
					overviewData.forEach(o => {
						// Get list data for menu
						tempListArr.push({
							display_name: o.display_name,
							list_name_encoded: o.list_name_encoded,
							list_id: o.list_id
						});
						// Get search data
						if (o.books) {
							o.books.forEach(b => {
								tempSearchDataArr.push({
									author: b.author,
									book_image: b.book_image,
									description: b.description,
									publisher: b.publisher,
									rank: b.rank,
									title: b.title,
									isbns: [{
										isbn10: b.isbns[0].isbn10,
										isbn13: b.isbns[0].isbn13
									}],
									list: o.display_name
								});
							});
						}
					});
					setMenuList(tempListArr);
					sessionStorage.setItem('menu', JSON.stringify(tempListArr));
					// Store overview book listing for searchable data
					sessionStorage.setItem('searchData', JSON.stringify(tempSearchDataArr));
					tempListArr = null; // cleanup
					tempSearchDataArr = null // cleanup
				} catch (error) {
					console.error("Error fetching menu data:", error);
				}
			};
			fetchData();
		}
	}, []);

	function handleClick(event) {
		event.preventDefault();
		const listDetails = {
			encodedListName: event.target.dataset.listname,
			displayListName: event.target.dataset.displayname
		}
		props.onListChange(listDetails);
	}

	return (
		<>
			<h2 class="font-serif text-1xl md:text-2xl font-semibold mb-2">Best Seller Lists</h2>
			<ul class="mb-6">
			{menuList.map(m =>
				<li key={m.list_id}><a href="#" class="text-emerald-600" data-listname={m.list_name_encoded} data-displayname={m.display_name} onClick={handleClick}>{m.display_name}</a></li>
			)}
			</ul>
		</>
	);
}

export default Menu;