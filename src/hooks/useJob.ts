"use client";

import { CreateJobData, jobService } from "@/services/job.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useJobs() {
	return useQuery({
		queryKey: ["jobs"],
		queryFn: jobService.getJobs,
	});
}

export function useJob(id: string) {
	return useQuery({
		queryKey: ["jobs", id],
		queryFn: () => jobService.getJob(id),
		enabled: !!id,
	});
}

export function useCreateJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: jobService.createJob,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
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
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
			queryClient.setQueryData(["jobs", data._id], data);
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobMatches"] });
			toast.success("Resume matched to job successfully!");
		},
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message || "Failed to match resume to job",
			);
		},
	});
}

export function useJobMatches() {
	return useQuery({
		queryKey: ["jobMatches"],
		queryFn: jobService.getJobMatches,
	});
}

export function useJobMatch(id: string) {
	return useQuery({
		queryKey: ["jobMatches", id],
		queryFn: () => jobService.getJobMatch(id),
		enabled: !!id,
	});
}
