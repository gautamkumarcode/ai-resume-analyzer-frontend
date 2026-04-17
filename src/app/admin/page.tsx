"use client";

import { useAnalytics } from "@/hooks/useAdmin";
import { BarChart3, Briefcase, FileText, Users } from "lucide-react";

const STAT_CONFIGS = [
	{
		key: "totalUsers" as const,
		label: "Total Users",
		icon: Users,
		color: "bg-blue-500",
	},
	{
		key: "totalJobs" as const,
		label: "Total Jobs",
		icon: Briefcase,
		color: "bg-green-500",
	},
	{
		key: "totalApplications" as const,
		label: "Total Applications",
		icon: BarChart3,
		color: "bg-purple-500",
	},
	{
		key: "totalResumes" as const,
		label: "Total Resumes",
		icon: FileText,
		color: "bg-orange-500",
	},
];

export default function AdminOverviewPage() {
	const { data: analytics, isLoading } = useAnalytics();

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
				<p className="mt-1 text-gray-600">Real-time platform analytics</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{STAT_CONFIGS.map((stat) => {
					const Icon = stat.icon;
					return (
						<div key={stat.key} className="card">
							{isLoading ? (
								<div className="animate-pulse">
									<div className="flex items-center justify-between">
										<div className="space-y-2">
											<div className="h-3 bg-gray-200 rounded w-24" />
											<div className="h-8 bg-gray-200 rounded w-16" />
										</div>
										<div className="w-12 h-12 rounded-full bg-gray-200" />
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">{stat.label}</p>
										<p className="text-3xl font-bold text-gray-900 mt-1">
											{analytics?.[stat.key] ?? 0}
										</p>
									</div>
									<div
										className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}
										aria-hidden="true">
										<Icon className="w-6 h-6 text-white" />
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
