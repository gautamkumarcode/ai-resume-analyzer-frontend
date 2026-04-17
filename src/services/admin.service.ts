import api from "@/lib/api";
import { ApiResponse, Job, User } from "@/types";

export interface AdminAnalytics {
	totalUsers: number;
	totalJobs: number;
	totalApplications: number;
	totalResumes: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const adminService = {
	async getAnalytics(): Promise<AdminAnalytics> {
		const response =
			await api.get<ApiResponse<AdminAnalytics>>("/admin/analytics");
		return response.data.data!;
	},

	async getUsers(
		page = 1,
		limit = 20,
	): Promise<{ users: User[]; pagination: any }> {
		const response = await api.get<
			ApiResponse<{ users: User[]; pagination: any }>
		>(`/admin/users?page=${page}&limit=${limit}`);
		return response.data.data!;
	},

	async updateUserStatus(id: string, active: boolean): Promise<User> {
		const response = await api.patch<ApiResponse<{ user: User }>>(
			`/admin/users/${id}/status`,
			{ active },
		);
		return response.data.data!.user;
	},

	async deleteUser(id: string): Promise<void> {
		await api.delete(`/admin/users/${id}`);
	},

	async getAdminJobs(
		page = 1,
		limit = 20,
	): Promise<{ jobs: Job[]; pagination: any }> {
		const response = await api.get<
			ApiResponse<{ jobs: Job[]; pagination: any }>
		>(`/admin/jobs?page=${page}&limit=${limit}`);
		return response.data.data!;
	},

	async deleteAdminJob(id: string): Promise<void> {
		await api.delete(`/admin/jobs/${id}`);
	},
};
