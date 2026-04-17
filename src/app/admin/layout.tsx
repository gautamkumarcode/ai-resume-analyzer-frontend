"use client";

import AdminGuard from "@/components/AdminGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/lib/auth-context";
import {
    Briefcase,
    LayoutDashboard,
    LogOut,
    Menu,
    Shield,
    Users,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ADMIN_NAV = [
	{ name: "Overview", href: "/admin", icon: LayoutDashboard },
	{ name: "Users", href: "/admin/users", icon: Users },
	{ name: "Jobs", href: "/admin/jobs", icon: Briefcase },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
	const pathname = usePathname();
	const { user, logout } = useAuth();

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
				<div className="flex items-center gap-2">
					<Shield className="w-5 h-5 text-red-600" aria-hidden="true" />
					<span className="text-lg font-bold text-gray-900">Admin Panel</span>
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
						aria-label="Close menu">
						<X className="w-5 h-5" />
					</button>
				)}
			</div>

			<nav className="flex-1 px-4 py-6 space-y-1" aria-label="Admin navigation">
				{ADMIN_NAV.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.name}
							href={item.href}
							onClick={onClose}
							aria-current={isActive ? "page" : undefined}
							className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
								isActive
									? "bg-red-50 text-red-600"
									: "text-gray-600 hover:bg-gray-100"
							}`}>
							<item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
							<span className="font-medium">{item.name}</span>
						</Link>
					);
				})}
			</nav>

			<div className="border-t border-gray-200 p-4">
				<div className="flex items-center space-x-3 px-4 py-3">
					<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
						<Shield className="w-5 h-5 text-red-600" aria-hidden="true" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{user?.firstName} {user?.lastName}
						</p>
						<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
							Admin
						</span>
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

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<AdminGuard>
			<div className="min-h-screen bg-gray-50">
				{sidebarOpen && (
					<div
						className="fixed inset-0 bg-black/40 z-30 lg:hidden"
						onClick={() => setSidebarOpen(false)}
						aria-hidden="true"
					/>
				)}

				<aside
					className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-200 lg:translate-x-0 ${
						sidebarOpen ? "translate-x-0" : "-translate-x-full"
					}`}
					aria-label="Admin sidebar">
					<Sidebar onClose={() => setSidebarOpen(false)} />
				</aside>

				<aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-white border-r border-gray-200 z-20">
					<Sidebar />
				</aside>

				<div className="lg:pl-64">
					<div className="sticky top-0 z-10 flex items-center h-14 px-4 bg-white border-b border-gray-200 lg:hidden">
						<button
							onClick={() => setSidebarOpen(true)}
							className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
							aria-label="Open menu">
							<Menu className="w-5 h-5" />
						</button>
						<span className="ml-3 text-base font-semibold text-gray-900">
							Admin Panel
						</span>
					</div>

					<main className="p-4 sm:p-6 lg:p-8">
						<ErrorBoundary>{children}</ErrorBoundary>
					</main>
				</div>
			</div>
		</AdminGuard>
	);
}
