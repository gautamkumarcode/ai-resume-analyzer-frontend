"use client";

import { useJobMatches, useJobs } from "@/hooks/useJob";
import { useResumes } from "@/hooks/useResume";
import { useAuth } from "@/lib/auth-context";
import { BarChart3, Briefcase, FileText, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
	const { user } = useAuth();
	const { data: resumes } = useResumes();
	const { data: jobs } = useJobs();
	const { data: matches } = useJobMatches();

	const stats = [
		{
			name: "Resumes",
			value: resumes?.length || 0,
			icon: FileText,
			href: "/dashboard/resumes",
			color: "bg-blue-500",
		},
		{
			name: "Jobs",
			value: jobs?.length || 0,
			icon: Briefcase,
			href: "/dashboard/jobs",
			color: "bg-green-500",
		},
		{
			name: "Matches",
			value: matches?.length || 0,
			icon: BarChart3,
			href: "/dashboard/matches",
			color: "bg-purple-500",
		},
	];

	const topMatches = matches?.slice(0, 5) || [];

	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">
					Welcome back, {user?.firstName}!
				</h1>
				<p className="mt-2 text-gray-600">
					Here&apos;s an overview of your resume analysis and job matching
					activity.
				</p>
			</div>

			{/* Stats */}
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
								className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
								<stat.icon className="w-6 h-6 text-white" />
							</div>
						</div>
					</Link>
				))}
			</div>

			{/* Quick Actions */}
			<div className="card">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link
						href="/dashboard/resumes"
						className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
						<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
							<Plus className="w-5 h-5 text-blue-600" />
						</div>
						<span className="font-medium text-gray-900">Upload Resume</span>
					</Link>

					<Link
						href="/dashboard/jobs"
						className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
						<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
							<Plus className="w-5 h-5 text-green-600" />
						</div>
						<span className="font-medium text-gray-900">Add Job</span>
					</Link>

					<Link
						href="/dashboard/matches"
						className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
						<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
							<TrendingUp className="w-5 h-5 text-purple-600" />
						</div>
						<span className="font-medium text-gray-900">
							Match Resume to Job
						</span>
					</Link>
				</div>
			</div>

			{/* Recent Matches */}
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

				{topMatches.length > 0 ? (
					<div className="space-y-4">
						{topMatches.map((match: any) => (
							<div
								key={match._id}
								className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
								<div>
									<p className="font-medium text-gray-900">
										{typeof match.job === "object" ? match.job.title : "Job"} at{" "}
										{typeof match.job === "object"
											? match.job.company
											: "Company"}
									</p>
									<p className="text-sm text-gray-500">
										Resume:{" "}
										{typeof match.resume === "object"
											? match.resume.fileName
											: "Resume"}
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<div
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											match.matchScore >= 80
												? "bg-green-100 text-green-700"
												: match.matchScore >= 60
													? "bg-yellow-100 text-yellow-700"
													: "bg-red-100 text-red-700"
										}`}>
										{match.matchScore}% Match
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500 text-center py-8">
						No matches yet. Upload a resume and add a job to get started!
					</p>
				)}
			</div>
		</div>
	);
}
