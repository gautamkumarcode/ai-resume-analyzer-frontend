"use client";

import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
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
						Sign in to your account
					</h2>
					<p className="mt-2 text-gray-600">
						Don&apos;t have an account?{" "}
						<Link href="/register" className="text-primary-600 hover:underline">
							Sign up
						</Link>
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-4">
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
									autoComplete="current-password"
									{...register("password", {
										required: "Password is required",
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
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="btn-primary w-full py-3 flex justify-center">
						{isLoading ? (
							<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							"Sign in"
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
