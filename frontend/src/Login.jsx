import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Login = () => {
	const [form, setForm] = useState({ email: '', password: '' });
	const [isSearchVisible] = useState(false);
	const navigate = useNavigate();

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios.post('http://localhost:8080/auth/login', form, { withCredentials: true });
			navigate('/');
		} catch {
			alert('Invalid credentials');
		}
	};

	return (
		<>
			<Header showSearch={isSearchVisible} />
			<main>
				<div class="container w-[90%] md:w-[80%] 2xl:w-[70%] mx-auto mt-4 md:mt-6 lg:mt-10">
					<section>	
						<div class="w-full md:max-w-sm ml-auto mr-auto">
							<form onSubmit={handleSubmit} class="mt-4 mb-10">
								<h2 class="font-serif text-1xl md:text-2xl font-semibold mb-4">Login with Email</h2>
								<input name="email" placeholder="Email" value={form.email} onChange={handleChange} class="block w-full bg-white inset-shadow-xs border border-gray-300 rounded-xl p-2 pr-4 pl-4 mr-1" required /><br />
								<input type="password" name="password" placeholder="Password" value={form.password} class="block w-full bg-white inset-shadow-xs border border-gray-300 rounded-xl p-2 pr-4 pl-4 mr-1" onChange={handleChange} required /><br />
								<button type="submit" class="inline-block bg-emerald-600 text-white rounded-xl p-2 pr-4 pl-4 mr-2 cursor-pointer">Login</button>

								<h2 class="font-serif text-1xl md:text-2xl font-semibold mb-4 mt-6">OR</h2>
								<a class="inline-block bg-emerald-600 text-white rounded-xl p-2 pr-4 pl-4 mr-2 cursor-pointer" href="http://localhost:8080/auth/google">Login with Google</a>
							</form>
						</div>
					</section>
				</div>
			</main>
			<Footer />
		</>
	);
};

export default Login;