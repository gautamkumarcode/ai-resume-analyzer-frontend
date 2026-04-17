"use client";

import { useAuth } from "@/lib/auth-context";
import { LogOut, Menu, Sparkles, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_NAV = [
	{ label: "Features", href: "#features" },
	{ label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
	const pathname = usePathname();
	const { user, logout, isRecruiter, isAdmin, isLoading } = useAuth();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handler = () => setScrolled(window.scrollY > 10);
		window.addEventListener("scroll", handler, { passive: true });
		return () => window.removeEventListener("scroll", handler);
	}, []);

	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	// Hide on dashboard and admin — sidebar handles navigation there
	if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin"))
		return null;

	const isHome = pathname === "/";

	const getRoleBadge = () => {
		if (isAdmin) {
			return (
				<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
					Admin
				</span>
			);
		}
		if (isRecruiter) {
			return (
				<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
					Recruiter
				</span>
			);
		}
		return (
			<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
				Candidate
			</span>
		);
	};

	return (
		<header
			className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-all duration-200 ${
				scrolled ? "shadow-md" : "border-b border-gray-200"
			}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* ── Logo ── */}
					<Link
						href="/"
						className="flex items-center gap-2.5 group flex-shrink-0"
						aria-label="AI Resume Analyzer home">
						<div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center group-hover:from-primary-700 group-hover:to-primary-800 transition-all shadow-sm">
							<Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
						</div>
						<span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
							AI Resume Analyzer
						</span>
					</Link>

					{/* ── Centre anchor links — home + logged out only ── */}
					{isHome && !user && !isLoading && (
						<nav
							className="hidden md:flex items-center gap-8"
							aria-label="Page sections">
							{PUBLIC_NAV.map((item) => (
								<a
									key={item.href}
									href={item.href}
									className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary-600 after:transition-all">
									{item.label}
								</a>
							))}
						</nav>
					)}

					{/* ── Desktop right ── */}
					<div className="hidden md:flex items-center gap-4">
						{isLoading ? (
							/* Skeleton while auth resolves — prevents layout shift */
							<div className="flex items-center gap-3">
								<div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse" />
								<div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
							</div>
						) : !user ? (
							<>
								<Link
									href="/login"
									className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
									Sign in
								</Link>
								<Link
									href="/register"
									className="btn-primary text-sm px-5 py-2.5 shadow-sm hover:shadow-md">
									Get started free
								</Link>
							</>
						) : (
							<>
								{/* Role badge */}
								{getRoleBadge()}

								{/* Avatar + name */}
								<div className="flex items-center gap-3 pl-4 border-l border-gray-200">
									<div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
										<span className="text-sm font-bold text-primary-700 uppercase">
											{user.firstName?.[0]}
											{user.lastName?.[0]}
										</span>
									</div>
									<div className="hidden lg:block text-sm leading-tight">
										<p className="font-semibold text-gray-900 whitespace-nowrap">
											{user.firstName} {user.lastName}
										</p>
										<p className="text-xs text-gray-500 truncate max-w-[160px]">
											{user.email}
										</p>
									</div>
								</div>

								{/* Dashboard button */}
								<Link
									href={isAdmin ? "/admin" : "/dashboard"}
									className="btn-primary text-sm px-5 py-2.5 shadow-sm hover:shadow-md flex items-center gap-2">
									<User className="w-4 h-4" aria-hidden="true" />
									{isAdmin ? "Admin" : "Dashboard"}
								</Link>

								{/* Logout button */}
								<button
									onClick={logout}
									className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 flex items-center gap-2"
									title="Sign out">
									<LogOut className="w-4 h-4" aria-hidden="true" />
									<span className="hidden xl:inline">Sign out</span>
								</button>
							</>
						)}
					</div>

					{/* ── Hamburger ── */}
					<button
						onClick={() => setMobileOpen((v) => !v)}
						className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
						aria-expanded={mobileOpen}
						aria-label={mobileOpen ? "Close menu" : "Open menu"}>
						{mobileOpen ? (
							<X className="w-6 h-6" aria-hidden="true" />
						) : (
							<Menu className="w-6 h-6" aria-hidden="true" />
						)}
					</button>
				</div>
			</div>

			{/* ── Mobile drawer ── */}
			{mobileOpen && (
				<div className="md:hidden border-t border-gray-200 bg-white shadow-xl">
					<div className="px-4 py-5 space-y-2">
						{isLoading ? (
							<div className="space-y-3 p-2">
								<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
								<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
							</div>
						) : !user ? (
							<>
								{isHome &&
									PUBLIC_NAV.map((item) => (
										<a
											key={item.href}
											href={item.href}
											onClick={() => setMobileOpen(false)}
											className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
											{item.label}
										</a>
									))}
								<div
									className={`space-y-2 ${isHome ? "pt-3 mt-2 border-t border-gray-200" : ""}`}>
									<Link
										href="/login"
										onClick={() => setMobileOpen(false)}
										className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
										Sign in
									</Link>
									<Link
										href="/register"
										onClick={() => setMobileOpen(false)}
										className="block btn-primary text-center text-sm py-3 shadow-sm">
										Get started free
									</Link>
								</div>
							</>
						) : (
							<>
								{/* User card */}
								<div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 border border-gray-200">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
										<span className="text-base font-bold text-primary-700 uppercase">
											{user.firstName?.[0]}
											{user.lastName?.[0]}
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-gray-900 text-sm">
											{user.firstName} {user.lastName}
										</p>
										<p className="text-xs text-gray-500 truncate">
											{user.email}
										</p>
										<div className="mt-1.5">{getRoleBadge()}</div>
									</div>
								</div>

								<Link
									href={isAdmin ? "/admin" : "/dashboard"}
									onClick={() => setMobileOpen(false)}
									className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
									<User className="w-5 h-5 text-gray-400" aria-hidden="true" />
									{isAdmin ? "Admin Panel" : "Dashboard"}
								</Link>

								<button
									onClick={() => {
										logout();
										setMobileOpen(false);
									}}
									className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
									<LogOut className="w-5 h-5" aria-hidden="true" />
									Sign out
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
