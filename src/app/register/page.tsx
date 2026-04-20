"use client";

import { RegisterData, useAuth } from "@/lib/auth-context";
import { UserRole } from "@/types";
import {
	Briefcase,
	Eye,
	EyeOff,
	GraduationCap,
	Lock,
	Mail,
	User,
} from "lucide-react";
import NextImage from "next/image";
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
	role: UserRole;
}

const ROLES: {
	value: UserRole;
	label: string;
	description: string;
	icon: React.ElementType;
}[] = [
	{
		value: "candidate",
		label: "Job Seeker",
		description: "Upload resumes, get AI analysis, match with jobs",
		icon: GraduationCap,
	},
	{
		value: "recruiter",
		label: "Recruiter",
		description: "Post jobs and find the best candidates",
		icon: Briefcase,
	},
];

export default function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { register: registerUser } = useAuth();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<RegisterForm>({ defaultValues: { role: "candidate" } });

	const selectedRole = watch("role");
	const password = watch("password");

	const onSubmit = async (data: RegisterForm) => {
		setIsLoading(true);
		try {
			const payload: RegisterData = {
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				password: data.password,
				role: data.role,
			};
			await registerUser(payload);
			toast.success("Account created successfully!");
			router.push("/dashboard");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Registration failed");
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
						Start your career transformation today
					</h1>

					<p className="text-xl text-primary-100 mb-8 leading-relaxed">
						Join thousands of professionals who are landing their dream jobs
						with AI-powered resume optimization.
					</p>

					<div className="space-y-4">
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-primary-200 rounded-full"></div>
							<span className="text-primary-100">Free AI resume analysis</span>
						</div>
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-primary-200 rounded-full"></div>
							<span className="text-primary-100">
								Personalized job recommendations
							</span>
						</div>
						<div className="flex items-center space-x-3">
							<div className="w-2 h-2 bg-primary-200 rounded-full"></div>
							<span className="text-primary-100">ATS-optimized formatting</span>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Register Form */}
			<div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 max-h-screen overflow-y-auto">
				<div className="max-w-md w-full space-y-4 py-4">
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
							Create your account
						</h2>
						<p className="text-gray-600">
							Already have an account?{" "}
							<Link
								href="/login"
								className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
								Sign in
							</Link>
						</p>
					</div>

					<form
						className="mt-6 space-y-5"
						onSubmit={handleSubmit(onSubmit)}
						noValidate>
						{/* Role selector */}
						<div>
							<p className="block text-sm font-medium text-gray-700 mb-3">
								I am a…
							</p>
							<div className="grid grid-cols-1 gap-3">
								{ROLES.map((r) => {
									const Icon = r.icon;
									const active = selectedRole === r.value;
									return (
										<button
											key={r.value}
											type="button"
											onClick={() => setValue("role", r.value)}
											className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${
												active
													? "border-primary-500 bg-primary-50 text-primary-700"
													: "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
											}`}
											aria-pressed={active}>
											<Icon
												className={`w-6 h-6 mr-3 ${active ? "text-primary-600" : "text-gray-400"}`}
												aria-hidden="true"
											/>
											<div>
												<span className="font-semibold text-sm block">
													{r.label}
												</span>
												<span className="text-xs mt-1 opacity-75 block">
													{r.description}
												</span>
											</div>
										</button>
									);
								})}
							</div>
							{/* hidden input so react-hook-form tracks the value */}
							<input type="hidden" {...register("role")} />
						</div>

						<div className="space-y-4">
							{/* Name row */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="firstName"
										className="block text-sm font-medium text-gray-700 mb-2">
										First name
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<User
												className="h-5 w-5 text-gray-400"
												aria-hidden="true"
											/>
										</div>
										<input
											id="firstName"
											type="text"
											autoComplete="given-name"
											{...register("firstName", {
												required: "First name is required",
											})}
											className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
											placeholder="John"
										/>
									</div>
									{errors.firstName && (
										<p className="mt-2 text-sm text-red-600" role="alert">
											{errors.firstName.message}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="lastName"
										className="block text-sm font-medium text-gray-700 mb-2">
										Last name
									</label>
									<input
										id="lastName"
										type="text"
										autoComplete="family-name"
										{...register("lastName", {
											required: "Last name is required",
										})}
										className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
										placeholder="Doe"
									/>
									{errors.lastName && (
										<p className="mt-2 text-sm text-red-600" role="alert">
											{errors.lastName.message}
										</p>
									)}
								</div>
							</div>

							{/* Email */}
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 mb-2">
									Email address
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Mail
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
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
									<p className="mt-2 text-sm text-red-600" role="alert">
										{errors.email.message}
									</p>
								)}
							</div>

							{/* Password */}
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700 mb-2">
									Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</div>
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										autoComplete="new-password"
										{...register("password", {
											required: "Password is required",
											minLength: {
												value: 6,
												message: "Password must be at least 6 characters",
											},
										})}
										className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
										placeholder="••••••••"
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
										onClick={() => setShowPassword(!showPassword)}
										aria-label={
											showPassword ? "Hide password" : "Show password"
										}>
										{showPassword ? (
											<EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										) : (
											<Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										)}
									</button>
								</div>
								{errors.password && (
									<p className="mt-2 text-sm text-red-600" role="alert">
										{errors.password.message}
									</p>
								)}
							</div>

							{/* Confirm password */}
							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-medium text-gray-700 mb-2">
									Confirm password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</div>
									<input
										id="confirmPassword"
										type={showPassword ? "text" : "password"}
										autoComplete="new-password"
										{...register("confirmPassword", {
											required: "Please confirm your password",
											validate: (value) =>
												value === password || "Passwords do not match",
										})}
										className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
										placeholder="••••••••"
									/>
								</div>
								{errors.confirmPassword && (
									<p className="mt-2 text-sm text-red-600" role="alert">
										{errors.confirmPassword.message}
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
								<div
									className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
									aria-label="Loading"
								/>
							) : (
								`Create ${selectedRole === "recruiter" ? "Recruiter" : "Candidate"} Account`
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
										Already have an account?
									</span>
								</div>
							</div>
						</div>

						{/* Sign In Link */}
						<div className="text-center">
							<Link
								href="/login"
								className="inline-flex items-center px-4 py-2 border border-primary-300 rounded-xl shadow-sm bg-white text-sm font-medium text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
								Sign in to your account
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
