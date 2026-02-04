"use client";

import { User } from "@/types";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import api from "./api";

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	logout: () => void;
	isLoading: boolean;
	isAuthenticated: boolean;
}

interface RegisterData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check for stored auth on mount
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
		}
		setIsLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		const response = await api.post("/auth/login", { email, password });
		const { user, token } = response.data.data;

		localStorage.setItem("token", token);
		localStorage.setItem("user", JSON.stringify(user));

		setToken(token);
		setUser(user);
	};

	const register = async (data: RegisterData) => {
		const response = await api.post("/auth/register", data);
		const { user, token } = response.data.data;

		localStorage.setItem("token", token);
		localStorage.setItem("user", JSON.stringify(user));

		setToken(token);
		setUser(user);
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setToken(null);
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				login,
				register,
				logout,
				isLoading,
				isAuthenticated: !!token,
			}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
