"use client";

import RoleGuard from "@/components/RoleGuard";
import { useJobs } from "@/hooks/useJob";
import { interviewService } from "@/services/interview.service";
import { Interview } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, ChevronDown, ChevronUp, User } from "lucide-react";
import { useState } from "react";

export default function InterviewsPage() {
	return (
		<RoleGuard role="recruiter">
			<RecruiterInterviewsContent />
		</RoleGuard>
	);
}

function RecruiterInterviewsContent() {
	const { data: jobs } = useJobs();
	const [selectedJobId, setSelectedJobId] = useState("");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const { data: interviews, isLoading } = useQuery({
		queryKey: ["interviews", "job", selectedJobId],
		queryFn: () => interviewService.getJobInterviews(selectedJobId),
		enabled: !!selectedJobId,
	});

	const fitColors = {
		excellent: "bg-green-100 text-green-700",
		good: "bg-blue-100 text-blue-700",
		average: "bg-yellow-100 text-yellow-700",
		poor: "bg-red-100 text-red-700",
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">
					Candidate Interviews
				</h1>
				<p className="mt-1 text-gray-600">
					Review AI-evaluated interview results ranked by fit score.
				</p>
			</div>

			<div className="card">
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Select Job
				</label>
				<select
					value={selectedJobId}
					onChange={(e) => setSelectedJobId(e.target.value)}
					className="input max-w-md">
					<option value="">Choose a job listing...</option>
					{jobs?.map((job: any) => (
						<option key={job._id} value={job._id}>
							{job.title} — {job.company}
						</option>
					))}
				</select>
			</div>

			{isLoading && (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="card animate-pulse h-20" />
					))}
				</div>
			)}

			{interviews && interviews.length === 0 && (
				<div className="card text-center py-12">
					<BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
					<p className="text-gray-500">
						No completed interviews for this job yet.
					</p>
				</div>
			)}

			{interviews && interviews.length > 0 && (
				<div className="space-y-3">
					{interviews.map((interview: Interview, rank: number) => {
						const candidate = interview.candidate as any;
						const isExpanded = expandedId === interview._id;

						return (
							<div key={interview._id} className="card">
								<div
									className="flex items-center justify-between cursor-pointer"
									onClick={() =>
										setExpandedId(isExpanded ? null : interview._id)
									}>
									<div className="flex items-center gap-4">
										{/* Rank badge */}
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
												rank === 0
													? "bg-yellow-100 text-yellow-700"
													: rank === 1
														? "bg-gray-100 text-gray-600"
														: rank === 2
															? "bg-orange-100 text-orange-700"
															: "bg-gray-50 text-gray-500"
											}`}>
											#{rank + 1}
										</div>

										{/* Candidate info */}
										<div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
											<User className="w-5 h-5 text-primary-600" />
										</div>
										<div>
											<p className="font-semibold text-gray-900">
												{candidate?.firstName} {candidate?.lastName}
											</p>
											<p className="text-sm text-gray-500">
												{candidate?.email}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-4">
										<div className="text-right">
											<p className="text-2xl font-bold text-primary-600">
												{interview.overallScore}
											</p>
											<p className="text-xs text-gray-400">/ 100</p>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${fitColors[interview.fitLevel]}`}>
											{interview.fitLevel} fit
										</span>
										{isExpanded ? (
											<ChevronUp className="w-5 h-5 text-gray-400" />
										) : (
											<ChevronDown className="w-5 h-5 text-gray-400" />
										)}
									</div>
								</div>

								{isExpanded && (
									<div className="mt-6 pt-6 border-t border-gray-200 space-y-5">
										<p className="text-gray-600 text-sm">{interview.summary}</p>

										<div className="grid md:grid-cols-2 gap-4">
											<div>
												<h4 className="text-sm font-semibold text-gray-900 mb-2">
													Strengths
												</h4>
												<ul className="space-y-1">
													{interview.strengths.map((s, i) => (
														<li
															key={i}
															className="flex items-start gap-2 text-sm text-gray-600">
															<span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
															{s}
														</li>
													))}
												</ul>
											</div>
											<div>
												<h4 className="text-sm font-semibold text-gray-900 mb-2">
													Concerns
												</h4>
												<ul className="space-y-1">
													{interview.concerns.map((c, i) => (
														<li
															key={i}
															className="flex items-start gap-2 text-sm text-gray-600">
															<span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
															{c}
														</li>
													))}
												</ul>
											</div>
										</div>

										<div className="space-y-3">
											<h4 className="text-sm font-semibold text-gray-900">
												Q&A Breakdown
											</h4>
											{interview.answers.map((a, i) => (
												<div key={i} className="bg-gray-50 rounded-lg p-3">
													<div className="flex justify-between items-start mb-1">
														<p className="text-sm font-medium text-gray-800 flex-1 pr-4">
															{a.question}
														</p>
														<span
															className={`text-sm font-bold flex-shrink-0 ${a.score >= 7 ? "text-green-600" : a.score >= 5 ? "text-yellow-600" : "text-red-600"}`}>
															{a.score}/10
														</span>
													</div>
													<p className="text-xs text-gray-500 italic mb-1">
														&ldquo;{a.answer || "No answer"}&rdquo;
													</p>
													<p className="text-xs text-gray-600">{a.feedback}</p>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
