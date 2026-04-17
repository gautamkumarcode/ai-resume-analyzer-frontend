"use client";

import { adminService } from "@/services/admin.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useAnalytics() {
	return useQuery({
		queryKey: ["adminAnalytics"],
		queryFn: adminService.getAnalytics,
	});
}

export function useAdminUsers(page = 1, limit = 20) {
	return useQuery({
		queryKey: ["adminUsers", page, limit],
		queryFn: () => adminService.getUsers(page, limit),
	});
}

export function useUpdateUserStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, active }: { id: string; active: boolean }) =>
			adminService.updateUserStatus(id, active),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
			toast.success("User status updated!");
		},
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message || "Failed to update user status",
			);
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminService.deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
			toast.success("User deleted successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete user");
		},
	});
}

export function useAdminJobs(page = 1, limit = 20) {
	return useQuery({
		queryKey: ["adminJobs", page, limit],
		queryFn: () => adminService.getAdminJobs(page, limit),
	});
}

export function useDeleteAdminJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminService.deleteAdminJob,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminJobs"] });
			toast.success("Job deleted successfully!");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete job");
		},
	});
}
