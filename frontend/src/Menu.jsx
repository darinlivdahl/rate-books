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
					let tempArr = [];
					const listData = response.data;
					listData.forEach(l => {
						tempArr.push({
							display_name: l.display_name,
							list_name_encoded: l.list_name_encoded,
							list_id: l.list_id
						});
					});
					setMenuList(tempArr);
					sessionStorage.setItem('menu', JSON.stringify(tempArr));
				} catch (error) {
					console.error("Error fetching menu data:", error);
				} finally {
					console.log('Fetch menu data complete.');
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