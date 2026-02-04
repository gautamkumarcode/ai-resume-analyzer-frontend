"use client";

import {
	useAnalyzeResume,
	useDeleteResume,
	useResumes,
	useUploadResume,
} from "@/hooks/useResume";
import { Resume } from "@/types";
import {
	ChevronDown,
	ChevronUp,
	FileText,
	Loader2,
	Sparkles,
	Trash2,
	Upload,
} from "lucide-react";
import { useRef, useState } from "react";

export default function ResumesPage() {
	const [expandedResume, setExpandedResume] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: resumes, isLoading } = useResumes();
	const uploadMutation = useUploadResume();
	const analyzeMutation = useAnalyzeResume();
	const deleteMutation = useDeleteResume();

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			await uploadMutation.mutateAsync(file);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleAnalyze = async (resumeId: string) => {
		await analyzeMutation.mutateAsync(resumeId);
	};

	const handleDelete = async (resumeId: string) => {
		if (confirm("Are you sure you want to delete this resume?")) {
			await deleteMutation.mutateAsync(resumeId);
		}
	};

	const toggleExpand = (resumeId: string) => {
		setExpandedResume(expandedResume === resumeId ? null : resumeId);
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
					<h1 className="text-3xl font-bold text-gray-900">Resumes</h1>
					<p className="mt-1 text-gray-600">Upload and analyze your resumes</p>
				</div>

				<div>
					<input
						ref={fileInputRef}
						type="file"
						accept=".pdf,.docx"
						onChange={handleFileUpload}
						className="hidden"
						id="resume-upload"
					/>
					<label
						htmlFor="resume-upload"
						className="btn-primary inline-flex items-center cursor-pointer">
						{uploadMutation.isPending ? (
							<Loader2 className="w-5 h-5 mr-2 animate-spin" />
						) : (
							<Upload className="w-5 h-5 mr-2" />
						)}
						Upload Resume
					</label>
				</div>
			</div>

			{/* Resumes List */}
			{resumes && resumes.length > 0 ? (
				<div className="space-y-4">
					{resumes.map((resume: Resume) => (
						<div key={resume._id} className="card">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
										<FileText className="w-6 h-6 text-primary-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											{resume.fileName}
										</h3>
										<p className="text-sm text-gray-500">
											Uploaded on{" "}
											{new Date(resume.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>

								<div className="flex items-center space-x-3">
									{resume.aiAnalysis ? (
										<div className="flex items-center space-x-2">
											<div
												className={`px-3 py-1 rounded-full text-sm font-medium ${
													resume.aiAnalysis.overallScore >= 80
														? "bg-green-100 text-green-700"
														: resume.aiAnalysis.overallScore >= 60
															? "bg-yellow-100 text-yellow-700"
															: "bg-red-100 text-red-700"
												}`}>
												Score: {resume.aiAnalysis.overallScore}
											</div>
										</div>
									) : (
										<button
											onClick={() => handleAnalyze(resume._id)}
											disabled={analyzeMutation.isPending}
											className="btn-secondary flex items-center">
											{analyzeMutation.isPending ? (
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											) : (
												<Sparkles className="w-4 h-4 mr-2" />
											)}
											Analyze
										</button>
									)}

									<button
										onClick={() => toggleExpand(resume._id)}
										className="p-2 text-gray-400 hover:text-gray-600">
										{expandedResume === resume._id ? (
											<ChevronUp className="w-5 h-5" />
										) : (
											<ChevronDown className="w-5 h-5" />
										)}
									</button>

									<button
										onClick={() => handleDelete(resume._id)}
										className="p-2 text-red-400 hover:text-red-600">
										<Trash2 className="w-5 h-5" />
									</button>
								</div>
							</div>

							{/* Expanded Content */}
							{expandedResume === resume._id && resume.aiAnalysis && (
								<div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
									{/* Summary */}
									<div>
										<h4 className="font-semibold text-gray-900 mb-2">
											AI Summary
										</h4>
										<p className="text-gray-600">{resume.aiAnalysis.summary}</p>
									</div>

									{/* Strengths & Improvements */}
									<div className="grid md:grid-cols-2 gap-6">
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												Strengths
											</h4>
											<ul className="space-y-2">
												{resume.aiAnalysis.strengths.map((strength, i) => (
													<li key={i} className="flex items-start space-x-2">
														<span className="w-2 h-2 rounded-full bg-green-500 mt-2" />
														<span className="text-gray-600">{strength}</span>
													</li>
												))}
											</ul>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												Improvements
											</h4>
											<ul className="space-y-2">
												{resume.aiAnalysis.improvements.map(
													(improvement, i) => (
														<li key={i} className="flex items-start space-x-2">
															<span className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
															<span className="text-gray-600">
																{improvement}
															</span>
														</li>
													),
												)}
											</ul>
										</div>
									</div>

									{/* Keywords */}
									<div>
										<h4 className="font-semibold text-gray-900 mb-2">
											Keywords
										</h4>
										<div className="flex flex-wrap gap-2">
											{resume.aiAnalysis.keywords.map((keyword, i) => (
												<span
													key={i}
													className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
													{keyword}
												</span>
											))}
										</div>
									</div>

									{/* Skills */}
									{resume.parsedData.skills.length > 0 && (
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												Skills
											</h4>
											<div className="flex flex-wrap gap-2">
												{resume.parsedData.skills.map((skill, i) => (
													<span
														key={i}
														className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
														{skill.name}
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="card text-center py-12">
					<FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No resumes yet
					</h3>
					<p className="text-gray-500 mb-4">
						Upload your first resume to get AI-powered analysis
					</p>
					<label
						htmlFor="resume-upload"
						className="btn-primary inline-flex items-center cursor-pointer">
						<Upload className="w-5 h-5 mr-2" />
						Upload Resume
					</label>
				</div>
			)}
		</div>
	);
}
