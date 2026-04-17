"use client";

import { useAuth } from "@/lib/auth-context";
import { Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_NAV = [
	{ label: "Features", href: "#features" },
	{ label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
	const pathname = usePathname();
	const { user, logout, isRecruiter, isLoading } = useAuth();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handler = () => setScrolled(window.scrollY > 8);
		window.addEventListener("scroll", handler, { passive: true });
		return () => window.removeEventListener("scroll", handler);
	}, []);

	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	// Hide on dashboard — sidebar handles navigation there
	if (pathname?.startsWith("/dashboard")) return null;

	const isHome = pathname === "/";

	return (
		<header
			className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
				scrolled ? "shadow-md" : "border-b border-gray-100"
			}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* ── Logo ── */}
					<Link
						href="/"
						className="flex items-center gap-2 group flex-shrink-0"
						aria-label="ResumeAI home">
						<div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
							<Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
						</div>
						<span className="text-lg font-bold text-gray-900">ResumeAI</span>
					</Link>

					{/* ── Centre anchor links — home + logged out only ── */}
					{isHome && !user && !isLoading && (
						<nav
							className="hidden md:flex items-center gap-6"
							aria-label="Page sections">
							{PUBLIC_NAV.map((item) => (
								<a
									key={item.href}
									href={item.href}
									className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
									{item.label}
								</a>
							))}
						</nav>
					)}

					{/* ── Desktop right ── */}
					<div className="hidden md:flex items-center gap-3">
						{isLoading ? (
							/* Skeleton while auth resolves — prevents layout shift */
							<div className="flex items-center gap-2">
								<div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
								<div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse" />
							</div>
						) : !user ? (
							<>
								<Link
									href="/login"
									className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
									Sign in
								</Link>
								<Link href="/register" className="btn-primary text-sm">
									Get started free
								</Link>
							</>
						) : (
							<>
								{/* Role pill */}
								<span
									className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
										isRecruiter
											? "bg-purple-100 text-purple-700"
											: "bg-blue-100 text-blue-700"
									}`}>
									{isRecruiter ? "Recruiter" : "Candidate"}
								</span>

								{/* Avatar + name */}
								<div className="flex items-center gap-2 pl-3 border-l border-gray-200">
									<div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
										<span className="text-xs font-bold text-primary-700 uppercase">
											{user.firstName?.[0]}
											{user.lastName?.[0]}
										</span>
									</div>
									<div className="hidden lg:block text-sm leading-tight">
										<p className="font-medium text-gray-900 whitespace-nowrap">
											{user.firstName} {user.lastName}
										</p>
										<p className="text-xs text-gray-400 truncate max-w-[160px]">
											{user.email}
										</p>
									</div>
								</div>

								<Link href="/dashboard" className="btn-primary text-sm">
									Dashboard
								</Link>

								<button
									onClick={logout}
									className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
									Sign out
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
							<X className="w-5 h-5" aria-hidden="true" />
						) : (
							<Menu className="w-5 h-5" aria-hidden="true" />
						)}
					</button>
				</div>
			</div>

			{/* ── Mobile drawer ── */}
			{mobileOpen && (
				<div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
					<div className="px-4 py-4 space-y-1">
						{isLoading ? (
							<div className="space-y-2 p-2">
								<div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
								<div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
							</div>
						) : !user ? (
							<>
								{isHome &&
									PUBLIC_NAV.map((item) => (
										<a
											key={item.href}
											href={item.href}
											onClick={() => setMobileOpen(false)}
											className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
											{item.label}
										</a>
									))}
								<div
									className={`space-y-2 ${isHome ? "pt-2 border-t border-gray-100" : ""}`}>
									<Link
										href="/login"
										onClick={() => setMobileOpen(false)}
										className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
										Sign in
									</Link>
									<Link
										href="/register"
										onClick={() => setMobileOpen(false)}
										className="block btn-primary text-center text-sm">
										Get started free
									</Link>
								</div>
							</>
						) : (
							<>
								{/* User card */}
								<div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
									<div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
										<span className="text-sm font-bold text-primary-700 uppercase">
											{user.firstName?.[0]}
											{user.lastName?.[0]}
										</span>
									</div>
									<div className="min-w-0">
										<p className="font-semibold text-gray-900 text-sm">
											{user.firstName} {user.lastName}
										</p>
										<p className="text-xs text-gray-500 truncate">
											{user.email}
										</p>
										<span
											className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
												isRecruiter
													? "bg-purple-100 text-purple-700"
													: "bg-blue-100 text-blue-700"
											}`}>
											{isRecruiter ? "Recruiter" : "Candidate"}
										</span>
									</div>
								</div>

								<Link
									href="/dashboard"
									onClick={() => setMobileOpen(false)}
									className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
									Dashboard
								</Link>

								<button
									onClick={() => {
										logout();
										setMobileOpen(false);
									}}
									className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
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
