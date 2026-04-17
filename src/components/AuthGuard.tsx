"use client";

import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
	children: React.ReactNode;
}

/**
 * Wraps protected pages. Redirects unauthenticated users to /login
 * and shows a full-screen spinner while the auth state is being resolved.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<Loader2 className="w-8 h-8 animate-spin text-primary-600" />
			</div>
		);
	}

	if (!isAuthenticated) {
		// Render nothing while the redirect is in flight
		return null;
	}

	return <>{children}</>;
}
