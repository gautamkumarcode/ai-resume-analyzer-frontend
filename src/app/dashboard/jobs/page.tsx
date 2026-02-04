"use client";

import { useCreateJob, useDeleteJob, useJobs } from "@/hooks/useJob";
import { Job } from "@/types";
import {
	Briefcase,
	Building,
	Loader2,
	MapPin,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface JobFormData {
	title: string;
	company: string;
	location: string;
	type: "full-time" | "part-time" | "contract" | "internship" | "remote";
	description: string;
	requirements: string;
	skills: string;
}

export default function JobsPage() {
	const [showModal, setShowModal] = useState(false);

	const { data: jobs, isLoading } = useJobs();
	const createMutation = useCreateJob();
	const deleteMutation = useDeleteJob();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<JobFormData>();

	const onSubmit = async (data: JobFormData) => {
		await createMutation.mutateAsync({
			title: data.title,
			company: data.company,
			location: data.location,
			type: data.type,
			description: data.description,
			requirements: data.requirements.split("\n").filter((r) => r.trim()),
			skills: data.skills
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s),
		});
		reset();
		setShowModal(false);
	};

	const handleDelete = async (jobId: string) => {
		if (confirm("Are you sure you want to delete this job?")) {
			await deleteMutation.mutateAsync(jobId);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="w-8 h-8 animate-spin text-primary-600" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
					<p className="mt-1 text-gray-600">
						Add jobs to match against your resumes
					</p>
				</div>

				<button
					onClick={() => setShowModal(true)}
					className="btn-primary flex items-center">
					<Plus className="w-5 h-5 mr-2" />
					Add Job
				</button>
			</div>

			{/* Jobs List */}
			{jobs && jobs.length > 0 ? (
				<div className="grid gap-4">
					{jobs.map((job: Job) => (
						<div key={job._id} className="card">
							<div className="flex items-start justify-between">
								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
										<Briefcase className="w-6 h-6 text-green-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">{job.title}</h3>
										<div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
											<span className="flex items-center">
												<Building className="w-4 h-4 mr-1" />
												{job.company}
											</span>
											{job.location && (
												<span className="flex items-center">
													<MapPin className="w-4 h-4 mr-1" />
													{job.location}
												</span>
											)}
										</div>
										<div className="mt-2">
											<span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">
												{job.type}
											</span>
										</div>
									</div>
								</div>

								<button
									onClick={() => handleDelete(job._id)}
									className="p-2 text-red-400 hover:text-red-600">
									<Trash2 className="w-5 h-5" />
								</button>
							</div>

							<div className="mt-4 pt-4 border-t border-gray-100">
								<p className="text-gray-600 text-sm line-clamp-2">
									{job.description}
								</p>
							</div>

							{job.skills.length > 0 && (
								<div className="mt-4">
									<div className="flex flex-wrap gap-2">
										{job.skills.slice(0, 5).map((skill, i) => (
											<span
												key={i}
												className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
												{skill}
											</span>
										))}
										{job.skills.length > 5 && (
											<span className="px-2 py-1 text-gray-500 text-xs">
												+{job.skills.length - 5} more
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="card text-center py-12">
					<Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No jobs yet
					</h3>
					<p className="text-gray-500 mb-4">
						Add job descriptions to match against your resumes
					</p>
					<button
						onClick={() => setShowModal(true)}
						className="btn-primary inline-flex items-center">
						<Plus className="w-5 h-5 mr-2" />
						Add Job
					</button>
				</div>
			)}

			{/* Add Job Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h2 className="text-xl font-semibold text-gray-900">Add Job</h2>
							<button
								onClick={() => setShowModal(false)}
								className="p-2 text-gray-400 hover:text-gray-600">
								<X className="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Job Title *
									</label>
									<input
										{...register("title", {
											required: "Job title is required",
										})}
										className="input"
										placeholder="e.g. Senior Software Engineer"
									/>
									{errors.title && (
										<p className="mt-1 text-sm text-red-600">
											{errors.title.message}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Company *
									</label>
									<input
										{...register("company", {
											required: "Company is required",
										})}
										className="input"
										placeholder="e.g. Google"
									/>
									{errors.company && (
										<p className="mt-1 text-sm text-red-600">
											{errors.company.message}
										</p>
									)}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Location
									</label>
									<input
										{...register("location")}
										className="input"
										placeholder="e.g. San Francisco, CA"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Job Type
									</label>
									<select {...register("type")} className="input">
										<option value="full-time">Full Time</option>
										<option value="part-time">Part Time</option>
										<option value="contract">Contract</option>
										<option value="internship">Internship</option>
										<option value="remote">Remote</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Job Description *
								</label>
								<textarea
									{...register("description", {
										required: "Description is required",
									})}
									className="input min-h-[120px]"
									placeholder="Describe the job role and responsibilities..."
								/>
								{errors.description && (
									<p className="mt-1 text-sm text-red-600">
										{errors.description.message}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Requirements (one per line)
								</label>
								<textarea
									{...register("requirements")}
									className="input min-h-[100px]"
									placeholder="5+ years of experience&#10;Bachelor's degree in CS&#10;Strong problem-solving skills"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Skills (comma separated)
								</label>
								<input
									{...register("skills")}
									className="input"
									placeholder="JavaScript, React, Node.js, TypeScript"
								/>
							</div>

							<div className="flex justify-end space-x-3 pt-4">
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="btn-secondary">
									Cancel
								</button>
								<button
									type="submit"
									disabled={createMutation.isPending}
									className="btn-primary flex items-center">
									{createMutation.isPending ? (
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
									) : (
										<Plus className="w-5 h-5 mr-2" />
									)}
									Add Job
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
