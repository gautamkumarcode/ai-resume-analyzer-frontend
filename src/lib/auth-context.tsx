"use client";

import { useAuth as useAuthHook, useLogin, useRegister } from "@/hooks/useAuth";
import { User, UserRole } from "@/types";
import { createContext, ReactNode, useContext } from "react";

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	logout: () => void;
	isLoading: boolean;
	isAuthenticated: boolean;
	isRecruiter: boolean;
	isCandidate: boolean;
	isAdmin: boolean;
}

export interface RegisterData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const auth = useAuthHook();
	const loginMutation = useLogin();
	const registerMutation = useRegister();

	const login = async (email: string, password: string) => {
		await loginMutation.mutateAsync({ email, password });
	};

	const register = async (data: RegisterData) => {
		await registerMutation.mutateAsync(data);
	};

	return (
		<AuthContext.Provider
			value={{
				user: auth.user,
				token: auth.token,
				login,
				register,
				logout: auth.logout,
				isLoading:
					auth.isLoading ||
					loginMutation.isPending ||
					registerMutation.isPending,
				isAuthenticated: auth.isAuthenticated,
				isRecruiter: auth.isRecruiter,
				isCandidate: auth.isCandidate,
				isAdmin: auth.isAdmin,
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
