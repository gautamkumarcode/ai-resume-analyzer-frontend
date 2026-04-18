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
import Image from "next/image";
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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				{/* Header */}
				<div className="text-center">
					<Link
						href="/"
						className="inline-flex items-center justify-center mb-8">
						<Image
							src="/logo.png"
							alt="NextRole"
							width={180}
							height={60}
							className="object-contain h-16 w-auto"
						/>
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

				<form
					className="mt-8 space-y-6"
					onSubmit={handleSubmit(onSubmit)}
					noValidate>
					{/* Role selector */}
					<div>
						<p className="block text-sm font-medium text-gray-700 mb-2">
							I am a…
						</p>
						<div className="grid grid-cols-2 gap-3">
							{ROLES.map((r) => {
								const Icon = r.icon;
								const active = selectedRole === r.value;
								return (
									<button
										key={r.value}
										type="button"
										onClick={() => setValue("role", r.value)}
										className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center ${
											active
												? "border-primary-500 bg-primary-50 text-primary-700"
												: "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
										}`}
										aria-pressed={active}>
										<Icon
											className={`w-7 h-7 mb-2 ${active ? "text-primary-600" : "text-gray-400"}`}
											aria-hidden="true"
										/>
										<span className="font-semibold text-sm">{r.label}</span>
										<span className="text-xs mt-1 leading-tight opacity-75">
											{r.description}
										</span>
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
									className="block text-sm font-medium text-gray-700">
									First name
								</label>
								<div className="mt-1 relative">
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
										className="input pl-10"
										placeholder="John"
									/>
								</div>
								{errors.firstName && (
									<p className="mt-1 text-sm text-red-600" role="alert">
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
										autoComplete="family-name"
										{...register("lastName", {
											required: "Last name is required",
										})}
										className="input"
										placeholder="Doe"
									/>
								</div>
								{errors.lastName && (
									<p className="mt-1 text-sm text-red-600" role="alert">
										{errors.lastName.message}
									</p>
								)}
							</div>
						</div>

						{/* Email */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700">
								Email address
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
								<p className="mt-1 text-sm text-red-600" role="alert">
									{errors.email.message}
								</p>
							)}
						</div>

						{/* Password */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
									className="input pl-10 pr-10"
									placeholder="••••••••"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? "Hide password" : "Show password"}>
									{showPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1 text-sm text-red-600" role="alert">
									{errors.password.message}
								</p>
							)}
						</div>

						{/* Confirm password */}
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700">
								Confirm password
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
									className="input pl-10"
									placeholder="••••••••"
								/>
							</div>
							{errors.confirmPassword && (
								<p className="mt-1 text-sm text-red-600" role="alert">
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
							<div
								className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
								aria-label="Loading"
							/>
						) : (
							`Create ${selectedRole === "recruiter" ? "Recruiter" : "Candidate"} Account`
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
