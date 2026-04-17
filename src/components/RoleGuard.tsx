"use client";

import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/types";
import { ShieldX } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
	role: UserRole;
	children: React.ReactNode;
}

/**
 * Renders children only when the authenticated user has the required role.
 * Otherwise shows a friendly "access denied" message.
 */
export default function RoleGuard({ role, children }: RoleGuardProps) {
	const { user, isLoading } = useAuth();

	if (isLoading) return null;

	if (user?.role !== role) {
		const label = role === "recruiter" ? "Recruiters" : "Candidates";
		const redirect =
			role === "recruiter" ? "/dashboard/jobs" : "/dashboard/resumes";

		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
				<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
					<ShieldX className="w-8 h-8 text-red-500" aria-hidden="true" />
				</div>
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					Access Restricted
				</h2>
				<p className="text-gray-500 mb-6 max-w-sm">
					This section is only available to <strong>{label}</strong>. Your
					account is registered as a{" "}
					<strong className="capitalize">{user?.role}</strong>.
				</p>
				<Link href="/dashboard" className="btn-primary">
					Go to Dashboard
				</Link>
			</div>
		);
	}

	return <>{children}</>;
}
