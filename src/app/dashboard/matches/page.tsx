"use client";

import RoleGuard from "@/components/RoleGuard";
import SkeletonCard from "@/components/SkeletonCard";
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
import { useMemo, useState } from "react";

type ScoreFilter = "all" | "strong" | "good" | "weak";

const SCORE_FILTERS: { value: ScoreFilter; label: string }[] = [
	{ value: "all", label: "All matches" },
	{ value: "strong", label: "Strong (≥80%)" },
	{ value: "good", label: "Good (60–79%)" },
	{ value: "weak", label: "Weak (<60%)" },
];

export default function MatchesPage() {
	return (
		<RoleGuard role="candidate">
			<MatchesContent />
		</RoleGuard>
	);
}

function MatchesContent() {
	const [selectedResume, setSelectedResume] = useState<string>("");
	const [selectedJob, setSelectedJob] = useState<string>("");
	const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
	const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");

	const { data: resumes } = useResumes();
	const { data: jobs } = useJobs();
	const { data: matches, isLoading } = useJobMatches();
	const matchMutation = useMatchResumeToJob();

	const filteredMatches = useMemo(() => {
		if (!matches) return [];
		return matches.filter((m: JobMatch) => {
			if (scoreFilter === "strong") return m.matchScore >= 80;
			if (scoreFilter === "good")
				return m.matchScore >= 60 && m.matchScore < 80;
			if (scoreFilter === "weak") return m.matchScore < 60;
			return true;
		});
	}, [matches, scoreFilter]);

	const handleMatch = async () => {
		if (!selectedResume || !selectedJob) return;
		await matchMutation.mutateAsync({
			resumeId: selectedResume,
			jobId: selectedJob,
		});
		setSelectedResume("");
		setSelectedJob("");
	};

	const toggleExpand = (matchId: string) => {
		setExpandedMatch(expandedMatch === matchId ? null : matchId);
	};

	const scoreColorClass = (score: number) => {
		if (score >= 80) return "bg-green-100 text-green-700";
		if (score >= 60) return "bg-yellow-100 text-yellow-700";
		return "bg-red-100 text-red-700";
	};

	const scoreBgClass = (score: number) => {
		if (score >= 80) return "bg-green-500";
		if (score >= 60) return "bg-yellow-500";
		return "bg-red-500";
	};

	const scoreLabel = (score: number) => {
		if (score >= 80) return "Strong Match";
		if (score >= 60) return "Good Match";
		return "Weak Match";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Job Matches</h1>
				<p className="mt-1 text-gray-600">
					Match your resumes against job descriptions using AI
				</p>
			</div>

			{/* Match form */}
			<div className="card">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Create New Match
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label
							htmlFor="select-resume"
							className="block text-sm font-medium text-gray-700 mb-1">
							Select Resume
						</label>
						<select
							id="select-resume"
							value={selectedResume}
							onChange={(e) => setSelectedResume(e.target.value)}
							className="input">
							<option value="">Choose a resume…</option>
							{resumes?.map((resume: Resume) => (
								<option key={resume._id} value={resume._id}>
									{resume.fileName}
								</option>
							))}
						</select>
					</div>

					<div>
						<label
							htmlFor="select-job"
							className="block text-sm font-medium text-gray-700 mb-1">
							Select Job
						</label>
						<select
							id="select-job"
							value={selectedJob}
							onChange={(e) => setSelectedJob(e.target.value)}
							className="input">
							<option value="">Choose a job…</option>
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
							className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
							aria-label="Analyze match between selected resume and job">
							{matchMutation.isPending ? (
								<Loader2
									className="w-5 h-5 mr-2 animate-spin"
									aria-hidden="true"
								/>
							) : (
								<TrendingUp className="w-5 h-5 mr-2" aria-hidden="true" />
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

			{/* Filter bar */}
			{!isLoading && matches && matches.length > 0 && (
				<div
					className="flex flex-wrap gap-2"
					role="group"
					aria-label="Filter matches by score">
					{SCORE_FILTERS.map((f) => (
						<button
							key={f.value}
							onClick={() => setScoreFilter(f.value)}
							className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
								scoreFilter === f.value
									? "bg-primary-600 text-white"
									: "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"
							}`}
							aria-pressed={scoreFilter === f.value}>
							{f.label}
						</button>
					))}
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

			{/* Matches list */}
			{!isLoading && filteredMatches.length > 0 && (
				<div className="space-y-4">
					{filteredMatches.map((match: JobMatch) => {
						const job = match.job as Job;
						const resume = match.resume as Resume;

						return (
							<article key={match._id} className="card">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4 min-w-0">
										{/* Score circle */}
										<div className="relative flex-shrink-0">
											<div
												className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"
												aria-label={`Match score: ${match.matchScore}%`}>
												<span className="text-xl font-bold text-gray-900">
													{match.matchScore}%
												</span>
											</div>
											<div
												className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${scoreBgClass(
													match.matchScore,
												)}`}
												aria-hidden="true">
												{match.matchScore >= 80 ? (
													<CheckCircle className="w-4 h-4 text-white" />
												) : (
													<AlertCircle className="w-4 h-4 text-white" />
												)}
											</div>
										</div>

										<div className="min-w-0">
											<h3 className="font-semibold text-gray-900 truncate">
												{job?.title ?? "Job"} at {job?.company ?? "Company"}
											</h3>
											<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
												<span className="flex items-center">
													<FileText
														className="w-4 h-4 mr-1 flex-shrink-0"
														aria-hidden="true"
													/>
													{resume?.fileName ?? "Resume"}
												</span>
												<span className="flex items-center">
													<Briefcase
														className="w-4 h-4 mr-1 flex-shrink-0"
														aria-hidden="true"
													/>
													Skills: {match.skillsMatch.percentage}%
												</span>
											</div>
										</div>
									</div>

									<div className="flex items-center space-x-3 flex-shrink-0 ml-4">
										<span
											className={`hidden sm:inline-flex px-3 py-1 rounded-full text-sm font-medium ${scoreColorClass(
												match.matchScore,
											)}`}>
											{scoreLabel(match.matchScore)}
										</span>
										<button
											onClick={() => toggleExpand(match._id)}
											className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
											aria-expanded={expandedMatch === match._id}
											aria-label={
												expandedMatch === match._id
													? "Collapse match details"
													: "Expand match details"
											}>
											{expandedMatch === match._id ? (
												<ChevronUp className="w-5 h-5" />
											) : (
												<ChevronDown className="w-5 h-5" />
											)}
										</button>
									</div>
								</div>

								{/* Expanded details */}
								{expandedMatch === match._id && (
									<div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
										{/* Skills match */}
										<div className="grid md:grid-cols-2 gap-6">
											<div>
												<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
													<CheckCircle
														className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
														aria-hidden="true"
													/>
													Matched Skills ({match.skillsMatch.matched.length})
												</h4>
												<div className="flex flex-wrap gap-2">
													{match.skillsMatch.matched.length > 0 ? (
														match.skillsMatch.matched.map((skill, i) => (
															<span
																key={i}
																className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
																{skill}
															</span>
														))
													) : (
														<span className="text-gray-500 text-sm">
															No matched skills
														</span>
													)}
												</div>
											</div>
											<div>
												<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
													<AlertCircle
														className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
														aria-hidden="true"
													/>
													Missing Skills ({match.skillsMatch.missing.length})
												</h4>
												<div className="flex flex-wrap gap-2">
													{match.skillsMatch.missing.length > 0 ? (
														match.skillsMatch.missing.map((skill, i) => (
															<span
																key={i}
																className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
																{skill}
															</span>
														))
													) : (
														<span className="text-gray-500 text-sm">
															No missing skills
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Experience match */}
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												Experience Match
											</h4>
											<div className="bg-gray-50 rounded-lg p-4">
												<div className="flex items-center mb-2">
													<div
														className="flex-1 bg-gray-200 rounded-full h-2"
														role="progressbar"
														aria-valuenow={match.experienceMatch.score}
														aria-valuemin={0}
														aria-valuemax={100}
														aria-label={`Experience match: ${match.experienceMatch.score}%`}>
														<div
															className={`h-2 rounded-full transition-all ${scoreBgClass(
																match.experienceMatch.score,
															)}`}
															style={{
																width: `${match.experienceMatch.score}%`,
															}}
														/>
													</div>
													<span className="ml-3 text-sm font-medium text-gray-700 flex-shrink-0">
														{match.experienceMatch.score}%
													</span>
												</div>
												<p className="text-gray-600 text-sm">
													{match.experienceMatch.feedback}
												</p>
											</div>
										</div>

										{/* Recommendations */}
										{match.recommendations.length > 0 && (
											<div>
												<h4 className="font-semibold text-gray-900 mb-2">
													Recommendations
												</h4>
												<ul className="space-y-2">
													{match.recommendations.map((rec, i) => (
														<li key={i} className="flex items-start space-x-2">
															<span
																className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"
																aria-hidden="true"
															/>
															<span className="text-gray-600 text-sm">
																{rec}
															</span>
														</li>
													))}
												</ul>
											</div>
										)}

										{/* AI analysis */}
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												AI Analysis
											</h4>
											<p className="text-gray-600 text-sm leading-relaxed">
												{match.aiAnalysis}
											</p>
										</div>
									</div>
								)}
							</article>
						);
					})}
				</div>
			)}

			{/* No results after filter */}
			{!isLoading &&
				matches &&
				matches.length > 0 &&
				filteredMatches.length === 0 && (
					<div className="card text-center py-10">
						<p className="text-gray-500">No matches in this score range.</p>
						<button
							onClick={() => setScoreFilter("all")}
							className="mt-3 text-primary-600 text-sm hover:underline">
							Show all matches
						</button>
					</div>
				)}

			{/* Empty state */}
			{!isLoading && (!matches || matches.length === 0) && (
				<div className="card text-center py-12">
					<BarChart3
						className="w-16 h-16 text-gray-300 mx-auto mb-4"
						aria-hidden="true"
					/>
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
