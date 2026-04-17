import api from "@/lib/api";
import { ApiResponse, Application } from "@/types";

export const applicationService = {
	async applyToJob(jobId: string, resumeId?: string): Promise<Application> {
		const response = await api.post<ApiResponse<{ application: Application }>>(
			"/applications",
			{ jobId, resumeId },
		);
		return response.data.data!.application;
	},

	async getMyApplications(): Promise<Application[]> {
		const response =
			await api.get<ApiResponse<{ applications: Application[] }>>(
				"/applications/my",
			);
		return response.data.data!.applications;
	},

	async updateApplicationStatus(
		id: string,
		status: "shortlisted" | "rejected",
	): Promise<Application> {
		const response = await api.patch<ApiResponse<{ application: Application }>>(
			`/applications/${id}/status`,
			{ status },
		);
		return response.data.data!.application;
	},

	async withdrawApplication(id: string): Promise<void> {
		await api.delete(`/applications/${id}`);
	},

	async getJobApplications(jobId: string): Promise<Application[]> {
		const response = await api.get<
			ApiResponse<{ applications: Application[] }>
		>(`/jobs/${jobId}/applications`);
		return response.data.data!.applications;
	},
};
