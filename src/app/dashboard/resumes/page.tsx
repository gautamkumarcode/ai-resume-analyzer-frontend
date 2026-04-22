"use client";

import RoleGuard from "@/components/RoleGuard";
import SkeletonCard from "@/components/SkeletonCard";
import { useJobs } from "@/hooks/useJob";
import {
	useAnalyzeResume,
	useDeleteResume,
	useImproveResume,
	useResumes,
	useUploadResume,
} from "@/hooks/useResume";
import { ImprovementResult, Job, Resume } from "@/types";
import {
	ChevronDown,
	ChevronUp,
	FileText,
	Loader2,
	RefreshCw,
	Sparkles,
	Trash2,
	Upload,
	Wand2,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = [
	"application/pdf",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function ResumesPage() {
	return (
		<RoleGuard role="candidate">
			<ResumesContent />
		</RoleGuard>
	);
}

function ResumesContent() {
	const [expandedResume, setExpandedResume] = useState<string | null>(null);
	const [analyzingId, setAnalyzingId] = useState<string | null>(null);
	const [improveModalOpen, setImproveModalOpen] = useState(false);
	const [selectedResumeForImprove, setSelectedResumeForImprove] = useState<
		string | null
	>(null);
	const [selectedJobForImprove, setSelectedJobForImprove] =
		useState<string>("");
	const [improvementResult, setImprovementResult] =
		useState<ImprovementResult | null>(null);
	const [showDebug, setShowDebug] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: resumes, isLoading } = useResumes();
	const uploadMutation = useUploadResume();
	const analyzeMutation = useAnalyzeResume();
	const deleteMutation = useDeleteResume();
	const improveMutation = useImproveResume();
	const { data: jobs } = useJobs();

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Client-side validation
		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error("Only PDF and DOCX files are allowed.");
			if (fileInputRef.current) fileInputRef.current.value = "";
			return;
		}

		if (file.size > MAX_FILE_SIZE_BYTES) {
			toast.error(`File size must be under ${MAX_FILE_SIZE_MB}MB.`);
			if (fileInputRef.current) fileInputRef.current.value = "";
			return;
		}

		await uploadMutation.mutateAsync(file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleAnalyze = async (resumeId: string) => {
		setAnalyzingId(resumeId);
		try {
			await analyzeMutation.mutateAsync(resumeId);
		} finally {
			setAnalyzingId(null);
		}
	};

	const handleDelete = async (resumeId: string) => {
		if (!confirm("Are you sure you want to delete this resume?")) return;
		await deleteMutation.mutateAsync(resumeId);
		if (expandedResume === resumeId) setExpandedResume(null);
	};

	const toggleExpand = (resumeId: string) => {
		setExpandedResume(expandedResume === resumeId ? null : resumeId);
	};

	const scoreColorClass = (score: number) => {
		if (score >= 80) return "bg-green-100 text-green-700";
		if (score >= 60) return "bg-yellow-100 text-yellow-700";
		return "bg-red-100 text-red-700";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Resumes</h1>
					<p className="mt-1 text-gray-600">
						Upload and analyze your resumes with AI
					</p>
				</div>

				<div className="flex items-center space-x-3">
					<button
						onClick={() => setShowDebug(!showDebug)}
						className="btn-secondary text-sm"
						title="Toggle debug info">
						Debug
					</button>
					<div>
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf,.docx"
							onChange={handleFileUpload}
							className="hidden"
							id="resume-upload"
							aria-label="Upload resume file"
						/>
						<label
							htmlFor="resume-upload"
							className="btn-primary inline-flex items-center cursor-pointer">
							{uploadMutation.isPending ? (
								<Loader2
									className="w-5 h-5 mr-2 animate-spin"
									aria-hidden="true"
								/>
							) : (
								<Upload className="w-5 h-5 mr-2" aria-hidden="true" />
							)}
							Upload Resume
						</label>
					</div>
				</div>
			</div>

			<p className="text-xs text-gray-400">
				Accepted formats: PDF, DOCX · Max size: {MAX_FILE_SIZE_MB}MB
			</p>

			{/* Debug Panel */}
			{showDebug && (
				<div className="card bg-gray-50 border-gray-200">
					<h3 className="font-semibold text-gray-900 mb-3">
						Debug Information
					</h3>
					<div className="space-y-2 text-sm">
						<div>
							<span className="font-medium">API URL:</span>{" "}
							<span className="text-gray-600">
								{process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}
							</span>
						</div>
						<div>
							<span className="font-medium">Resumes Query Status:</span>{" "}
							<span className="text-gray-600">
								{isLoading ? "Loading..." : "Loaded"}
							</span>
						</div>
						<div>
							<span className="font-medium">Resumes Count:</span>{" "}
							<span className="text-gray-600">{resumes?.length || 0}</span>
						</div>
						<div>
							<span className="font-medium">Upload Status:</span>{" "}
							<span className="text-gray-600">
								{uploadMutation.isPending
									? "Uploading..."
									: uploadMutation.isError
										? "Error"
										: "Ready"}
							</span>
						</div>
						<div>
							<span className="font-medium">Analyze Status:</span>{" "}
							<span className="text-gray-600">
								{analyzeMutation.isPending
									? "Analyzing..."
									: analyzeMutation.isError
										? "Error"
										: "Ready"}
							</span>
						</div>
						{(uploadMutation.isError || analyzeMutation.isError) && (
							<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
								<span className="font-medium text-red-800">Last Error:</span>
								<pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
									{uploadMutation.error?.message ||
										analyzeMutation.error?.message ||
										"Unknown error"}
								</pre>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Skeleton loaders */}
			{isLoading && (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<SkeletonCard key={i} lines={2} />
					))}
				</div>
			)}

			{/* Resumes list */}
			{!isLoading && resumes && resumes.length > 0 && (
				<div className="space-y-4">
					{resumes.map((resume: Resume) => {
						const isAnalyzing = analyzingId === resume._id;

						return (
							<article key={resume._id} className="card">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4 min-w-0">
										<div
											className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0"
											aria-hidden="true">
											<FileText className="w-6 h-6 text-primary-600" />
										</div>
										<div className="min-w-0">
											<h3 className="font-semibold text-gray-900 truncate">
												{resume.fileName}
											</h3>
											<p className="text-sm text-gray-500">
												Uploaded{" "}
												{new Date(resume.createdAt).toLocaleDateString(
													undefined,
													{ year: "numeric", month: "short", day: "numeric" },
												)}
											</p>
										</div>
									</div>

									<div className="flex items-center space-x-2 flex-shrink-0 ml-4">
										{resume.aiAnalysis ? (
											<>
												<span
													className={`px-3 py-1 rounded-full text-sm font-medium ${scoreColorClass(
														resume.aiAnalysis.overallScore,
													)}`}
													aria-label={`ATS Score: ${resume.aiAnalysis.overallScore} out of 100`}>
													ATS Score: {resume.aiAnalysis.overallScore}
												</span>
												{/* Re-analyze button */}
												<button
													onClick={() => handleAnalyze(resume._id)}
													disabled={isAnalyzing}
													className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
													title="Re-analyze resume"
													aria-label="Re-analyze resume">
													{isAnalyzing ? (
														<Loader2 className="w-4 h-4 animate-spin" />
													) : (
														<RefreshCw className="w-4 h-4" />
													)}
												</button>
												<button
													onClick={() => {
														setSelectedResumeForImprove(resume._id);
														setImprovementResult(null);
														setSelectedJobForImprove("");
														setImproveModalOpen(true);
													}}
													className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
													title="Get improvement suggestions"
													aria-label="Get improvement suggestions">
													<Wand2 className="w-4 h-4" />
												</button>
											</>
										) : (
											<button
												onClick={() => handleAnalyze(resume._id)}
												disabled={isAnalyzing}
												className="btn-secondary flex items-center text-sm"
												aria-label="Analyze resume with AI">
												{isAnalyzing ? (
													<Loader2
														className="w-4 h-4 mr-2 animate-spin"
														aria-hidden="true"
													/>
												) : (
													<Sparkles
														className="w-4 h-4 mr-2"
														aria-hidden="true"
													/>
												)}
												Analyze
											</button>
										)}

										<button
											onClick={() => toggleExpand(resume._id)}
											className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
											aria-expanded={expandedResume === resume._id}
											aria-label={
												expandedResume === resume._id
													? "Collapse details"
													: "Expand details"
											}>
											{expandedResume === resume._id ? (
												<ChevronUp className="w-5 h-5" />
											) : (
												<ChevronDown className="w-5 h-5" />
											)}
										</button>

										<button
											onClick={() => handleDelete(resume._id)}
											disabled={deleteMutation.isPending}
											className="p-2 text-red-400 hover:text-red-600 transition-colors"
											aria-label="Delete resume">
											<Trash2 className="w-5 h-5" />
										</button>
									</div>
								</div>

								{/* Expanded AI analysis */}
								{expandedResume === resume._id && resume.aiAnalysis && (
									<div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
										{/* ATS Score Card */}
										<div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
											<div className="flex items-center justify-between">
												<div>
													<h4 className="text-sm font-medium text-primary-700 mb-1">
														ATS Compatibility Score
													</h4>
													<p className="text-3xl font-bold text-primary-900">
														{resume.aiAnalysis.overallScore}/100
													</p>
													<p className="text-sm text-primary-600 mt-2">
														{resume.aiAnalysis.overallScore >= 80
															? "Excellent - Highly likely to pass ATS screening"
															: resume.aiAnalysis.overallScore >= 60
																? "Good - Should pass most ATS systems with minor improvements"
																: "Needs Improvement - May struggle with ATS screening"}
													</p>
												</div>
												<div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
													<div className="text-center">
														<div className="text-2xl font-bold text-primary-600">
															{resume.aiAnalysis.overallScore >= 80
																? "A"
																: resume.aiAnalysis.overallScore >= 60
																	? "B"
																	: "C"}
														</div>
														<div className="text-xs text-gray-500">Grade</div>
													</div>
												</div>
											</div>
										</div>

										{/* Summary */}
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												AI Summary
											</h4>
											<p className="text-gray-600 text-sm leading-relaxed">
												{resume.aiAnalysis.summary}
											</p>
										</div>

										{/* Strengths & Improvements */}
										<div className="grid md:grid-cols-2 gap-6">
											<div>
												<h4 className="font-semibold text-gray-900 mb-3">
													Strengths
												</h4>
												<ul className="space-y-2">
													{resume.aiAnalysis.strengths.map((s, i) => (
														<li key={i} className="flex items-start space-x-2">
															<span
																className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"
																aria-hidden="true"
															/>
															<span className="text-gray-600 text-sm">{s}</span>
														</li>
													))}
												</ul>
											</div>
											<div>
												<h4 className="font-semibold text-gray-900 mb-3">
													Improvements
												</h4>
												<ul className="space-y-2">
													{resume.aiAnalysis.improvements.map((imp, i) => (
														<li key={i} className="flex items-start space-x-2">
															<span
																className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"
																aria-hidden="true"
															/>
															<span className="text-gray-600 text-sm">
																{imp}
															</span>
														</li>
													))}
												</ul>
											</div>
										</div>

										{/* Keywords */}
										{resume.aiAnalysis.keywords.length > 0 && (
											<div>
												<h4 className="font-semibold text-gray-900 mb-2">
													Keywords
												</h4>
												<div className="flex flex-wrap gap-2">
													{resume.aiAnalysis.keywords.map((kw, i) => (
														<span
															key={i}
															className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
															{kw}
														</span>
													))}
												</div>
											</div>
										)}

										{/* Skills */}
										{resume.parsedData.skills.length > 0 && (
											<div>
												<h4 className="font-semibold text-gray-900 mb-2">
													Detected Skills
												</h4>
												<div className="flex flex-wrap gap-2">
													{resume.parsedData.skills.map((skill, i) => (
														<span
															key={i}
															className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
															{skill.name}
															{skill.level && (
																<span className="ml-1 text-gray-400 text-xs capitalize">
																	· {skill.level}
																</span>
															)}
														</span>
													))}
												</div>
											</div>
										)}

										{/* Experience */}
										{resume.parsedData.experience.length > 0 && (
											<div>
												<h4 className="font-semibold text-gray-900 mb-3">
													Experience
												</h4>
												<div className="space-y-3">
													{resume.parsedData.experience.map((exp, i) => (
														<div
															key={i}
															className="pl-4 border-l-2 border-primary-200">
															<p className="font-medium text-gray-900 text-sm">
																{exp.title}
															</p>
															<p className="text-gray-500 text-sm">
																{exp.company}
																{exp.location ? ` · ${exp.location}` : ""}
															</p>
															{exp.description && (
																<p className="text-gray-600 text-sm mt-1">
																	{exp.description}
																</p>
															)}
														</div>
													))}
												</div>
											</div>
										)}

										{/* Education */}
										{resume.parsedData.education.length > 0 && (
											<div>
												<h4 className="font-semibold text-gray-900 mb-3">
													Education
												</h4>
												<div className="space-y-3">
													{resume.parsedData.education.map((edu, i) => (
														<div
															key={i}
															className="pl-4 border-l-2 border-primary-200">
															<p className="font-medium text-gray-900 text-sm">
																{edu.degree}
															</p>
															<p className="text-gray-500 text-sm">
																{edu.institution}
																{edu.location ? ` · ${edu.location}` : ""}
															</p>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								)}

								{/* Prompt to analyze if not yet done */}
								{expandedResume === resume._id && !resume.aiAnalysis && (
									<div className="mt-6 pt-6 border-t border-gray-200 text-center py-4">
										<p className="text-gray-500 text-sm mb-3">
											No analysis yet. Click &quot;Analyze&quot; to get AI
											feedback.
										</p>
									</div>
								)}
							</article>
						);
					})}
				</div>
			)}

			{/* Empty state */}
			{!isLoading && (!resumes || resumes.length === 0) && (
				<div className="card text-center py-12">
					<FileText
						className="w-16 h-16 text-gray-300 mx-auto mb-4"
						aria-hidden="true"
					/>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No resumes yet
					</h3>
					<p className="text-gray-500 mb-4">
						Upload your first resume to get AI-powered analysis
					</p>
					<label
						htmlFor="resume-upload"
						className="btn-primary inline-flex items-center cursor-pointer">
						<Upload className="w-5 h-5 mr-2" aria-hidden="true" />
						Upload Resume
					</label>
				</div>
			)}

			{/* Improve Modal */}
			{improveModalOpen && selectedResumeForImprove && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
					role="dialog"
					aria-modal="true">
					<div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h2 className="text-xl font-semibold text-gray-900">
								Resume Improvement Suggestions
							</h2>
							<button
								onClick={() => {
									setImproveModalOpen(false);
									setImprovementResult(null);
								}}
								className="p-2 text-gray-400 hover:text-gray-600"
								aria-label="Close">
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-6 space-y-4">
							{!improvementResult ? (
								<>
									<div>
										<label
											htmlFor="improve-job"
											className="block text-sm font-medium text-gray-700 mb-1">
											Select Target Job
										</label>
										<select
											id="improve-job"
											value={selectedJobForImprove}
											onChange={(e) => setSelectedJobForImprove(e.target.value)}
											className="input">
											<option value="">Choose a job...</option>
											{jobs?.map((job: Job) => (
												<option key={job._id} value={job._id}>
													{job.title} at {job.company}
												</option>
											))}
										</select>
									</div>
									<div className="flex justify-end space-x-3">
										<button
											onClick={() => setImproveModalOpen(false)}
											className="btn-secondary">
											Cancel
										</button>
										<button
											onClick={async () => {
												if (!selectedJobForImprove) return;
												const result = await improveMutation.mutateAsync({
													resumeId: selectedResumeForImprove,
													jobId: selectedJobForImprove,
												});
												setImprovementResult(result);
											}}
											disabled={
												!selectedJobForImprove || improveMutation.isPending
											}
											className="btn-primary flex items-center">
											{improveMutation.isPending ? (
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											) : (
												<Wand2 className="w-4 h-4 mr-2" />
											)}
											Get Suggestions
										</button>
									</div>
								</>
							) : (
								<div className="space-y-6">
									{improvementResult.improvedBulletPoints.length > 0 && (
										<div>
											<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
												<span className="w-2 h-2 rounded-full bg-green-500" />
												Improved Bullet Points
											</h3>
											<ul className="space-y-2">
												{improvementResult.improvedBulletPoints.map((bp, i) => (
													<li
														key={i}
														className="text-sm text-gray-600 pl-4 border-l-2 border-green-200">
														{bp}
													</li>
												))}
											</ul>
										</div>
									)}
									{improvementResult.missingKeywords.length > 0 && (
										<div>
											<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
												<span className="w-2 h-2 rounded-full bg-red-500" />
												Missing Keywords
											</h3>
											<div className="flex flex-wrap gap-2">
												{improvementResult.missingKeywords.map((kw, i) => (
													<span
														key={i}
														className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
														{kw}
													</span>
												))}
											</div>
										</div>
									)}
									{improvementResult.formattingSuggestions.length > 0 && (
										<div>
											<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
												<span className="w-2 h-2 rounded-full bg-blue-500" />
												Formatting Suggestions
											</h3>
											<ul className="space-y-2">
												{improvementResult.formattingSuggestions.map((s, i) => (
													<li
														key={i}
														className="flex items-start gap-2 text-sm text-gray-600">
														<span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
														{s}
													</li>
												))}
											</ul>
										</div>
									)}
									<div className="flex justify-end">
										<button
											onClick={() => {
												setImproveModalOpen(false);
												setImprovementResult(null);
											}}
											className="btn-secondary">
											Close
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
