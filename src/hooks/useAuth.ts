"use client";

import { authService } from "@/services/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import toast from "react-hot-toast";

export const authKeys = {
	all: ["auth"] as const,
	profile: () => [...authKeys.all, "profile"] as const,
};

// ---------------------------------------------------------------------------
// Module-level token store — shared across ALL hook instances
// ---------------------------------------------------------------------------
type Listener = () => void;
const listeners = new Set<Listener>();

let _token: string | null = null;
let _initialized = false;

function notifyListeners() {
	listeners.forEach((l) => l());
}

function initToken() {
	if (_initialized) return;
	_initialized = true;
	if (typeof window !== "undefined") {
		_token = localStorage.getItem("token");
	}
	notifyListeners();
}

export function setToken(token: string | null) {
	_token = token;
	if (typeof window !== "undefined") {
		if (token) {
			localStorage.setItem("token", token);
		} else {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		}
	}
	notifyListeners();
}

function subscribe(listener: Listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

// Return primitives — NOT objects — so useSyncExternalStore can compare by value
const getTokenSnapshot = () => _token;
const getInitializedSnapshot = () => _initialized;
const getServerToken = () => null;
const getServerInitialized = () => false;

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export function useAuthState() {
	if (typeof window !== "undefined" && !_initialized) {
		initToken();
	}

	const token = useSyncExternalStore(
		subscribe,
		getTokenSnapshot,
		getServerToken,
	);
	const initialized = useSyncExternalStore(
		subscribe,
		getInitializedSnapshot,
		getServerInitialized,
	);

	return {
		token,
		isInitialized: initialized,
		isAuthenticated: !!token,
	};
}

export function useProfile() {
	const { token, isAuthenticated, isInitialized } = useAuthState();

	return useQuery({
		queryKey: authKeys.profile(),
		queryFn: authService.getProfile,
		enabled: isInitialized && isAuthenticated && !!token,
		staleTime: 5 * 60 * 1000,
		retry: (failureCount, error: any) => {
			if (error?.response?.status === 401) return false;
			return failureCount < 2;
		},
	});
}

// Module-level guard — prevents double logout
let isLoggingOut = false;

export function useLogin() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: authService.login,
		onSuccess: (data) => {
			isLoggingOut = false;
			setToken(data.token);
			queryClient.setQueryData(authKeys.profile(), data.user);
			toast.dismiss();
			toast.success("Welcome back!");
			router.push("/dashboard");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Login failed");
		},
	});
}

export function useRegister() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: authService.register,
		onSuccess: (data) => {
			isLoggingOut = false;
			setToken(data.token);
			queryClient.setQueryData(authKeys.profile(), data.user);
			toast.dismiss();
			toast.success("Account created! Welcome to NextRole.");
			router.push("/dashboard");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Registration failed");
		},
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.updateProfile,
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(authKeys.profile(), updatedUser);
			queryClient.invalidateQueries({ queryKey: authKeys.profile() });
			toast.success("Profile updated successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update profile");
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return () => {
		if (isLoggingOut) return;
		isLoggingOut = true;

		setToken(null);
		queryClient.cancelQueries();
		queryClient.clear();
		toast.dismiss();
		toast.success("Logged out successfully");
		router.replace("/login");

		setTimeout(() => {
			isLoggingOut = false;
		}, 2000);
	};
}

export function useAuth() {
	const { token, isAuthenticated, isInitialized } = useAuthState();
	const { data: user, isLoading: isProfileLoading, error } = useProfile();
	const logout = useLogout();
	const logoutCalledRef = useRef(false);

	useEffect(() => {
		if (
			error &&
			(error as any)?.response?.status === 401 &&
			!logoutCalledRef.current
		) {
			logoutCalledRef.current = true;
			logout();
		}
	}, [error]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (isAuthenticated) logoutCalledRef.current = false;
	}, [isAuthenticated]);

	return {
		user: user || null,
		token,
		isLoading: !isInitialized || (isAuthenticated && isProfileLoading),
		isAuthenticated,
		isRecruiter: user?.role === "recruiter",
		isCandidate: user?.role === "candidate",
		isAdmin: user?.role === "admin",
		logout,
	};
}
