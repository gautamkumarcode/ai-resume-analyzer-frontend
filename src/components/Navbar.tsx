"use client";

import { useAuth } from "@/lib/auth-context";
import { Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
	const pathname = usePathname();
	const { user, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const isAuthPage =
		pathname === "/login" || pathname === "/register" || pathname === "/";
	const isDashboard = pathname.startsWith("/dashboard");

	// Don't show navbar on dashboard pages (sidebar is used instead)
	if (isDashboard) {
		return null;
	}

	return (
		<nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<Sparkles className="w-8 h-8 text-primary-600" />
						<span className="text-xl font-bold text-gray-900">
							AI Resume Analyzer
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						{!user ? (
							<>
								<Link
									href="/"
									className={`text-sm font-medium transition-colors ${
										pathname === "/"
											? "text-primary-600"
											: "text-gray-700 hover:text-primary-600"
									}`}>
									Home
								</Link>
								<Link
									href="/login"
									className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
									Login
								</Link>
								<Link href="/register" className="btn-primary">
									Get Started
								</Link>
							</>
						) : (
							<>
								<Link
									href="/dashboard"
									className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
									Dashboard
								</Link>
								<div className="flex items-center space-x-3">
									<div className="text-sm">
										<p className="font-medium text-gray-900">
											{user.firstName} {user.lastName}
										</p>
										<p className="text-xs text-gray-500">{user.email}</p>
									</div>
									<button onClick={logout} className="btn-secondary text-sm">
										Sign Out
									</button>
								</div>
							</>
						)}
					</div>

					{/* Mobile menu button */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100">
						{mobileMenuOpen ? (
							<X className="w-6 h-6" />
						) : (
							<Menu className="w-6 h-6" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Navigation */}
			{mobileMenuOpen && (
				<div className="md:hidden border-t border-gray-200 bg-white">
					<div className="px-4 py-4 space-y-3">
						{!user ? (
							<>
								<Link
									href="/"
									onClick={() => setMobileMenuOpen(false)}
									className={`block px-4 py-2 rounded-lg text-sm font-medium ${
										pathname === "/"
											? "bg-primary-50 text-primary-600"
											: "text-gray-700 hover:bg-gray-100"
									}`}>
									Home
								</Link>
								<Link
									href="/login"
									onClick={() => setMobileMenuOpen(false)}
									className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
									Login
								</Link>
								<Link
									href="/register"
									onClick={() => setMobileMenuOpen(false)}
									className="block btn-primary text-center">
									Get Started
								</Link>
							</>
						) : (
							<>
								<div className="px-4 py-2 border-b border-gray-200">
									<p className="font-medium text-gray-900">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-xs text-gray-500">{user.email}</p>
								</div>
								<Link
									href="/dashboard"
									onClick={() => setMobileMenuOpen(false)}
									className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
									Dashboard
								</Link>
								<button
									onClick={() => {
										logout();
										setMobileMenuOpen(false);
									}}
									className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
									Sign Out
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
