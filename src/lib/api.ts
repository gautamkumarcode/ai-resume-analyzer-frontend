import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add auth token to requests
api.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

// Handle auth errors — only redirect if NOT already on /login
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			if (typeof window !== "undefined") {
				const isLoginPage = window.location.pathname === "/login";
				if (!isLoginPage) {
					localStorage.removeItem("token");
					localStorage.removeItem("user");
					// Don't hard-reload — let React Router handle it
					window.location.replace("/login");
				}
			}
		}
		return Promise.reject(error);
	},
);

export default api;
