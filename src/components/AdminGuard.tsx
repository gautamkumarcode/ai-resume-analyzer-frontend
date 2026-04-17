"use client";

import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminGuardProps {
	children: React.ReactNode;
}

/**
 * Wraps admin-only pages. Redirects non-admin users to /dashboard
 * and shows a full-screen spinner while the auth state is being resolved.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
	const { isAdmin, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAdmin) {
			router.replace("/dashboard");
		}
	}, [isAdmin, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<Loader2 className="w-8 h-8 animate-spin text-primary-600" />
			</div>
		);
	}

	if (!isAdmin) {
		return null;
	}

	return <>{children}</>;
}
