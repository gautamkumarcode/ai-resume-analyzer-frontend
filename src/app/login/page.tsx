"use client";

import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface LoginForm {
	email: string;
	password: string;
}

export default function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>();

	const onSubmit = async (data: LoginForm) => {
		setIsLoading(true);
		try {
			await login(data.email, data.password);
			toast.success("Welcome back!");
			router.push("/dashboard");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex overflow-hidden">
			{/* Left Side - Branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-brand-gradient relative overflow-hidden">
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
					<div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
				</div>

				{/* Content */}
				<div className="relative z-10 flex flex-col justify-center px-12 text-white">
					<div className="mb-8">
						<NextImage
							src="/logo.png"
							alt="NextRole"
							width={200}
							height={80}
							className="object-contain h-20 w-auto mb-8"
							priority
						/>
					</div>

					<h1 className="text-4xl font-bold mb-6 leading-tight">
						Welcome back to your career journey
					</h1>

					<p className="text-xl text-primary-100 mb-8 leading-relaxed">
						Continue optimizing your resume and discovering perfect job matches
						with AI-powered insights.
					</p>

					<div className="space-y-4">
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-primary-200 rounded-full"></div>
							<span className="text-primary-100">
								AI-powered resume analysis
							</span>
						</div>
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-primary-200 rounded-full"></div>
							<span className="text-primary-100">Smart job matching</span>
						</div>
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-primary-200 rounded-full"></div>
							<span className="text-primary-100">ATS optimization</span>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Login Form */}
			<div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-y-auto">
				<div className="max-w-md w-full space-y-4 py-8">
					{/* Mobile Logo */}
					<div className="lg:hidden text-center">
						<Link href="/" className="inline-block">
							<NextImage
								src="/logo.png"
								alt="NextRole"
								width={160}
								height={60}
								className="object-contain h-16 w-auto mx-auto"
								priority
							/>
						</Link>
					</div>

					{/* Header */}
					<div className="text-center">
						<h2 className="text-3xl font-bold text-gray-900 mb-2">
							Sign in to your account
						</h2>
						<p className="text-gray-600">
							Don&apos;t have an account?{" "}
							<Link
								href="/register"
								className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
								Sign up for free
							</Link>
						</p>
					</div>

					{/* Form */}
					<form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
						<div className="space-y-4">
							{/* Email Field */}
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 mb-2">
									Email address
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Mail className="h-5 w-5 text-gray-400" />
									</div>
									<input
										id="email"
										type="email"
										autoComplete="email"
										{...register("email", {
											required: "Email is required",
											pattern: {
												value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
												message: "Invalid email address",
											},
										})}
										className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
										placeholder="you@example.com"
									/>
								</div>
								{errors.email && (
									<p className="mt-2 text-sm text-red-600">
										{errors.email.message}
									</p>
								)}
							</div>

							{/* Password Field */}
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700 mb-2">
									Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-5 w-5 text-gray-400" />
									</div>
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										autoComplete="current-password"
										{...register("password", {
											required: "Password is required",
										})}
										className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
										placeholder="••••••••"
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
										onClick={() => setShowPassword(!showPassword)}>
										{showPassword ? (
											<EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										) : (
											<Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										)}
									</button>
								</div>
								{errors.password && (
									<p className="mt-2 text-sm text-red-600">
										{errors.password.message}
									</p>
								)}
							</div>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="btn-brand w-full py-3 px-4 text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center">
							{isLoading ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : (
								"Sign in"
							)}
						</button>

						{/* Divider */}
						<div className="mt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">
										New to NextRole?
									</span>
								</div>
							</div>
						</div>

						{/* Sign Up Link */}
						<div className="text-center">
							<Link
								href="/register"
								className="inline-flex items-center px-4 py-2 border border-primary-300 rounded-xl shadow-sm bg-white text-sm font-medium text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
								Create your free account
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
