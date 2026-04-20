"use client";

import {
    authService
} from "@/services/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Query keys for React Query
export const authKeys = {
	all: ["auth"] as const,
	profile: () => [...authKeys.all, "profile"] as const,
};

// Custom hook for authentication state
export function useAuthState() {
	const [token, setToken] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		if (storedToken) {
			setToken(storedToken);
		}
		setIsInitialized(true);
	}, []);

	const setAuthToken = (newToken: string | null) => {
		setToken(newToken);
		if (newToken) {
			localStorage.setItem("token", newToken);
		} else {
			localStorage.removeItem("token");
		}
	};

	return {
		token,
		setToken: setAuthToken,
		isInitialized,
		isAuthenticated: !!token,
	};
}

// Hook for user profile data
export function useProfile() {
	const { token, isAuthenticated } = useAuthState();

	return useQuery({
		queryKey: authKeys.profile(),
		queryFn: authService.getProfile,
		enabled: isAuthenticated && !!token,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: (failureCount, error: any) => {
			// Don't retry on 401 errors (unauthorized)
			if (error?.response?.status === 401) {
				return false;
			}
			return failureCount < 2;
		},
	});
}

// Hook for login mutation
export function useLogin() {
	const queryClient = useQueryClient();
	const { setToken } = useAuthState();
	const router = useRouter();

	return useMutation({
		mutationFn: authService.login,
		onSuccess: (data) => {
			setToken(data.token);
			// Set user data in cache
			queryClient.setQueryData(authKeys.profile(), data.user);
			toast.success("Login successful!");
			router.push("/dashboard");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Login failed");
		},
	});
}

// Hook for register mutation
export function useRegister() {
	const queryClient = useQueryClient();
	const { setToken } = useAuthState();
	const router = useRouter();

	return useMutation({
		mutationFn: authService.register,
		onSuccess: (data) => {
			setToken(data.token);
			// Set user data in cache
			queryClient.setQueryData(authKeys.profile(), data.user);
			toast.success("Registration successful!");
			router.push("/dashboard");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Registration failed");
		},
	});
}

// Hook for profile update mutation
export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.updateProfile,
		onSuccess: (updatedUser) => {
			// Update the profile cache
			queryClient.setQueryData(authKeys.profile(), updatedUser);
			// Invalidate to ensure fresh data
			queryClient.invalidateQueries({ queryKey: authKeys.profile() });
			toast.success("Profile updated successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update profile");
		},
	});
}

// Hook for logout
export function useLogout() {
	const queryClient = useQueryClient();
	const { setToken } = useAuthState();
	const router = useRouter();

	const logout = () => {
		setToken(null);
		localStorage.removeItem("user"); // Remove old user data
		// Clear all cached data
		queryClient.clear();
		router.push("/login");
		toast.success("Logged out successfully");
	};

	return logout;
}

// Main auth hook that combines everything
export function useAuth() {
	const { token, isAuthenticated, isInitialized } = useAuthState();
	const { data: user, isLoading: isProfileLoading, error } = useProfile();
	const logout = useLogout();

	// Handle auth errors (like token expiration)
	useEffect(() => {
		if (error && (error as any)?.response?.status === 401) {
			logout();
		}
	}, [error, logout]);

	return {
		// User data
		user: user || null,
		token,

		// Loading states
		isLoading: !isInitialized || (isAuthenticated && isProfileLoading),
		isAuthenticated,

		// Role helpers
		isRecruiter: user?.role === "recruiter",
		isCandidate: user?.role === "candidate",
		isAdmin: user?.role === "admin",

		// Actions
		logout,
	};
}
