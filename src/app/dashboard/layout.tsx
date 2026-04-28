"use client";

import AuthGuard from "@/components/AuthGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/lib/auth-context";
import {
	BarChart3,
	Briefcase,
	ClipboardCheck,
	FileText,
	LayoutDashboard,
	LogOut,
	Menu,
	Mic,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const CANDIDATE_NAV = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "My Resumes", href: "/dashboard/resumes", icon: FileText },
	{ name: "Job Board", href: "/dashboard/jobs", icon: Briefcase },
	{
		name: "Applications",
		href: "/dashboard/applications",
		icon: ClipboardCheck,
	},
	{ name: "My Matches", href: "/dashboard/matches", icon: BarChart3 },
	{ name: "AI Interview", href: "/dashboard/interview", icon: Mic },
	{ name: "Profile", href: "/dashboard/profile", icon: User },
];

const RECRUITER_NAV = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "My Jobs", href: "/dashboard/jobs", icon: Briefcase },
	{ name: "Interviews", href: "/dashboard/interviews", icon: Mic },
	{ name: "Profile", href: "/dashboard/profile", icon: User },
];

function RoleBadge({ role }: { role: string }) {
	return (
		<span
			className={`text-xs font-medium px-2 py-0.5 rounded-full ${
				role === "recruiter"
					? "bg-purple-100 text-purple-700"
					: "bg-blue-100 text-blue-700"
			}`}>
			{role === "recruiter" ? "Recruiter" : "Candidate"}
		</span>
	);
}

function Sidebar({ onClose }: { onClose?: () => void }) {
	const pathname = usePathname();
	const { user, logout, isRecruiter } = useAuth();
	const navigation = isRecruiter ? RECRUITER_NAV : CANDIDATE_NAV;

	return (
		<div className="flex flex-col h-full">
			{/* Logo */}
			<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
				<span className="text-lg font-bold text-gray-900">Resume Analyzer</span>
				{onClose && (
					<button
						onClick={onClose}
						className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
						aria-label="Close menu">
						<X className="w-5 h-5" />
					</button>
				)}
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-4 py-6 space-y-1" aria-label="Main navigation">
				{navigation.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.name}
							href={item.href}
							onClick={onClose}
							aria-current={isActive ? "page" : undefined}
							className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
								isActive
									? "bg-primary-50 text-primary-600"
									: "text-gray-600 hover:bg-gray-100"
							}`}>
							<item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
							<span className="font-medium">{item.name}</span>
						</Link>
					);
				})}
			</nav>

			{/* User section */}
			<div className="border-t border-gray-200 p-4">
				<div className="flex items-center space-x-3 px-4 py-3">
					<div
						className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0"
						aria-hidden="true">
						<User className="w-5 h-5 text-primary-600" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{user?.firstName} {user?.lastName}
						</p>
						<div className="flex items-center gap-2 mt-0.5">
							{user?.role && <RoleBadge role={user.role} />}
						</div>
					</div>
				</div>
				<button
					onClick={logout}
					className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
					aria-label="Sign out">
					<LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
					<span className="font-medium">Sign out</span>
				</button>
			</div>
		</div>
	);
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gray-50">
				{/* Mobile overlay */}
				{sidebarOpen && (
					<div
						className="fixed inset-0 bg-black/40 z-30 lg:hidden"
						onClick={() => setSidebarOpen(false)}
						aria-hidden="true"
					/>
				)}

				{/* Mobile sidebar drawer */}
				<aside
					className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-200 lg:translate-x-0 ${
						sidebarOpen ? "translate-x-0" : "-translate-x-full"
					}`}
					aria-label="Sidebar">
					<Sidebar onClose={() => setSidebarOpen(false)} />
				</aside>

				{/* Desktop sidebar */}
				<aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-white border-r border-gray-200 z-20">
					<Sidebar />
				</aside>

				{/* Main content */}
				<div className="lg:pl-64">
					{/* Mobile top bar */}
					<div className="sticky top-0 z-10 flex items-center h-14 px-4 bg-white border-b border-gray-200 lg:hidden">
						<button
							onClick={() => setSidebarOpen(true)}
							className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
							aria-label="Open menu">
							<Menu className="w-5 h-5" />
						</button>
						<span className="ml-3 text-base font-semibold text-gray-900">
							Resume Analyzer
						</span>
					</div>

					<main className="p-4 sm:p-6 lg:p-8">
						<ErrorBoundary>{children}</ErrorBoundary>
					</main>
				</div>
			</div>
		</AuthGuard>
	);
}
