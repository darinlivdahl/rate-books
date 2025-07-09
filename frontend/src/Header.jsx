import { useState } from 'react';

function Header(props) {

    const { appUser, showSearch, onHandleSearch, onHandleLogout } = props;
    const [searchTerm, setSearchTerm] = useState('');

    function handleSearchChange(e) {
        setSearchTerm(e.target.value);
    }

    function handleSearch(e) {
        e.preventDefault();
        onHandleSearch(searchTerm);
        // Reset search input after submission
        const searchForm = document.getElementById('search-form');
        searchForm.reset();
    }

    return (
        <>
            <header class="bg-emerald-50 shadow-md">
                <div class="container w-[90%] md:w-[80%] 2xl:w-[70%] mx-auto">
                    <section>
                        <div class="flex flex-col lg:flex-row flex-wrap justify-between pt-4 pb-4 md:pt-6 md:pb-6 lg:pt-10 lg:pb-10">
                            <div class="flex-1">
                                <h1 class="font-serif text-3xl sm:text-4 md:text-6xl font-bold"><a href="/" class="text-emerald-600" title="Return to home">Rate Books</a></h1>
                                <h2 class="font-serif text-1xl sm:text-2 md:text-3xl font-medium">New York Times Best Sellers List</h2>
                            </div>
                            <div class="flex-none">
                                <nav class="mt-2 md:mt-4 lg:mt-0">
                                    <ul class="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-10 justify-items-start items-start md:items-center">
                                        <li class="flex-shrink w-auto">
                                            {showSearch && (
                                                <form id="search-form">
                                                    <input class="bg-white inset-shadow-xs border border-gray-300 rounded-xl p-2 pr-4 pl-4 mr-1" type="search" placeholder="Title or Author" onChange={handleSearchChange} />
                                                    <button class="bg-emerald-600 text-white rounded-xl p-2 pr-4 pl-4 cursor-pointer" onClick={handleSearch}>Search</button>
                                                </form>
                                            )}
                                        </li>
                                        <li class="flex-shrink w-auto">
                                            {appUser ? (
                                                <>
                                                    <span>{appUser.name}</span> • <button class="text-emerald-600 cursor-pointer" onClick={onHandleLogout}>Logout</button>
                                                </>
                                            ) : (
                                                <>
                                                    <a href="/login" class="text-emerald-600 cursor-pointer">Login</a> | <a href="/register" class="text-emerald-600 cursor-pointer">Register</a>
                                                </>
                                            )}
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </section>
                </div>
            </header>
        </>
      )
}

export default Header;
