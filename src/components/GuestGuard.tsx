"use client";

import { useAuthState } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirects authenticated users away from public-only pages (/, /login, /register)
 * to the dashboard.
 */
export default function GuestGuard({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAuthenticated, isInitialized } = useAuthState();
	const router = useRouter();

	useEffect(() => {
		if (isInitialized && isAuthenticated) {
			router.replace("/dashboard");
		}
	}, [isAuthenticated, isInitialized, router]);

	// While initializing, render nothing to avoid flash
	if (!isInitialized) return null;

	// If authenticated, render nothing while redirect is in flight
	if (isAuthenticated) return null;

	return <>{children}</>;
}
