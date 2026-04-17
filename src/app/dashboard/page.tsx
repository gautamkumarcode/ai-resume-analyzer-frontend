"use client";

import SkeletonCard from "@/components/SkeletonCard";
import { useJobMatches, useJobs, useRecommendedJobs } from "@/hooks/useJob";
import { useResumes } from "@/hooks/useResume";
import { useAuth } from "@/lib/auth-context";
import { BarChart3, Briefcase, FileText, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

// ── Candidate dashboard ────────────────────────────────────────────────────
function CandidateDashboard() {
	const { data: resumes, isLoading: resumesLoading } = useResumes();
	const { data: jobs, isLoading: jobsLoading } = useJobs();
	const { data: matches, isLoading: matchesLoading } = useJobMatches();
	const {
		data: recommendedJobs,
		isLoading: recommendedLoading,
		isError: recommendedError,
		error: recommendedErrorData,
	} = useRecommendedJobs();

	const stats = [
		{
			name: "My Resumes",
			value: resumes?.length ?? 0,
			icon: FileText,
			href: "/dashboard/resumes",
			color: "bg-blue-500",
		},
		{
			name: "Jobs Available",
			value: jobs?.length ?? 0,
			icon: Briefcase,
			href: "/dashboard/jobs",
			color: "bg-green-500",
		},
		{
			name: "My Matches",
			value: matches?.length ?? 0,
			icon: BarChart3,
			href: "/dashboard/matches",
			color: "bg-purple-500",
		},
	];

	const topMatches = matches?.slice(0, 5) ?? [];

	return (
		<div className="space-y-8">
			{/* Stats */}
			{resumesLoading || jobsLoading || matchesLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<div key={i} className="card animate-pulse">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<div className="h-3 bg-gray-200 rounded w-20" />
									<div className="h-8 bg-gray-200 rounded w-12" />
								</div>
								<div className="w-12 h-12 rounded-full bg-gray-200" />
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{stats.map((stat) => (
						<Link
							key={stat.name}
							href={stat.href}
							className="card hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">{stat.name}</p>
									<p className="text-3xl font-bold text-gray-900 mt-1">
										{stat.value}
									</p>
								</div>
								<div
									className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}
									aria-hidden="true">
									<stat.icon className="w-6 h-6 text-white" />
								</div>
							</div>
						</Link>
					))}
				</div>
			)}

			{/* Quick actions */}
			<div className="card">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link
						href="/dashboard/resumes"
						className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
						<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
							<Plus className="w-5 h-5 text-blue-600" aria-hidden="true" />
						</div>
						<span className="font-medium text-gray-900">Upload Resume</span>
					</Link>
					<Link
						href="/dashboard/jobs"
						className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
						<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
							<Briefcase
								className="w-5 h-5 text-green-600"
								aria-hidden="true"
							/>
						</div>
						<span className="font-medium text-gray-900">Browse Jobs</span>
					</Link>
					<Link
						href="/dashboard/matches"
						className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
						<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
							<TrendingUp
								className="w-5 h-5 text-purple-600"
								aria-hidden="true"
							/>
						</div>
						<span className="font-medium text-gray-900">
							Match Resume to Job
						</span>
					</Link>
				</div>
			</div>

			{/* Recent matches */}
			<div className="card">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-gray-900">
						Recent Matches
					</h2>
					<Link
						href="/dashboard/matches"
						className="text-primary-600 hover:underline text-sm">
						View all
					</Link>
				</div>
				{matchesLoading ? (
					<div className="space-y-3">
						{[1, 2].map((i) => (
							<SkeletonCard key={i} lines={1} />
						))}
					</div>
				) : topMatches.length > 0 ? (
					<div className="space-y-3">
						{topMatches.map((match: any) => (
							<div
								key={match._id}
								className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div className="min-w-0">
									<p className="font-medium text-gray-900 truncate">
										{typeof match.job === "object" ? match.job.title : "Job"} at{" "}
										{typeof match.job === "object"
											? match.job.company
											: "Company"}
									</p>
									<p className="text-sm text-gray-500 truncate">
										{typeof match.resume === "object"
											? match.resume.fileName
											: "Resume"}
									</p>
								</div>
								<span
									className={`ml-4 flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
										match.matchScore >= 80
											? "bg-green-100 text-green-700"
											: match.matchScore >= 60
												? "bg-yellow-100 text-yellow-700"
												: "bg-red-100 text-red-700"
									}`}>
									{match.matchScore}%
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500 text-center py-8">
						No matches yet. Upload a resume and browse jobs to get started!
					</p>
				)}
			</div>

			{/* Recommended Jobs */}
			{!recommendedError && (
				<div className="card">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold text-gray-900">
							Recommended Jobs
						</h2>
					</div>
					{recommendedLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<SkeletonCard key={i} lines={2} />
							))}
						</div>
					) : (recommendedErrorData as any)?.response?.status === 400 ? (
						<div className="text-center py-8">
							<p className="text-gray-600 mb-4">
								Upload a resume to get personalized job recommendations
							</p>
							<Link
								href="/dashboard/resumes"
								className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
								<Plus className="w-4 h-4 mr-2" aria-hidden="true" />
								Upload Resume
							</Link>
						</div>
					) : recommendedJobs && recommendedJobs.length > 0 ? (
						<div className="space-y-3">
							{recommendedJobs.slice(0, 5).map((job) => (
								<div
									key={job._id}
									className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
									<div className="min-w-0 flex-1">
										<p className="font-medium text-gray-900 truncate">
											{job.title}
										</p>
										<p className="text-sm text-gray-500 truncate">
											{job.company}
											{job.location ? ` · ${job.location}` : ""}
										</p>
									</div>
									<span className="ml-4 flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
										{job.matchScore}% match
									</span>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500 text-center py-8">
							No recommendations available at this time.
						</p>
					)}
				</div>
			)}
		</div>
	);
}

// ── Recruiter dashboard ────────────────────────────────────────────────────
function RecruiterDashboard() {
	const { data: jobs, isLoading: jobsLoading } = useJobs();

	const activeJobs = jobs?.length ?? 0;

	return (
		<div className="space-y-8">
			{/* Stats */}
			{jobsLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[1, 2].map((i) => (
						<div key={i} className="card animate-pulse">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<div className="h-3 bg-gray-200 rounded w-20" />
									<div className="h-8 bg-gray-200 rounded w-12" />
								</div>
								<div className="w-12 h-12 rounded-full bg-gray-200" />
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Link
						href="/dashboard/jobs"
						className="card hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Active Job Listings</p>
								<p className="text-3xl font-bold text-gray-900 mt-1">
									{activeJobs}
								</p>
							</div>
							<div
								className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center"
								aria-hidden="true">
								<Briefcase className="w-6 h-6 text-white" />
							</div>
						</div>
					</Link>
					<div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-primary-700 font-medium">
									Platform Reach
								</p>
								<p className="text-sm text-primary-600 mt-1">
									Your jobs are visible to all candidates
								</p>
							</div>
							<div
								className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center"
								aria-hidden="true">
								<TrendingUp className="w-6 h-6 text-white" />
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Quick actions */}
			<div className="card">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Link
						href="/dashboard/jobs"
						className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
						<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
							<Plus className="w-5 h-5 text-green-600" aria-hidden="true" />
						</div>
						<span className="font-medium text-gray-900">Post a New Job</span>
					</Link>
					<Link
						href="/dashboard/jobs"
						className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
						<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
							<Briefcase className="w-5 h-5 text-blue-600" aria-hidden="true" />
						</div>
						<span className="font-medium text-gray-900">Manage Listings</span>
					</Link>
				</div>
			</div>

			{/* Recent jobs */}
			<div className="card">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-gray-900">
						Recent Job Listings
					</h2>
					<Link
						href="/dashboard/jobs"
						className="text-primary-600 hover:underline text-sm">
						View all
					</Link>
				</div>
				{jobsLoading ? (
					<div className="space-y-3">
						{[1, 2].map((i) => (
							<SkeletonCard key={i} lines={2} />
						))}
					</div>
				) : jobs && jobs.length > 0 ? (
					<div className="space-y-3">
						{jobs.slice(0, 5).map((job: any) => (
							<div
								key={job._id}
								className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div className="min-w-0">
									<p className="font-medium text-gray-900 truncate">
										{job.title}
									</p>
									<p className="text-sm text-gray-500 truncate">
										{job.company}
										{job.location ? ` · ${job.location}` : ""}
									</p>
								</div>
								<span className="ml-4 flex-shrink-0 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">
									{job.type}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500 text-center py-8">
						No jobs posted yet. Create your first listing!
					</p>
				)}
			</div>
		</div>
	);
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
	const { user, isRecruiter } = useAuth();

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">
					Welcome back, {user?.firstName}!
				</h1>
				<p className="mt-2 text-gray-600">
					{isRecruiter
						? "Manage your job listings and reach top candidates."
						: "Track your resume analysis and job matching activity."}
				</p>
			</div>

			{isRecruiter ? <RecruiterDashboard /> : <CandidateDashboard />}
		</div>
	);
}
