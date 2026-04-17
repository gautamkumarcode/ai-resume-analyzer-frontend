"use client";

import SkeletonCard from "@/components/SkeletonCard";
import { useAdminJobs, useDeleteAdminJob } from "@/hooks/useAdmin";
import { Job } from "@/types";
import { Briefcase, Building, MapPin, Trash2 } from "lucide-react";

export default function AdminJobsPage() {
	const { data, isLoading } = useAdminJobs();
	const deleteMutation = useDeleteAdminJob();

	const jobs: Job[] = data?.jobs ?? [];

	const handleDelete = (job: Job) => {
		if (
			!confirm(
				`Delete "${job.title}" at ${job.company}? This will also remove all applications for this job.`,
			)
		)
			return;
		deleteMutation.mutate(job._id);
	};

	const TYPE_COLORS: Record<string, string> = {
		"full-time": "bg-green-100 text-green-700",
		"part-time": "bg-blue-100 text-blue-700",
		contract: "bg-orange-100 text-orange-700",
		internship: "bg-yellow-100 text-yellow-700",
		remote: "bg-purple-100 text-purple-700",
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
				<p className="mt-1 text-gray-600">
					Manage all platform job listings · {data?.pagination?.total ?? 0}{" "}
					total
				</p>
			</div>

			{isLoading && (
				<div className="space-y-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<SkeletonCard key={i} lines={2} />
					))}
				</div>
			)}

			{!isLoading && jobs.length > 0 && (
				<div className="card p-0 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="text-left px-6 py-3 font-medium text-gray-600">
										Job
									</th>
									<th className="text-left px-6 py-3 font-medium text-gray-600">
										Type
									</th>
									<th className="text-left px-6 py-3 font-medium text-gray-600">
										Recruiter
									</th>
									<th className="text-left px-6 py-3 font-medium text-gray-600">
										Posted
									</th>
									<th className="text-right px-6 py-3 font-medium text-gray-600">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{jobs.map((job: any) => (
									<tr key={job._id} className="hover:bg-gray-50">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
													<Briefcase
														className="w-4 h-4 text-green-600"
														aria-hidden="true"
													/>
												</div>
												<div className="min-w-0">
													<p className="font-medium text-gray-900 truncate">
														{job.title}
													</p>
													<div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
														<span className="flex items-center gap-1">
															<Building
																className="w-3 h-3"
																aria-hidden="true"
															/>
															{job.company}
														</span>
														{job.location && (
															<span className="flex items-center gap-1">
																<MapPin
																	className="w-3 h-3"
																	aria-hidden="true"
																/>
																{job.location}
															</span>
														)}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`px-2 py-1 rounded text-xs font-medium capitalize ${TYPE_COLORS[job.type] ?? "bg-gray-100 text-gray-600"}`}>
												{job.type}
											</span>
										</td>
										<td className="px-6 py-4 text-gray-500">
											{job.user
												? `${job.user.firstName} ${job.user.lastName}`
												: "—"}
										</td>
										<td className="px-6 py-4 text-gray-500">
											{new Date(job.createdAt).toLocaleDateString(undefined, {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</td>
										<td className="px-6 py-4">
											<div className="flex justify-end">
												<button
													onClick={() => handleDelete(job)}
													disabled={deleteMutation.isPending}
													className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
													aria-label={`Delete job: ${job.title}`}>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{!isLoading && jobs.length === 0 && (
				<div className="card text-center py-12">
					<Briefcase
						className="w-16 h-16 text-gray-300 mx-auto mb-4"
						aria-hidden="true"
					/>
					<p className="text-gray-500">No jobs found.</p>
				</div>
			)}
		</div>
	);
}
