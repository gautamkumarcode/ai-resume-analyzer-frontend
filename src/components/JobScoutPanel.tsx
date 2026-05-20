"use client";

import SkeletonCard from "@/components/SkeletonCard";
import { useApplyToJob } from "@/hooks/useApplication";
import { useRecommendedJobs } from "@/hooks/useJob";
import { useResumes } from "@/hooks/useResume";
import { RecommendedJob } from "@/types";
import {
	ArrowRight,
	BadgeCheck,
	Briefcase,
	Clock3,
	Loader2,
	RefreshCw,
	Search,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const AUTO_SCAN_INTERVALS = [5, 15, 30] as const;

export default function JobScoutPanel() {
	const { data: resumes } = useResumes({ enabled: true });
	// recommendedJobs hook is initialized after auto-scout state so polling interval can be applied
	const applyMutation = useApplyToJob();
	const [search, setSearch] = useState("");
	const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
	const [autoScoutEnabled, setAutoScoutEnabled] = useState(false);
	const [autoScoutMinutes, setAutoScoutMinutes] =
		useState<(typeof AUTO_SCAN_INTERVALS)[number]>(15);
	const [lastScoutAt, setLastScoutAt] = useState<Date | null>(null);

	const {
		data: recommendedJobs,
		isLoading,
		isError,
		error,
		refetch,
	} = useRecommendedJobs({
		enabled: true,
		refetchInterval: autoScoutEnabled ? autoScoutMinutes * 60 * 1000 : false,
	});

	const bestResume = useMemo(() => {
		if (!resumes || resumes.length === 0) return null;

		return resumes.reduce((best, current) => {
			const bestScore = best.aiAnalysis?.overallScore ?? 0;
			const currentScore = current.aiAnalysis?.overallScore ?? 0;
			return currentScore > bestScore ? current : best;
		});
	}, [resumes]);

	const filteredJobs = useMemo(() => {
		if (!recommendedJobs) return [];
		const q = search.trim().toLowerCase();
		if (!q) return recommendedJobs;

		return recommendedJobs.filter((job: RecommendedJob) => {
			const haystack = [
				job.title,
				job.company,
				job.location ?? "",
				job.description,
				...(job.skills ?? []),
				...(job.requirements ?? []),
			]
				.join(" ")
				.toLowerCase();
			return haystack.includes(q);
		});
	}, [recommendedJobs, search]);

	const handleQuickApply = async (jobId: string) => {
		if (!bestResume) return;

		setApplyingJobId(jobId);
		try {
			await applyMutation.mutateAsync({
				jobId,
				resumeId: bestResume._id,
			});
		} finally {
			setApplyingJobId(null);
		}
	};

	const runScout = async () => {
		await refetch();
		setLastScoutAt(new Date());
	};

	const prevJobsRef = useRef<string[]>([]);

	useEffect(() => {
		if (!recommendedJobs) return;
		const ids = recommendedJobs.map((j) => j._id);
		const prev = prevJobsRef.current;
		// Find new job ids
		const newIds = ids.filter((id) => !prev.includes(id));
		if (newIds.length > 0 && prev.length > 0) {
			toast.success(`Found ${newIds.length} new recommended job(s)`);
		}
		prevJobsRef.current = ids;
	}, [recommendedJobs]);

	if (isError && (error as any)?.response?.status !== 400) {
		return (
			<div className="card">
				<div className="flex items-center gap-3 mb-3">
					<div className="h-11 w-11 rounded-xl bg-primary-100 flex items-center justify-center">
						<Sparkles className="h-5 w-5 text-primary-600" aria-hidden="true" />
					</div>
					<div>
						<h2 className="text-xl font-semibold text-gray-900">
							Job Scout Bot
						</h2>
						<p className="text-sm text-gray-600">
							We could not load recommendations right now.
						</p>
					</div>
				</div>
				<p className="text-sm text-gray-500">
					Please try again after refreshing the page.
				</p>
			</div>
		);
	}

	return (
		<div className="card">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-5">
				<div>
					<div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 mb-3">
						<Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
						Job Scout Bot
					</div>
					<h2 className="text-xl font-semibold text-gray-900">
						Recommended Jobs
					</h2>
					<p className="mt-1 text-sm text-gray-600 max-w-2xl">
						The bot scans the latest jobs against your strongest resume, ranks
						the best fits, and lets you apply instantly.
					</p>
				</div>
				<div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800 lg:max-w-sm w-full">
					<p className="font-medium">Auto-apply mode</p>
					<p className="mt-1 text-primary-700">
						{bestResume
							? `Using ${bestResume.fileName}${bestResume.aiAnalysis?.overallScore !== undefined ? ` · ${bestResume.aiAnalysis.overallScore}% score` : ""}`
							: "Upload a resume to enable one-click applying."}
					</p>
				</div>
			</div>

			<div className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200">
							<RefreshCw
								className="h-5 w-5 text-primary-600"
								aria-hidden="true"
							/>
						</div>
						<div>
							<p className="font-semibold text-gray-900">Automated scouting</p>
							<p className="text-sm text-gray-600 max-w-2xl">
								Keep the bot running in the background. It refreshes
								recommendations on a fixed interval and updates the shortlist
								automatically.
							</p>
							{lastScoutAt && (
								<p className="mt-2 text-xs text-gray-500 flex items-center gap-2">
									<Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
									Last scout: {lastScoutAt.toLocaleTimeString()}
								</p>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700">
							<input
								type="checkbox"
								checked={autoScoutEnabled}
								onChange={(e) => setAutoScoutEnabled(e.target.checked)}
								className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
							/>
							<span>Auto-scout</span>
						</label>

						<select
							value={autoScoutMinutes}
							onChange={(e) =>
								setAutoScoutMinutes(
									Number(
										e.target.value,
									) as (typeof AUTO_SCAN_INTERVALS)[number],
								)
							}
							className="input sm:w-40"
							aria-label="Auto scout interval">
							{AUTO_SCAN_INTERVALS.map((minutes) => (
								<option key={minutes} value={minutes}>
									Every {minutes} min
								</option>
							))}
						</select>

						<button
							onClick={runScout}
							className="inline-flex items-center justify-center rounded-lg border border-primary-200 bg-white px-4 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50">
							<RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
							Scout now
						</button>
					</div>
				</div>
				<div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
					<BadgeCheck
						className="h-3.5 w-3.5 text-green-600"
						aria-hidden="true"
					/>
					Auto-scout only refreshes recommendations. Apply still requires a user
					action.
				</div>
			</div>

			<div className="relative mb-5">
				<Search
					className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
					aria-hidden="true"
				/>
				<input
					type="search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search titles, skills, companies, locations…"
					className="input pl-9"
					aria-label="Search recommended jobs"
				/>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<SkeletonCard key={i} lines={2} />
					))}
				</div>
			) : (error as any)?.response?.status === 400 ? (
				<div className="text-center py-10">
					<p className="text-gray-600 mb-4">
						Upload a resume to get personalized job recommendations.
					</p>
					<Link
						href="/dashboard/resumes"
						className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
						<Briefcase className="w-4 h-4 mr-2" aria-hidden="true" />
						Upload Resume
					</Link>
				</div>
			) : filteredJobs.length > 0 ? (
				<div className="space-y-3">
					{filteredJobs.map((job) => {
						const isApplying = applyingJobId === job._id;
						const canApply = Boolean(bestResume) && !isApplying;

						return (
							<div
								key={job._id}
								className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 hover:border-primary-300 transition-colors sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-3 min-w-0">
										<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 flex-shrink-0">
											<Briefcase
												className="h-5 w-5 text-primary-600"
												aria-hidden="true"
											/>
										</div>
										<div className="min-w-0">
											<p className="font-medium text-gray-900 truncate">
												{job.title}
											</p>
											<p className="text-sm text-gray-500 truncate">
												{job.company}
												{job.location ? ` · ${job.location}` : ""}
											</p>
										</div>
									</div>
									<p className="mt-3 text-sm text-gray-600 line-clamp-2">
										{job.description}
									</p>
								</div>
								<div className="flex items-center gap-3 flex-shrink-0 sm:ml-4">
									<span className="inline-flex flex-shrink-0 rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
										{job.matchScore}% match
									</span>
									<button
										onClick={() => handleQuickApply(job._id)}
										disabled={!canApply}
										className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
										{isApplying ? (
											<Loader2
												className="mr-2 h-4 w-4 animate-spin"
												aria-hidden="true"
											/>
										) : (
											<ArrowRight className="mr-2 h-4 w-4" aria-hidden="true" />
										)}
										{bestResume ? "Apply now" : "Upload resume"}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="text-center py-10 text-gray-500">
					No recommendations match your search.
				</div>
			)}

			<p className="mt-4 text-xs text-gray-500">
				One-click apply always uses your highest-scoring resume automatically.
			</p>
		</div>
	);
}
