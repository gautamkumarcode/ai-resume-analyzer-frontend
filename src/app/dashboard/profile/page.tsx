"use client";

import SkillsSelector from "@/components/SkillsSelector";
import { useUpdateProfile } from "@/hooks/useAuth";
import { useAuth } from "@/lib/auth-context";
import {
	Briefcase,
	Calendar,
	Edit3,
	Loader2,
	Mail,
	MapPin,
	Phone,
	Save,
	Star,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ProfileFormData {
	firstName: string;
	lastName: string;
	phone?: string;
	location?: string;
	title?: string;
	summary?: string;
	company?: string;
	experience?: string;
	skills?: string[];
	linkedin?: string;
	website?: string;
}

export default function ProfilePage() {
	const { user, isCandidate, isRecruiter } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
	const updateProfileMutation = useUpdateProfile();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isDirty },
	} = useForm<ProfileFormData>();

	// Pre-fill form when user data is available
	useEffect(() => {
		if (user) {
			const skills = user.skills || [];
			setSelectedSkills(skills);
			reset({
				firstName: user.firstName,
				lastName: user.lastName,
				phone: user.phone || "",
				location: user.location || "",
				title: user.title || "",
				summary: user.summary || "",
				company: user.company || "",
				experience: user.experience || "",
				skills: skills,
				linkedin: user.linkedin || "",
				website: user.website || "",
			});
		}
	}, [user, reset]);

	const onSubmit = (data: ProfileFormData) => {
		// Convert skills array to comma-separated string for API
		const formData = {
			...data,
			skills: data.skills?.join(",") || "",
		};

		updateProfileMutation.mutate(formData, {
			onSuccess: () => {
				setIsEditing(false);
			},
		});
	};

	return (
		<div className="w-full space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Profile</h1>
					<p className="mt-1 text-gray-600">
						{isCandidate
							? "Manage your professional profile"
							: "Manage your recruiter profile"}
					</p>
				</div>
				<button
					onClick={() => setIsEditing(!isEditing)}
					className="btn-secondary flex items-center">
					<Edit3 className="w-4 h-4 mr-2" />
					{isEditing ? "Cancel" : "Edit Profile"}
				</button>
			</div>

			{/* Profile Header Card */}
			<div className="card">
				<div className="flex items-start space-x-6">
					{/* Avatar */}
					<div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg">
						<span className="text-2xl font-bold text-white">
							{user?.firstName?.[0]}
							{user?.lastName?.[0]}
						</span>
					</div>

					{/* Basic Info */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center space-x-3 mb-2">
							<h2 className="text-2xl font-bold text-gray-900">
								{user?.firstName} {user?.lastName}
							</h2>
							<span
								className={`px-3 py-1 rounded-full text-sm font-medium ${
									user?.role === "recruiter"
										? "bg-purple-100 text-purple-700"
										: user?.role === "admin"
											? "bg-red-100 text-red-700"
											: "bg-blue-100 text-blue-700"
								}`}>
								{user?.role === "recruiter"
									? "Recruiter"
									: user?.role === "admin"
										? "Admin"
										: "Job Seeker"}
							</span>
						</div>

						{user?.title && (
							<p className="text-lg text-gray-600 mb-2">{user.title}</p>
						)}

						{user?.company && (
							<p className="text-gray-500 mb-4">{user.company}</p>
						)}

						<div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
							<div className="flex items-center">
								<Mail className="w-4 h-4 mr-1" />
								{user?.email}
							</div>
							{user?.phone && (
								<div className="flex items-center">
									<Phone className="w-4 h-4 mr-1" />
									{user.phone}
								</div>
							)}
							{user?.location && (
								<div className="flex items-center">
									<MapPin className="w-4 h-4 mr-1" />
									{user.location}
								</div>
							)}
							<div className="flex items-center">
								<Calendar className="w-4 h-4 mr-1" />
								Joined{" "}
								{user?.createdAt
									? new Date(user.createdAt).toLocaleDateString(undefined, {
											year: "numeric",
											month: "long",
										})
									: "—"}
							</div>
						</div>

						{/* Quick Stats */}
						<div className="grid grid-cols-3 gap-4">
							<div className="text-center p-3 bg-gray-50 rounded-lg">
								<div className="text-lg font-semibold text-gray-900">
									{isCandidate ? "5" : "12"}
								</div>
								<div className="text-xs text-gray-500">
									{isCandidate ? "Applications" : "Job Posts"}
								</div>
							</div>
							<div className="text-center p-3 bg-gray-50 rounded-lg">
								<div className="text-lg font-semibold text-gray-900">
									{isCandidate ? "3" : "8"}
								</div>
								<div className="text-xs text-gray-500">
									{isCandidate ? "Interviews" : "Candidates"}
								</div>
							</div>
							<div className="text-center p-3 bg-gray-50 rounded-lg">
								<div className="text-lg font-semibold text-gray-900">
									{isCandidate ? "85%" : "4.8"}
								</div>
								<div className="text-xs text-gray-500">
									{isCandidate ? "Profile Score" : "Rating"}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{isEditing ? (
				/* Edit Form */
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Personal Information */}
					<div className="card">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Personal Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-700 mb-1">
									First Name *
								</label>
								<input
									id="firstName"
									{...register("firstName", {
										required: "First name is required",
									})}
									className="input"
									placeholder="John"
								/>
								{errors.firstName && (
									<p className="mt-1 text-sm text-red-600">
										{errors.firstName.message}
									</p>
								)}
							</div>
							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-700 mb-1">
									Last Name *
								</label>
								<input
									id="lastName"
									{...register("lastName", {
										required: "Last name is required",
									})}
									className="input"
									placeholder="Doe"
								/>
								{errors.lastName && (
									<p className="mt-1 text-sm text-red-600">
										{errors.lastName.message}
									</p>
								)}
							</div>
							<div>
								<label
									htmlFor="phone"
									className="block text-sm font-medium text-gray-700 mb-1">
									Phone Number
								</label>
								<input
									id="phone"
									type="tel"
									{...register("phone")}
									className="input"
									placeholder="+1 (555) 123-4567"
								/>
							</div>
							<div>
								<label
									htmlFor="location"
									className="block text-sm font-medium text-gray-700 mb-1">
									Location
								</label>
								<input
									id="location"
									{...register("location")}
									className="input"
									placeholder="San Francisco, CA"
								/>
							</div>
						</div>
					</div>

					{/* Professional Information */}
					<div className="card">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							{isCandidate ? "Professional Information" : "Company Information"}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="title"
									className="block text-sm font-medium text-gray-700 mb-1">
									{isCandidate ? "Current Title" : "Your Title"}
								</label>
								<input
									id="title"
									{...register("title")}
									className="input"
									placeholder={
										isCandidate ? "Software Engineer" : "Senior Recruiter"
									}
								/>
							</div>
							<div>
								<label
									htmlFor="company"
									className="block text-sm font-medium text-gray-700 mb-1">
									{isCandidate ? "Current Company" : "Company Name"}
								</label>
								<input
									id="company"
									{...register("company")}
									className="input"
									placeholder={isCandidate ? "Google" : "TechCorp Inc."}
								/>
							</div>
							{isCandidate && (
								<div>
									<label
										htmlFor="experience"
										className="block text-sm font-medium text-gray-700 mb-1">
										Years of Experience
									</label>
									<select
										id="experience"
										{...register("experience")}
										className="input">
										<option value="">Select experience</option>
										<option value="0-1">0-1 years</option>
										<option value="1-3">1-3 years</option>
										<option value="3-5">3-5 years</option>
										<option value="5-10">5-10 years</option>
										<option value="10+">10+ years</option>
									</select>
								</div>
							)}
						</div>
						<div className="mt-4">
							<label
								htmlFor="summary"
								className="block text-sm font-medium text-gray-700 mb-1">
								{isCandidate ? "Professional Summary" : "About Your Company"}
							</label>
							<textarea
								id="summary"
								{...register("summary")}
								rows={4}
								className="input resize-y"
								placeholder={
									isCandidate
										? "Brief description of your professional background and career goals..."
										: "Brief description of your company and what you're looking for in candidates..."
								}
							/>
						</div>
					</div>

					{/* Skills & Links */}
					<div className="card">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							{isCandidate ? "Skills & Links" : "Professional Links"}
						</h3>
						{isCandidate && (
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Key Skills
								</label>
								<SkillsSelector
									value={selectedSkills}
									onChange={(skills) => {
										setSelectedSkills(skills);
										setValue("skills", skills, { shouldDirty: true });
									}}
									placeholder="Type to search or select skills..."
								/>
							</div>
						)}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="linkedin"
									className="block text-sm font-medium text-gray-700 mb-1">
									LinkedIn Profile
								</label>
								<input
									id="linkedin"
									type="url"
									{...register("linkedin")}
									className="input"
									placeholder="https://linkedin.com/in/yourprofile"
								/>
								<p className="mt-1 text-xs text-gray-500">
									Optional - Leave empty if you don't have a LinkedIn profile
								</p>
							</div>
							<div>
								<label
									htmlFor="website"
									className="block text-sm font-medium text-gray-700 mb-1">
									{isCandidate ? "Portfolio/Website" : "Company Website"}
								</label>
								<input
									id="website"
									type="url"
									{...register("website")}
									className="input"
									placeholder={
										isCandidate
											? "https://yourportfolio.com"
											: "https://yourcompany.com"
									}
								/>
								<p className="mt-1 text-xs text-gray-500">
									Optional - Must start with http:// or https:// if provided
								</p>
							</div>
						</div>
					</div>

					{/* Form Actions */}
					<div className="flex justify-end space-x-3">
						<button
							type="button"
							onClick={() => setIsEditing(false)}
							className="btn-secondary">
							Cancel
						</button>
						<button
							type="submit"
							disabled={updateProfileMutation.isPending || !isDirty}
							className="btn-primary flex items-center disabled:opacity-50">
							{updateProfileMutation.isPending ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Save className="w-4 h-4 mr-2" />
							)}
							Save Changes
						</button>
					</div>
				</form>
			) : (
				/* View Mode */
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Professional Summary */}
						<div className="card">
							<div className="flex items-center mb-4">
								<Briefcase className="w-5 h-5 text-gray-400 mr-2" />
								<h3 className="text-lg font-semibold text-gray-900">
									{isCandidate ? "Professional Summary" : "About"}
								</h3>
							</div>
							<p className="text-gray-600 leading-relaxed">
								{user?.summary ||
									(isCandidate
										? "Add a professional summary to showcase your experience and career goals."
										: "Add information about your company and what you're looking for in candidates.")}
							</p>
						</div>

						{/* Experience/Recent Activity */}
						<div className="card">
							<div className="flex items-center mb-4">
								<Calendar className="w-5 h-5 text-gray-400 mr-2" />
								<h3 className="text-lg font-semibold text-gray-900">
									{isCandidate ? "Experience Level" : "Recent Activity"}
								</h3>
							</div>
							<div className="space-y-4">
								{isCandidate ? (
									<div className="border-l-2 border-primary-200 pl-4">
										<h4 className="font-medium text-gray-900">
											{user?.experience
												? `${user.experience} years of experience`
												: "Experience level not specified"}
										</h4>
										{user?.title && user?.company && (
											<p className="text-sm text-gray-600">
												{user.title} at {user.company}
											</p>
										)}
									</div>
								) : (
									<>
										<div className="border-l-2 border-primary-200 pl-4">
											<h4 className="font-medium text-gray-900">
												Posted: Senior React Developer
											</h4>
											<p className="text-sm text-gray-600">
												2 days ago • 15 applications
											</p>
										</div>
										<div className="border-l-2 border-gray-200 pl-4">
											<h4 className="font-medium text-gray-900">
												Hired: Full Stack Engineer
											</h4>
											<p className="text-sm text-gray-600">
												1 week ago • Successfully placed
											</p>
										</div>
									</>
								)}
							</div>
						</div>

						{isCandidate && user?.skills && user.skills.length > 0 && (
							/* Skills */
							<div className="card">
								<div className="flex items-center mb-4">
									<Star className="w-5 h-5 text-gray-400 mr-2" />
									<h3 className="text-lg font-semibold text-gray-900">
										Skills
									</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{user.skills.map((skill, index) => (
										<span
											key={index}
											className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
											{skill}
										</span>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Contact Information */}
						<div className="card">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Contact Information
							</h3>
							<div className="space-y-3">
								<div className="flex items-center text-sm">
									<Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
									<span className="text-gray-600">{user?.email}</span>
								</div>
								{user?.phone && (
									<div className="flex items-center text-sm">
										<Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
										<span className="text-gray-600">{user.phone}</span>
									</div>
								)}
								{user?.location && (
									<div className="flex items-center text-sm">
										<MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
										<span className="text-gray-600">{user.location}</span>
									</div>
								)}
							</div>
						</div>

						{/* Professional Links */}
						{(user?.linkedin || user?.website) && (
							<div className="card">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Professional Links
								</h3>
								<div className="space-y-3">
									{user?.linkedin && (
										<a
											href={user.linkedin}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center text-sm text-primary-600 hover:text-primary-700">
											<Users className="w-4 h-4 mr-3 flex-shrink-0" />
											LinkedIn Profile
										</a>
									)}
									{user?.website && (
										<a
											href={user.website}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center text-sm text-primary-600 hover:text-primary-700">
											<Briefcase className="w-4 h-4 mr-3 flex-shrink-0" />
											{isCandidate ? "Portfolio" : "Company Website"}
										</a>
									)}
								</div>
							</div>
						)}

						{/* Company Info (for recruiters) */}
						{isRecruiter && user?.company && (
							<div className="card">
								<div className="flex items-center mb-4">
									<Users className="w-5 h-5 text-gray-400 mr-2" />
									<h3 className="text-lg font-semibold text-gray-900">
										Company
									</h3>
								</div>
								<div className="space-y-2">
									<h4 className="font-medium text-gray-900">{user.company}</h4>
									{user.location && (
										<p className="text-xs text-gray-500">{user.location}</p>
									)}
								</div>
							</div>
						)}

						{/* Account Details */}
						<div className="card">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Account Details
							</h3>
							<div className="space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-500">Account Type</span>
									<span className="font-medium capitalize">{user?.role}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Status</span>
									<span className="text-green-600 font-medium">Active</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Member Since</span>
									<span className="font-medium">
										{user?.createdAt
											? new Date(user.createdAt).toLocaleDateString(undefined, {
													month: "short",
													year: "numeric",
												})
											: "—"}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
