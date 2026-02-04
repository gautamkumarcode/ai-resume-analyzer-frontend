"use client";

import { useAuth } from "@/lib/auth-context";
import {
	BarChart3,
	Briefcase,
	FileText,
	LayoutDashboard,
	LogOut,
	Sparkles,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Resumes", href: "/dashboard/resumes", icon: FileText },
	{ name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
	{ name: "Matches", href: "/dashboard/matches", icon: BarChart3 },
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const { user, logout } = useAuth();

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Sidebar */}
			<aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center space-x-2 px-6 py-4 border-b border-gray-200">
						<Sparkles className="w-8 h-8 text-primary-600" />
						<span className="text-lg font-bold text-gray-900">
							Resume Analyzer
						</span>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-4 py-6 space-y-1">
						{navigation.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
										isActive
											? "bg-primary-50 text-primary-600"
											: "text-gray-600 hover:bg-gray-100"
									}`}>
									<item.icon className="w-5 h-5" />
									<span className="font-medium">{item.name}</span>
								</Link>
							);
						})}
					</nav>

					{/* User section */}
					<div className="border-t border-gray-200 p-4">
						<div className="flex items-center space-x-3 px-4 py-3">
							<div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
								<User className="w-5 h-5 text-primary-600" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">
									{user?.firstName} {user?.lastName}
								</p>
								<p className="text-xs text-gray-500 truncate">{user?.email}</p>
							</div>
						</div>
						<button
							onClick={logout}
							className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
							<LogOut className="w-5 h-5" />
							<span className="font-medium">Sign out</span>
						</button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="pl-64">
				<div className="p-8">{children}</div>
			</main>
		</div>
	);
}
