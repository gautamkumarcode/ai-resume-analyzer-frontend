"use client";

import SkeletonCard from "@/components/SkeletonCard";
import {
	useApplyToJob,
	useJobApplications,
	useMyApplications,
	useUpdateApplicationStatus,
} from "@/hooks/useApplication";
import { useCreateJob, useDeleteJob, useJobs } from "@/hooks/useJob";
import { useResumes, useUploadResume } from "@/hooks/useResume";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Job } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Briefcase,
	Building,
	CheckCircle,
	ClipboardList,
	DollarSign,
	Loader2,
	MapPin,
	Plus,
	Search,
	Send,
	Trash2,
	Upload,
	Users,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

interface JobFormData {
	title: string;
	company: string;
	location: string;
	type: "full-time" | "part-time" | "contract" | "internship" | "remote";
	description: string;
	requirements: string;
	skills: string;
	salaryMin: string;
	salaryMax: string;
}

const JOB_TYPES = [
	{ value: "full-time", label: "Full Time" },
	{ value: "part-time", label: "Part Time" },
	{ value: "contract", label: "Contract" },
	{ value: "internship", label: "Internship" },
	{ value: "remote", label: "Remote" },
] as const;

const TYPE_COLORS: Record<string, string> = {
	"full-time": "bg-green-100 text-green-700",
	"part-time": "bg-blue-100 text-blue-700",
	contract: "bg-orange-100 text-orange-700",
	internship: "bg-yellow-100 text-yellow-700",
	remote: "bg-purple-100 text-purple-700",
};

export default function JobsPage() {
	const { isRecruiter, isCandidate } = useAuth();
	const [showModal, setShowModal] = useState(false);
	const [search, setSearch] = useState("");
	const [filterType, setFilterType] = useState<string>("");

	// Apply modal state
	const [applyModalOpen, setApplyModalOpen] = useState(false);
	const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(
		null,
	);
	const [selectedResumeId, setSelectedResumeId] = useState<string>("");
	const [uploadingResume, setUploadingResume] = useState(false);

	// Applicants modal state
	const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
	const [selectedJobForApplicants, setSelectedJobForApplicants] =
		useState<Job | null>(null);

	// Interview questions modal state
	const [iqModalOpen, setIqModalOpen] = useState(false);
	const [selectedJobForIQ, setSelectedJobForIQ] = useState<Job | null>(null);
	const [iqList, setIqList] = useState<string[]>([]);
	const [iqInput, setIqInput] = useState("");
	const queryClient = useQueryClient();
	const saveIQMutation = useMutation({
		mutationFn: async ({
			jobId,
			questions,
		}: {
			jobId: string;
			questions: string[];
		}) => {
			await api.put(`/jobs/${jobId}/interview-questions`, { questions });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
			setIqModalOpen(false);
			import("react-hot-toast").then(({ default: toast }) =>
				toast.success("Interview questions saved!"),
			);
		},
	});

	const { data: jobs, isLoading } = useJobs();
	const createMutation = useCreateJob();
	const deleteMutation = useDeleteJob();

	// Candidate hooks
	const { data: myApplications } = useMyApplications();
	const { data: resumes } = useResumes();
	const applyMutation = useApplyToJob();
	const uploadResumeMutation = useUploadResume();

	// Recruiter hooks
	const { data: applicants, isLoading: applicantsLoading } = useJobApplications(
		selectedJobForApplicants?._id ?? "",
	);
	const updateStatusMutation = useUpdateApplicationStatus();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<JobFormData>({ defaultValues: { type: "full-time" } });

	const filteredJobs = useMemo(() => {
		if (!jobs) return [];
		const q = search.toLowerCase();
		return jobs.filter((job: Job) => {
			const matchesSearch =
				!q ||
				job.title.toLowerCase().includes(q) ||
				job.company.toLowerCase().includes(q) ||
				(job.location ?? "").toLowerCase().includes(q);
			const matchesType = !filterType || job.type === filterType;
			return matchesSearch && matchesType;
		});
	}, [jobs, search, filterType]);

	const appliedJobIds = useMemo(() => {
		if (!isCandidate || !myApplications) return new Set<string>();
		return new Set(
			myApplications
				.filter((app: any) => app.jobId) // Filter out null/undefined jobId
				.map((app: any) =>
					app.jobId && typeof app.jobId === "object"
						? app.jobId._id
						: app.jobId,
				),
		);
	}, [myApplications, isCandidate]);

	const onSubmit = async (data: JobFormData) => {
		await createMutation.mutateAsync({
			title: data.title,
			company: data.company,
			location: data.location || undefined,
			type: data.type,
			description: data.description,
			requirements: data.requirements
				.split("\n")
				.map((r) => r.trim())
				.filter(Boolean),
			skills: data.skills
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
			salary:
				data.salaryMin || data.salaryMax
					? {
							min: data.salaryMin ? Number(data.salaryMin) : undefined,
							max: data.salaryMax ? Number(data.salaryMax) : undefined,
							currency: "USD",
						}
					: undefined,
		});
		reset();
		setShowModal(false);
	};

	const handleDelete = async (jobId: string) => {
		if (!confirm("Are you sure you want to delete this job?")) return;
		await deleteMutation.mutateAsync(jobId);
	};

	const closeModal = () => {
		reset();
		setShowModal(false);
	};

	const closeApplyModal = () => {
		setApplyModalOpen(false);
		setSelectedJobForApply(null);
		setSelectedResumeId("");
		setUploadingResume(false);
	};

	const handleResumeUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setUploadingResume(true);
		try {
			await uploadResumeMutation.mutateAsync(file);
			// Reset the file input
			event.target.value = "";
		} finally {
			setUploadingResume(false);
		}
	};

	const handleApplySubmit = async () => {
		if (!selectedJobForApply) return;

		await applyMutation.mutateAsync({
			jobId: selectedJobForApply._id,
			resumeId: selectedResumeId || undefined,
		});
		closeApplyModal();
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						{isRecruiter ? "My Job Listings" : "Job Board"}
					</h1>
					<p className="mt-1 text-gray-600">
						{isRecruiter
							? "Create and manage your job postings"
							: "Browse available jobs and match them with your resume"}
					</p>
				</div>
				{isRecruiter && (
					<button
						onClick={() => setShowModal(true)}
						className="btn-primary flex items-center">
						<Plus className="w-5 h-5 mr-2" aria-hidden="true" />
						Post Job
					</button>
				)}
			</div>

			{/* Search & filter */}
			{!isLoading && jobs && jobs.length > 0 && (
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
							aria-hidden="true"
						/>
						<input
							type="search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by title, company or location…"
							className="input pl-9"
							aria-label="Search jobs"
						/>
					</div>
					<select
						value={filterType}
						onChange={(e) => setFilterType(e.target.value)}
						className="input sm:w-44"
						aria-label="Filter by job type">
						<option value="">All types</option>
						{JOB_TYPES.map((t) => (
							<option key={t.value} value={t.value}>
								{t.label}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Skeleton */}
			{isLoading && (
				<div className="grid gap-4">
					{[1, 2, 3].map((i) => (
						<SkeletonCard key={i} lines={3} />
					))}
				</div>
			)}

			{/* Jobs list */}
			{!isLoading && filteredJobs.length > 0 && (
				<div className="grid gap-4">
					{filteredJobs.map((job: Job) => (
						<article key={job._id} className="card">
							<div className="flex items-start justify-between">
								<div className="flex items-start space-x-4 min-w-0">
									<div
										className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"
										aria-hidden="true">
										<Briefcase className="w-6 h-6 text-green-600" />
									</div>
									<div className="min-w-0">
										<h3 className="font-semibold text-gray-900 truncate">
											{job.title}
										</h3>
										<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
											<span className="flex items-center">
												<Building
													className="w-4 h-4 mr-1 flex-shrink-0"
													aria-hidden="true"
												/>
												{job.company}
											</span>
											{job.location && (
												<span className="flex items-center">
													<MapPin
														className="w-4 h-4 mr-1 flex-shrink-0"
														aria-hidden="true"
													/>
													{job.location}
												</span>
											)}
											{job.salary?.min && (
												<span className="flex items-center">
													<DollarSign
														className="w-4 h-4 mr-1 flex-shrink-0"
														aria-hidden="true"
													/>
													{job.salary.min.toLocaleString()}
													{job.salary.max
														? `–${job.salary.max.toLocaleString()}`
														: "+"}{" "}
													{job.salary.currency ?? "USD"}
												</span>
											)}
										</div>
										<div className="mt-2">
											<span
												className={`px-2 py-1 rounded text-xs font-medium capitalize ${TYPE_COLORS[job.type] ?? "bg-gray-100 text-gray-600"}`}>
												{job.type}
											</span>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2 flex-shrink-0 ml-2">
									{/* Recruiter-only delete */}
									{isRecruiter && (
										<button
											onClick={() => handleDelete(job._id)}
											disabled={deleteMutation.isPending}
											className="p-2 text-red-400 hover:text-red-600 transition-colors"
											aria-label={`Delete job: ${job.title}`}>
											<Trash2 className="w-5 h-5" />
										</button>
									)}

									{/* Candidate apply button */}
									{isCandidate && (
										<button
											onClick={() => {
												setSelectedJobForApply(job);
												setApplyModalOpen(true);
											}}
											disabled={appliedJobIds.has(job._id)}
											className={`btn-primary text-sm flex items-center ${appliedJobIds.has(job._id) ? "opacity-50 cursor-not-allowed" : ""}`}>
											{appliedJobIds.has(job._id) ? (
												<>
													<CheckCircle
														className="w-4 h-4 mr-2"
														aria-hidden="true"
													/>
													Applied
												</>
											) : (
												<>
													<Send className="w-4 h-4 mr-2" aria-hidden="true" />
													Apply
												</>
											)}
										</button>
									)}

									{/* Recruiter view applicants button */}
									{isRecruiter && (
										<button
											onClick={() => {
												setSelectedJobForApplicants(job);
												setApplicantsModalOpen(true);
											}}
											className="btn-secondary text-sm flex items-center">
											<Users className="w-4 h-4 mr-2" aria-hidden="true" />
											View Applicants
										</button>
									)}

									{/* Recruiter interview questions button */}
									{isRecruiter && (
										<button
											onClick={() => {
												setSelectedJobForIQ(job);
												setIqList((job as any).interviewQuestions ?? []);
												setIqInput("");
												setIqModalOpen(true);
											}}
											className="btn-secondary text-sm flex items-center"
											title="Set interview questions">
											<ClipboardList
												className="w-4 h-4 mr-2"
												aria-hidden="true"
											/>
											Questions
										</button>
									)}
								</div>
							</div>

							<div className="mt-4 pt-4 border-t border-gray-100">
								<p className="text-gray-600 text-sm line-clamp-2">
									{job.description}
								</p>
							</div>

							{job.requirements.length > 0 && (
								<div className="mt-3">
									<p className="text-xs font-medium text-gray-500 mb-1">
										Requirements
									</p>
									<ul className="space-y-1">
										{job.requirements.slice(0, 3).map((req, i) => (
											<li
												key={i}
												className="flex items-start space-x-2 text-sm text-gray-600">
												<span
													className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"
													aria-hidden="true"
												/>
												<span>{req}</span>
											</li>
										))}
										{job.requirements.length > 3 && (
											<li className="text-xs text-gray-400 pl-3">
												+{job.requirements.length - 3} more
											</li>
										)}
									</ul>
								</div>
							)}

							{job.skills.length > 0 && (
								<div className="mt-3 flex flex-wrap gap-2">
									{job.skills.slice(0, 6).map((skill, i) => (
										<span
											key={i}
											className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
											{skill}
										</span>
									))}
									{job.skills.length > 6 && (
										<span className="px-2 py-1 text-gray-500 text-xs">
											+{job.skills.length - 6} more
										</span>
									)}
								</div>
							)}
						</article>
					))}
				</div>
			)}

			{/* No results after filter */}
			{!isLoading && jobs && jobs.length > 0 && filteredJobs.length === 0 && (
				<div className="card text-center py-10">
					<p className="text-gray-500">No jobs match your search.</p>
					<button
						onClick={() => {
							setSearch("");
							setFilterType("");
						}}
						className="mt-3 text-primary-600 text-sm hover:underline">
						Clear filters
					</button>
				</div>
			)}

			{/* Empty state */}
			{!isLoading && (!jobs || jobs.length === 0) && (
				<div className="card text-center py-12">
					<Briefcase
						className="w-16 h-16 text-gray-300 mx-auto mb-4"
						aria-hidden="true"
					/>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{isRecruiter ? "No jobs posted yet" : "No jobs available yet"}
					</h3>
					<p className="text-gray-500 mb-4">
						{isRecruiter
							? "Create your first job listing to start finding candidates"
							: "Check back later for new opportunities"}
					</p>
					{isRecruiter && (
						<button
							onClick={() => setShowModal(true)}
							className="btn-primary inline-flex items-center">
							<Plus className="w-5 h-5 mr-2" aria-hidden="true" />
							Post Job
						</button>
					)}
				</div>
			)}

			{/* Interview Questions Modal */}
			{iqModalOpen && selectedJobForIQ && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
					role="dialog"
					aria-modal="true">
					<div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<div>
								<h2 className="text-xl font-semibold text-gray-900">
									Interview Questions
								</h2>
								<p className="text-sm text-gray-500 mt-0.5">
									{selectedJobForIQ.title} — {selectedJobForIQ.company}
								</p>
							</div>
							<button
								onClick={() => setIqModalOpen(false)}
								className="p-2 text-gray-400 hover:text-gray-600"
								aria-label="Close">
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-6 space-y-4">
							<p className="text-sm text-gray-600">
								Add your own questions. If none are set, AI will generate
								questions automatically.
							</p>

							{/* Add question input */}
							<div className="flex gap-2">
								<input
									value={iqInput}
									onChange={(e) => setIqInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && iqInput.trim()) {
											setIqList((prev) => [...prev, iqInput.trim()]);
											setIqInput("");
										}
									}}
									placeholder="Type a question and press Enter..."
									className="input flex-1"
								/>
								<button
									onClick={() => {
										if (iqInput.trim()) {
											setIqList((prev) => [...prev, iqInput.trim()]);
											setIqInput("");
										}
									}}
									className="btn-primary px-4">
									<Plus className="w-4 h-4" />
								</button>
							</div>

							{/* Questions list */}
							{iqList.length > 0 ? (
								<ul className="space-y-2">
									{iqList.map((q, i) => (
										<li
											key={i}
											className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
											<span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
												{i + 1}
											</span>
											<span className="flex-1 text-sm text-gray-800">{q}</span>
											<button
												onClick={() =>
													setIqList((prev) =>
														prev.filter((_, idx) => idx !== i),
													)
												}
												className="text-red-400 hover:text-red-600 flex-shrink-0"
												aria-label="Remove question">
												<X className="w-4 h-4" />
											</button>
										</li>
									))}
								</ul>
							) : (
								<div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
									No questions yet — AI will generate them automatically
								</div>
							)}

							<div className="flex justify-end gap-3 pt-2">
								<button
									onClick={() => setIqModalOpen(false)}
									className="btn-secondary">
									Cancel
								</button>
								<button
									onClick={() =>
										saveIQMutation.mutate({
											jobId: selectedJobForIQ._id,
											questions: iqList,
										})
									}
									disabled={saveIQMutation.isPending}
									className="btn-primary flex items-center gap-2">
									{saveIQMutation.isPending ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<CheckCircle className="w-4 h-4" />
									)}
									Save Questions
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Post Job Modal — recruiters only */}
			{showModal && isRecruiter && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="modal-title">
					<div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h2
								id="modal-title"
								className="text-xl font-semibold text-gray-900">
								Post a Job
							</h2>
							<button
								onClick={closeModal}
								className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
								aria-label="Close modal">
								<X className="w-5 h-5" />
							</button>
						</div>

						<form
							onSubmit={handleSubmit(onSubmit)}
							className="p-6 space-y-4"
							noValidate>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="title"
										className="block text-sm font-medium text-gray-700 mb-1">
										Job Title <span aria-hidden="true">*</span>
									</label>
									<input
										id="title"
										{...register("title", {
											required: "Job title is required",
										})}
										className="input"
										placeholder="e.g. Senior Software Engineer"
									/>
									{errors.title && (
										<p className="mt-1 text-sm text-red-600" role="alert">
											{errors.title.message}
										</p>
									)}
								</div>
								<div>
									<label
										htmlFor="company"
										className="block text-sm font-medium text-gray-700 mb-1">
										Company <span aria-hidden="true">*</span>
									</label>
									<input
										id="company"
										{...register("company", {
											required: "Company is required",
										})}
										className="input"
										placeholder="e.g. Google"
									/>
									{errors.company && (
										<p className="mt-1 text-sm text-red-600" role="alert">
											{errors.company.message}
										</p>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
										placeholder="e.g. San Francisco, CA"
									/>
								</div>
								<div>
									<label
										htmlFor="type"
										className="block text-sm font-medium text-gray-700 mb-1">
										Job Type
									</label>
									<select id="type" {...register("type")} className="input">
										{JOB_TYPES.map((t) => (
											<option key={t.value} value={t.value}>
												{t.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="salaryMin"
										className="block text-sm font-medium text-gray-700 mb-1">
										Min Salary{" "}
										<span className="text-gray-400 font-normal">(USD)</span>
									</label>
									<input
										id="salaryMin"
										type="number"
										min="0"
										{...register("salaryMin")}
										className="input"
										placeholder="e.g. 80000"
									/>
								</div>
								<div>
									<label
										htmlFor="salaryMax"
										className="block text-sm font-medium text-gray-700 mb-1">
										Max Salary{" "}
										<span className="text-gray-400 font-normal">(USD)</span>
									</label>
									<input
										id="salaryMax"
										type="number"
										min="0"
										{...register("salaryMax")}
										className="input"
										placeholder="e.g. 120000"
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700 mb-1">
									Job Description <span aria-hidden="true">*</span>
								</label>
								<textarea
									id="description"
									{...register("description", {
										required: "Description is required",
									})}
									className="input min-h-[120px] resize-y"
									placeholder="Describe the role and responsibilities…"
								/>
								{errors.description && (
									<p className="mt-1 text-sm text-red-600" role="alert">
										{errors.description.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="requirements"
									className="block text-sm font-medium text-gray-700 mb-1">
									Requirements{" "}
									<span className="text-gray-400 font-normal">
										(one per line)
									</span>
								</label>
								<textarea
									id="requirements"
									{...register("requirements")}
									className="input min-h-[100px] resize-y"
									placeholder={
										"5+ years of experience\nBachelor's degree in CS"
									}
								/>
							</div>

							<div>
								<label
									htmlFor="skills"
									className="block text-sm font-medium text-gray-700 mb-1">
									Required Skills{" "}
									<span className="text-gray-400 font-normal">
										(comma separated)
									</span>
								</label>
								<input
									id="skills"
									{...register("skills")}
									className="input"
									placeholder="JavaScript, React, Node.js"
								/>
							</div>

							<div className="flex justify-end space-x-3 pt-4">
								<button
									type="button"
									onClick={closeModal}
									className="btn-secondary">
									Cancel
								</button>
								<button
									type="submit"
									disabled={createMutation.isPending}
									className="btn-primary flex items-center">
									{createMutation.isPending ? (
										<Loader2
											className="w-5 h-5 mr-2 animate-spin"
											aria-hidden="true"
										/>
									) : (
										<Plus className="w-5 h-5 mr-2" aria-hidden="true" />
									)}
									Post Job
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Apply Modal */}
			{applyModalOpen && selectedJobForApply && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
					role="dialog"
					aria-modal="true">
					<div className="bg-white rounded-xl shadow-xl max-w-md w-full">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h2 className="text-xl font-semibold text-gray-900">
								Apply to Job
							</h2>
							<button
								onClick={closeApplyModal}
								className="p-2 text-gray-400 hover:text-gray-600"
								aria-label="Close">
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-6 space-y-4">
							<div>
								<p className="font-medium text-gray-900">
									{selectedJobForApply.title}
								</p>
								<p className="text-sm text-gray-500">
									{selectedJobForApply.company}
								</p>
							</div>

							{/* Resume Selection or Upload */}
							{resumes && resumes.length > 0 ? (
								<div>
									<label
										htmlFor="apply-resume"
										className="block text-sm font-medium text-gray-700 mb-1">
										Select Resume (optional)
									</label>
									<select
										id="apply-resume"
										className="input"
										value={selectedResumeId}
										onChange={(e) => setSelectedResumeId(e.target.value)}>
										<option value="">No resume</option>
										{resumes.map((r: any) => (
											<option key={r._id} value={r._id}>
												{r.fileName}
											</option>
										))}
									</select>
								</div>
							) : (
								<div>
									<p className="text-sm text-gray-600 mb-3">
										You don't have any resumes uploaded yet. Upload one to
										improve your application.
									</p>
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
										<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
										<label htmlFor="resume-upload" className="cursor-pointer">
											<span className="text-sm font-medium text-primary-600 hover:text-primary-500">
												Upload Resume
											</span>
											<input
												id="resume-upload"
												type="file"
												accept=".pdf,.doc,.docx"
												onChange={handleResumeUpload}
												disabled={uploadingResume}
												className="hidden"
											/>
										</label>
										<p className="text-xs text-gray-500 mt-1">
											PDF, DOC, or DOCX up to 10MB
										</p>
										{uploadingResume && (
											<div className="mt-2 flex items-center justify-center">
												<Loader2 className="w-4 h-4 animate-spin mr-2" />
												<span className="text-sm text-gray-600">
													Uploading...
												</span>
											</div>
										)}
									</div>
								</div>
							)}

							<div className="flex justify-end space-x-3">
								<button onClick={closeApplyModal} className="btn-secondary">
									Cancel
								</button>
								<button
									onClick={handleApplySubmit}
									disabled={applyMutation.isPending || uploadingResume}
									className="btn-primary flex items-center">
									{applyMutation.isPending ? (
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									) : (
										<Send className="w-4 h-4 mr-2" />
									)}
									Submit Application
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Applicants Modal */}
			{applicantsModalOpen && selectedJobForApplicants && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
					role="dialog"
					aria-modal="true">
					<div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h2 className="text-xl font-semibold text-gray-900">
								Applicants for {selectedJobForApplicants.title}
							</h2>
							<button
								onClick={() => {
									setApplicantsModalOpen(false);
									setSelectedJobForApplicants(null);
								}}
								className="p-2 text-gray-400 hover:text-gray-600"
								aria-label="Close">
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-6">
							{applicantsLoading ? (
								<div className="space-y-3">
									{[1, 2, 3].map((i) => (
										<SkeletonCard key={i} lines={1} />
									))}
								</div>
							) : applicants && applicants.length > 0 ? (
								<div className="space-y-3">
									{applicants.map((app: any) => {
										const candidate = app.candidateId;
										const resume = app.resumeId;
										return (
											<div
												key={app._id}
												className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
												<div className="min-w-0">
													<p className="font-medium text-gray-900">
														{candidate?.firstName} {candidate?.lastName}
													</p>
													<p className="text-sm text-gray-500">
														{candidate?.email}
													</p>
													{resume && (
														<p className="text-xs text-gray-400 mt-1">
															Resume: {resume.fileName} · Score:{" "}
															{resume.aiAnalysis?.overallScore ?? "—"}
														</p>
													)}
												</div>
												<div className="flex items-center gap-2 flex-shrink-0 ml-4">
													<span
														className={`px-2 py-1 rounded text-xs font-medium capitalize ${
															app.status === "shortlisted"
																? "bg-green-100 text-green-700"
																: app.status === "rejected"
																	? "bg-red-100 text-red-700"
																	: "bg-gray-100 text-gray-700"
														}`}>
														{app.status}
													</span>
													{app.status === "applied" && (
														<>
															<button
																onClick={() =>
																	updateStatusMutation.mutate({
																		id: app._id,
																		status: "shortlisted",
																	})
																}
																className="btn-secondary text-xs">
																Shortlist
															</button>
															<button
																onClick={() =>
																	updateStatusMutation.mutate({
																		id: app._id,
																		status: "rejected",
																	})
																}
																className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded">
																Reject
															</button>
														</>
													)}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<p className="text-gray-500 text-center py-8">
									No applicants yet
								</p>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
