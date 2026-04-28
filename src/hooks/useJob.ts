"use client";

import { CreateJobData, jobService } from "@/services/job.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Query keys for React Query
export const jobKeys = {
	all: ["jobs"] as const,
	lists: () => [...jobKeys.all, "list"] as const,
	list: (filters: string) => [...jobKeys.lists(), { filters }] as const,
	details: () => [...jobKeys.all, "detail"] as const,
	detail: (id: string) => [...jobKeys.details(), id] as const,
	matches: () => [...jobKeys.all, "matches"] as const,
	match: (id: string) => [...jobKeys.matches(), id] as const,
	recommended: () => [...jobKeys.all, "recommended"] as const,
};

export function useJobs() {
	return useQuery({
		queryKey: jobKeys.lists(),
		queryFn: jobService.getJobs,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useJob(id: string) {
	return useQuery({
		queryKey: jobKeys.detail(id),
		queryFn: () => jobService.getJob(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useCreateJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: jobService.createJob,
		onSuccess: (newJob) => {
			// Add the new job to the cache
			queryClient.setQueryData(jobKeys.detail(newJob._id), newJob);
			// Invalidate and refetch jobs list
			queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
			toast.success("Job created successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to create job");
		},
	});
}

export function useUpdateJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobData> }) =>
			jobService.updateJob(id, data),
		onSuccess: (updatedJob) => {
			// Update the job in cache
			queryClient.setQueryData(jobKeys.detail(updatedJob._id), updatedJob);
			// Invalidate jobs list to ensure consistency
			queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
			toast.success("Job updated successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update job");
		},
	});
}

export function useDeleteJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: jobService.deleteJob,
		onSuccess: (_, deletedJobId) => {
			// Remove job from cache
			queryClient.removeQueries({ queryKey: jobKeys.detail(deletedJobId) });
			// Invalidate jobs list
			queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
			toast.success("Job deleted successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete job");
		},
	});
}

export function useMatchResumeToJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ resumeId, jobId }: { resumeId: string; jobId: string }) =>
			jobService.matchResumeToJob(resumeId, jobId),
		onSuccess: (newMatch) => {
			// Add to matches cache
			queryClient.setQueryData(jobKeys.match(newMatch._id), newMatch);
			// Invalidate matches list
			queryClient.invalidateQueries({ queryKey: jobKeys.matches() });
			// Invalidate recommended jobs as they might change
			queryClient.invalidateQueries({ queryKey: jobKeys.recommended() });
			toast.success("Resume matched to job successfully!");
		},
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message || "Failed to match resume to job",
			);
		},
	});
}

export function useJobMatches(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: jobKeys.matches(),
		queryFn: jobService.getJobMatches,
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000,
	});
}

export function useJobMatch(id: string) {
	return useQuery({
		queryKey: jobKeys.match(id),
		queryFn: () => jobService.getJobMatch(id),
		enabled: !!id,
		staleTime: 10 * 60 * 1000,
	});
}

export function useRecommendedJobs(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: jobKeys.recommended(),
		queryFn: jobService.getRecommendedJobs,
		enabled: options?.enabled !== false,
		staleTime: 10 * 60 * 1000,
		retry: 1,
	});
}
