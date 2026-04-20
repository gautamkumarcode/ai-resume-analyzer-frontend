"use client";

import { resumeService } from "@/services/resume.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Query keys for React Query
export const resumeKeys = {
	all: ["resumes"] as const,
	lists: () => [...resumeKeys.all, "list"] as const,
	list: (filters: string) => [...resumeKeys.lists(), { filters }] as const,
	details: () => [...resumeKeys.all, "detail"] as const,
	detail: (id: string) => [...resumeKeys.details(), id] as const,
};

export function useResumes() {
	return useQuery({
		queryKey: resumeKeys.lists(),
		queryFn: resumeService.getResumes,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useResume(id: string) {
	return useQuery({
		queryKey: resumeKeys.detail(id),
		queryFn: () => resumeService.getResume(id),
		enabled: !!id,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

export function useUploadResume() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resumeService.uploadResume,
		onSuccess: (newResume) => {
			// Add new resume to cache
			queryClient.setQueryData(resumeKeys.detail(newResume._id), newResume);
			// Invalidate resumes list
			queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
			toast.success("Resume uploaded successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to upload resume");
		},
	});
}

export function useAnalyzeResume() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resumeService.analyzeResume,
		onSuccess: (analyzedResume) => {
			// Update resume in cache
			queryClient.setQueryData(
				resumeKeys.detail(analyzedResume._id),
				analyzedResume,
			);
			// Invalidate resumes list to show updated analysis
			queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
			toast.success("Resume analyzed successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to analyze resume");
		},
	});
}

export function useDeleteResume() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resumeService.deleteResume,
		onSuccess: (_, deletedResumeId) => {
			// Remove resume from cache
			queryClient.removeQueries({
				queryKey: resumeKeys.detail(deletedResumeId),
			});
			// Invalidate resumes list
			queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
			toast.success("Resume deleted successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete resume");
		},
	});
}

export function useImproveResume() {
	return useMutation({
		mutationFn: ({ resumeId, jobId }: { resumeId: string; jobId: string }) =>
			resumeService.improveResume(resumeId, jobId),
		onSuccess: () => {
			toast.success("Resume improvement suggestions generated!");
		},
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message ||
					"Failed to get improvement suggestions",
			);
		},
	});
}
