"use client";

import { useJobMatches, useJobs, useMatchResumeToJob } from "@/hooks/useJob";
import { useResumes } from "@/hooks/useResume";
import { Job, JobMatch, Resume } from "@/types";
import {
	AlertCircle,
	BarChart3,
	Briefcase,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	FileText,
	Loader2,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";

export default function MatchesPage() {
	const [selectedResume, setSelectedResume] = useState<string>("");
	const [selectedJob, setSelectedJob] = useState<string>("");
	const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

	const { data: resumes } = useResumes();
	const { data: jobs } = useJobs();
	const { data: matches, isLoading } = useJobMatches();
	const matchMutation = useMatchResumeToJob();

	const handleMatch = async () => {
		if (selectedResume && selectedJob) {
			await matchMutation.mutateAsync({
				resumeId: selectedResume,
				jobId: selectedJob,
			});
			setSelectedResume("");
			setSelectedJob("");
		}
	};

	const toggleExpand = (matchId: string) => {
		setExpandedMatch(expandedMatch === matchId ? null : matchId);
	};

	const getScoreColor = (score: number) => {
		if (score >= 80) return "bg-green-100 text-green-700";
		if (score >= 60) return "bg-yellow-100 text-yellow-700";
		return "bg-red-100 text-red-700";
	};

	const getScoreBgColor = (score: number) => {
		if (score >= 80) return "bg-green-500";
		if (score >= 60) return "bg-yellow-500";
		return "bg-red-500";
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
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Job Matches</h1>
				<p className="mt-1 text-gray-600">
					Match your resumes against job descriptions
				</p>
			</div>

			{/* Match Form */}
			<div className="card">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Create New Match
				</h2>
				<div className="grid md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Select Resume
						</label>
						<select
							value={selectedResume}
							onChange={(e) => setSelectedResume(e.target.value)}
							className="input">
							<option value="">Choose a resume...</option>
							{resumes?.map((resume: Resume) => (
								<option key={resume._id} value={resume._id}>
									{resume.fileName}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Select Job
						</label>
						<select
							value={selectedJob}
							onChange={(e) => setSelectedJob(e.target.value)}
							className="input">
							<option value="">Choose a job...</option>
							{jobs?.map((job: Job) => (
								<option key={job._id} value={job._id}>
									{job.title} at {job.company}
								</option>
							))}
						</select>
					</div>

					<div className="flex items-end">
						<button
							onClick={handleMatch}
							disabled={
								!selectedResume || !selectedJob || matchMutation.isPending
							}
							className="btn-primary w-full flex items-center justify-center">
							{matchMutation.isPending ? (
								<Loader2 className="w-5 h-5 mr-2 animate-spin" />
							) : (
								<TrendingUp className="w-5 h-5 mr-2" />
							)}
							Analyze Match
						</button>
					</div>
				</div>

				{(!resumes?.length || !jobs?.length) && (
					<p className="mt-4 text-sm text-gray-500">
						{!resumes?.length && !jobs?.length
							? "Upload a resume and add a job to create matches."
							: !resumes?.length
								? "Upload a resume to create matches."
								: "Add a job to create matches."}
					</p>
				)}
			</div>

			{/* Matches List */}
			{matches && matches.length > 0 ? (
				<div className="space-y-4">
					{matches.map((match: JobMatch) => {
						const job = match.job as Job;
						const resume = match.resume as Resume;

						return (
							<div key={match._id} className="card">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<div className="relative">
											<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
												<span className="text-2xl font-bold text-gray-900">
													{match.matchScore}%
												</span>
											</div>
											<div
												className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${getScoreBgColor(
													match.matchScore,
												)}`}>
												{match.matchScore >= 80 ? (
													<CheckCircle className="w-4 h-4 text-white" />
												) : (
													<AlertCircle className="w-4 h-4 text-white" />
												)}
											</div>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												{job?.title || "Job"} at {job?.company || "Company"}
											</h3>
											<div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
												<span className="flex items-center">
													<FileText className="w-4 h-4 mr-1" />
													{resume?.fileName || "Resume"}
												</span>
												<span className="flex items-center">
													<Briefcase className="w-4 h-4 mr-1" />
													Skills: {match.skillsMatch.percentage}%
												</span>
											</div>
										</div>
									</div>

									<div className="flex items-center space-x-3">
										<span
											className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.matchScore)}`}>
											{match.matchScore >= 80
												? "Strong Match"
												: match.matchScore >= 60
													? "Good Match"
													: "Weak Match"}
										</span>
										<button
											onClick={() => toggleExpand(match._id)}
											className="p-2 text-gray-400 hover:text-gray-600">
											{expandedMatch === match._id ? (
												<ChevronUp className="w-5 h-5" />
											) : (
												<ChevronDown className="w-5 h-5" />
											)}
										</button>
									</div>
								</div>

								{/* Expanded Content */}
								{expandedMatch === match._id && (
									<div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
										{/* Skills Match */}
										<div className="grid md:grid-cols-2 gap-6">
											<div>
												<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
													<CheckCircle className="w-5 h-5 text-green-500 mr-2" />
													Matched Skills ({match.skillsMatch.matched.length})
												</h4>
												<div className="flex flex-wrap gap-2">
													{match.skillsMatch.matched.map((skill, i) => (
														<span
															key={i}
															className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
															{skill}
														</span>
													))}
													{match.skillsMatch.matched.length === 0 && (
														<span className="text-gray-500 text-sm">
															No matched skills
														</span>
													)}
												</div>
											</div>
											<div>
												<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
													<AlertCircle className="w-5 h-5 text-red-500 mr-2" />
													Missing Skills ({match.skillsMatch.missing.length})
												</h4>
												<div className="flex flex-wrap gap-2">
													{match.skillsMatch.missing.map((skill, i) => (
														<span
															key={i}
															className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
															{skill}
														</span>
													))}
													{match.skillsMatch.missing.length === 0 && (
														<span className="text-gray-500 text-sm">
															No missing skills
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Experience Match */}
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												Experience Feedback
											</h4>
											<div className="bg-gray-50 rounded-lg p-4">
												<div className="flex items-center mb-2">
													<div className="flex-1 bg-gray-200 rounded-full h-2">
														<div
															className={`h-2 rounded-full ${getScoreBgColor(match.experienceMatch.score)}`}
															style={{
																width: `${match.experienceMatch.score}%`,
															}}
														/>
													</div>
													<span className="ml-3 text-sm font-medium text-gray-700">
														{match.experienceMatch.score}%
													</span>
												</div>
												<p className="text-gray-600 text-sm">
													{match.experienceMatch.feedback}
												</p>
											</div>
										</div>

										{/* Recommendations */}
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												Recommendations
											</h4>
											<ul className="space-y-2">
												{match.recommendations.map((rec, i) => (
													<li key={i} className="flex items-start space-x-2">
														<span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
														<span className="text-gray-600">{rec}</span>
													</li>
												))}
											</ul>
										</div>

										{/* AI Analysis */}
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												AI Analysis
											</h4>
											<p className="text-gray-600">{match.aiAnalysis}</p>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<div className="card text-center py-12">
					<BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No matches yet
					</h3>
					<p className="text-gray-500">
						Select a resume and job above to analyze the match
					</p>
				</div>
			)}
		</div>
	);
}
