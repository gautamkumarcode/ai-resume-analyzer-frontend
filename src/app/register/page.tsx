"use client";

import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface RegisterForm {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export default function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { register: registerUser } = useAuth();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<RegisterForm>();

	const password = watch("password");

	const onSubmit = async (data: RegisterForm) => {
		setIsLoading(true);
		try {
			await registerUser({
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				password: data.password,
			});
			toast.success("Account created successfully!");
			router.push("/dashboard");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Registration failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<Link
						href="/"
						className="inline-flex items-center space-x-2 text-primary-600">
						<Sparkles className="w-10 h-10" />
						<span className="text-2xl font-bold">AI Resume Analyzer</span>
					</Link>
					<h2 className="mt-6 text-3xl font-bold text-gray-900">
						Create your account
					</h2>
					<p className="mt-2 text-gray-600">
						Already have an account?{" "}
						<Link href="/login" className="text-primary-600 hover:underline">
							Sign in
						</Link>
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-700">
									First name
								</label>
								<div className="mt-1 relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<User className="h-5 w-5 text-gray-400" />
									</div>
									<input
										id="firstName"
										type="text"
										{...register("firstName", {
											required: "First name is required",
										})}
										className="input pl-10"
										placeholder="John"
									/>
								</div>
								{errors.firstName && (
									<p className="mt-1 text-sm text-red-600">
										{errors.firstName.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-700">
									Last name
								</label>
								<div className="mt-1">
									<input
										id="lastName"
										type="text"
										{...register("lastName", {
											required: "Last name is required",
										})}
										className="input"
										placeholder="Doe"
									/>
								</div>
								{errors.lastName && (
									<p className="mt-1 text-sm text-red-600">
										{errors.lastName.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700">
								Email address
							</label>
							<div className="mt-1 relative">
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
									className="input pl-10"
									placeholder="you@example.com"
								/>
							</div>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									{...register("password", {
										required: "Password is required",
										minLength: {
											value: 6,
											message: "Password must be at least 6 characters",
										},
									})}
									className="input pl-10 pr-10"
									placeholder="••••••••"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() => setShowPassword(!showPassword)}>
									{showPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1 text-sm text-red-600">
									{errors.password.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700">
								Confirm password
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="confirmPassword"
									type={showPassword ? "text" : "password"}
									{...register("confirmPassword", {
										required: "Please confirm your password",
										validate: (value) =>
											value === password || "Passwords do not match",
									})}
									className="input pl-10"
									placeholder="••••••••"
								/>
							</div>
							{errors.confirmPassword && (
								<p className="mt-1 text-sm text-red-600">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="btn-primary w-full py-3 flex justify-center">
						{isLoading ? (
							<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							"Create account"
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
