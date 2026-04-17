"use client";

import { applicationService } from "@/services/application.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useMyApplications() {
	return useQuery({
		queryKey: ["applications"],
		queryFn: applicationService.getMyApplications,
	});
}

export function useApplyToJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ jobId, resumeId }: { jobId: string; resumeId?: string }) =>
			applicationService.applyToJob(jobId, resumeId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			toast.success("Application submitted successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to apply");
		},
	});
}

export function useWithdrawApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: applicationService.withdrawApplication,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			toast.success("Application withdrawn successfully!");
		},
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message || "Failed to withdraw application",
			);
		},
	});
}

export function useUpdateApplicationStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			status,
		}: {
			id: string;
			status: "shortlisted" | "rejected";
		}) => applicationService.updateApplicationStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
			toast.success("Status updated successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update status");
		},
	});
}

export function useJobApplications(jobId: string) {
	return useQuery({
		queryKey: ["jobApplications", jobId],
		queryFn: () => applicationService.getJobApplications(jobId),
		enabled: !!jobId,
	});
}
