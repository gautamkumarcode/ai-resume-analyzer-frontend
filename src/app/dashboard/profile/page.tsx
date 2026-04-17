"use client";

import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Save, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface ProfileFormData {
	firstName: string;
	lastName: string;
}

export default function ProfilePage() {
	const { user } = useAuth();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileFormData>();

	// Pre-fill form when user data is available
	useEffect(() => {
		if (user) {
			reset({ firstName: user.firstName, lastName: user.lastName });
		}
	}, [user, reset]);

	const updateMutation = useMutation({
		mutationFn: async (data: ProfileFormData) => {
			const response = await api.put("/auth/profile", data);
			return response.data.data.user;
		},
		onSuccess: (updatedUser) => {
			// Sync localStorage so the auth context reflects the new name on next load
			const stored = localStorage.getItem("user");
			if (stored) {
				const parsed = JSON.parse(stored);
				localStorage.setItem(
					"user",
					JSON.stringify({ ...parsed, ...updatedUser }),
				);
			}
			toast.success("Profile updated successfully!");
			reset({
				firstName: updatedUser.firstName,
				lastName: updatedUser.lastName,
			});
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message ?? "Failed to update profile");
		},
	});

	const onSubmit = (data: ProfileFormData) => {
		updateMutation.mutate(data);
	};

	return (
		<div className="max-w-2xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Profile</h1>
				<p className="mt-1 text-gray-600">Manage your account information</p>
			</div>

			{/* Avatar */}
			<div className="card flex items-center space-x-4">
				<div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
					<User className="w-8 h-8 text-primary-600" aria-hidden="true" />
				</div>
				<div>
					<p className="text-lg font-semibold text-gray-900">
						{user?.firstName} {user?.lastName}
					</p>
					<p className="text-sm text-gray-500">{user?.email}</p>
				</div>
			</div>

			{/* Edit form */}
			<div className="card">
				<h2 className="text-lg font-semibold text-gray-900 mb-6">
					Personal Information
				</h2>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4"
					noValidate>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="firstName"
								className="block text-sm font-medium text-gray-700 mb-1">
								First name
							</label>
							<input
								id="firstName"
								type="text"
								autoComplete="given-name"
								{...register("firstName", {
									required: "First name is required",
									minLength: {
										value: 1,
										message: "First name cannot be empty",
									},
								})}
								className="input"
								placeholder="John"
							/>
							{errors.firstName && (
								<p className="mt-1 text-sm text-red-600" role="alert">
									{errors.firstName.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="lastName"
								className="block text-sm font-medium text-gray-700 mb-1">
								Last name
							</label>
							<input
								id="lastName"
								type="text"
								autoComplete="family-name"
								{...register("lastName", {
									required: "Last name is required",
									minLength: { value: 1, message: "Last name cannot be empty" },
								})}
								className="input"
								placeholder="Doe"
							/>
							{errors.lastName && (
								<p className="mt-1 text-sm text-red-600" role="alert">
									{errors.lastName.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-1">
							Email address
						</label>
						<input
							id="email"
							type="email"
							value={user?.email ?? ""}
							disabled
							className="input bg-gray-50 text-gray-500 cursor-not-allowed"
							aria-describedby="email-hint"
						/>
						<p id="email-hint" className="mt-1 text-xs text-gray-400">
							Email cannot be changed.
						</p>
					</div>

					<div className="flex justify-end pt-2">
						<button
							type="submit"
							disabled={updateMutation.isPending || !isDirty}
							className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
							{updateMutation.isPending ? (
								<Loader2
									className="w-4 h-4 mr-2 animate-spin"
									aria-hidden="true"
								/>
							) : (
								<Save className="w-4 h-4 mr-2" aria-hidden="true" />
							)}
							Save changes
						</button>
					</div>
				</form>
			</div>

			{/* Account info */}
			<div className="card">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Account Details
				</h2>
				<dl className="space-y-3 text-sm">
					<div className="flex justify-between">
						<dt className="text-gray-500">Role</dt>
						<dd>
							<span
								className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
									user?.role === "recruiter"
										? "bg-purple-100 text-purple-700"
										: "bg-blue-100 text-blue-700"
								}`}>
								{user?.role ?? "—"}
							</span>
						</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-gray-500">Member since</dt>
						<dd className="text-gray-900 font-medium">
							{user?.createdAt
								? new Date(user.createdAt).toLocaleDateString(undefined, {
										year: "numeric",
										month: "long",
										day: "numeric",
									})
								: "—"}
						</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}
