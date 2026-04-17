"use client";

import RoleGuard from "@/components/RoleGuard";
import SkeletonCard from "@/components/SkeletonCard";
import {
    useMyApplications,
    useWithdrawApplication,
} from "@/hooks/useApplication";
import { Application, Job } from "@/types";
import { Briefcase, Building, FileText, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ApplicationsPage() {
	return (
		<RoleGuard role="candidate">
			<ApplicationsContent />
		</RoleGuard>
	);
}

function ApplicationsContent() {
	const { data: applications, isLoading } = useMyApplications();
	const withdrawMutation = useWithdrawApplication();

	const handleWithdraw = async (applicationId: string) => {
		if (!confirm("Are you sure you want to withdraw this application?")) return;
		await withdrawMutation.mutateAsync(applicationId);
	};

	const statusBadgeClass = (status: string) => {
		if (status === "shortlisted") return "bg-green-100 text-green-700";
		if (status === "rejected") return "bg-red-100 text-red-700";
		return "bg-gray-100 text-gray-700";
	};

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
				<p className="mt-1 text-gray-600">
					Track the status of your job applications
				</p>
			</div>

			{/* Skeleton loaders */}
			{isLoading && (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<SkeletonCard key={i} lines={2} />
					))}
				</div>
			)}

			{/* Applications list */}
			{!isLoading && applications && applications.length > 0 && (
				<div className="space-y-4">
					{applications.map((application: Application) => {
						const job = application.jobId as Job;
						return (
							<article key={application._id} className="card">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4 min-w-0">
										<div
											className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0"
											aria-hidden="true">
											<Briefcase className="w-6 h-6 text-primary-600" />
										</div>
										<div className="min-w-0">
											<h3 className="font-semibold text-gray-900 truncate">
												{typeof job === "object" ? job.title : "Unknown Job"}
											</h3>
											<div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
												{typeof job === "object" && job.company && (
													<span className="flex items-center gap-1">
														<Building
															className="w-3.5 h-3.5"
															aria-hidden="true"
														/>
														{job.company}
													</span>
												)}
												{typeof job === "object" && job.location && (
													<span className="flex items-center gap-1">
														<MapPin
															className="w-3.5 h-3.5"
															aria-hidden="true"
														/>
														{job.location}
													</span>
												)}
												<span className="flex items-center gap-1">
													<FileText
														className="w-3.5 h-3.5"
														aria-hidden="true"
													/>
													Applied {formatDate(application.appliedAt)}
												</span>
											</div>
										</div>
									</div>

									<div className="flex items-center space-x-3 flex-shrink-0 ml-4">
										<span
											className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusBadgeClass(application.status)}`}
											aria-label={`Status: ${application.status}`}>
											{application.status}
										</span>
										<button
											onClick={() => handleWithdraw(application._id)}
											disabled={withdrawMutation.isPending}
											className="p-2 text-red-400 hover:text-red-600 transition-colors"
											aria-label="Withdraw application">
											<Trash2 className="w-5 h-5" />
										</button>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}

			{/* Empty state */}
			{!isLoading && (!applications || applications.length === 0) && (
				<div className="card text-center py-12">
					<Briefcase
						className="w-16 h-16 text-gray-300 mx-auto mb-4"
						aria-hidden="true"
					/>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No applications yet
					</h3>
					<p className="text-gray-500 mb-4">
						Browse available jobs and start applying
					</p>
					<Link
						href="/dashboard/jobs"
						className="btn-primary inline-flex items-center">
						<Briefcase className="w-5 h-5 mr-2" aria-hidden="true" />
						Browse Jobs
					</Link>
				</div>
			)}
		</div>
	);
}
