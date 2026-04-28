import api from "@/lib/api";
import { ApiResponse, Interview } from "@/types";

export const interviewService = {
	async startInterview(jobId: string, resumeId: string): Promise<Interview> {
		const res = await api.post<ApiResponse<{ interview: Interview }>>(
			"/interviews/start",
			{ jobId, resumeId },
		);
		return res.data.data!.interview;
	},

	async submitInterview(
		id: string,
		answers: { question: string; answer: string }[],
	): Promise<Interview> {
		const res = await api.post<ApiResponse<{ interview: Interview }>>(
			`/interviews/${id}/submit`,
			{ answers },
		);
		return res.data.data!.interview;
	},

	async getMyInterviews(): Promise<Interview[]> {
		const res =
			await api.get<ApiResponse<{ interviews: Interview[] }>>("/interviews/my");
		return res.data.data!.interviews;
	},

	async getJobInterviews(jobId: string): Promise<Interview[]> {
		const res = await api.get<ApiResponse<{ interviews: Interview[] }>>(
			`/interviews/job/${jobId}`,
		);
		return res.data.data!.interviews;
	},
};
