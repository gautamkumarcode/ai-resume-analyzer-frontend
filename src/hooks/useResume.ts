"use client";

import { resumeService } from "@/services/resume.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useResumes() {
	return useQuery({
		queryKey: ["resumes"],
		queryFn: resumeService.getResumes,
	});
}

export function useResume(id: string) {
	return useQuery({
		queryKey: ["resumes", id],
		queryFn: () => resumeService.getResume(id),
		enabled: !!id,
	});
}

export function useUploadResume() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resumeService.uploadResume,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resumes"] });
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
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["resumes"] });
			queryClient.setQueryData(["resumes", data._id], data);
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resumes"] });
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
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message ||
					"Failed to get improvement suggestions",
			);
		},
	});
}
