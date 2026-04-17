import api from "@/lib/api";
import { ApiResponse, ImprovementResult, Resume } from "@/types";

export const resumeService = {
	async uploadResume(file: File): Promise<Resume> {
		const formData = new FormData();
		formData.append("resume", file);
		const response = await api.post<ApiResponse<{ resume: Resume }>>(
			"/resumes/upload",
			formData,
			{ headers: { "Content-Type": "multipart/form-data" } },
		);
		return response.data.data!.resume;
	},

	async analyzeResume(id: string): Promise<Resume> {
		const response = await api.post<ApiResponse<{ resume: Resume }>>(
			`/resumes/${id}/analyze`,
		);
		return response.data.data!.resume;
	},

	async getResumes(): Promise<Resume[]> {
		const response =
			await api.get<ApiResponse<{ resumes: Resume[] }>>("/resumes");
		return response.data.data!.resumes;
	},

	async getResume(id: string): Promise<Resume> {
		const response = await api.get<ApiResponse<{ resume: Resume }>>(
			`/resumes/${id}`,
		);
		return response.data.data!.resume;
	},

	async deleteResume(id: string): Promise<void> {
		await api.delete(`/resumes/${id}`);
	},

	async improveResume(
		resumeId: string,
		jobId: string,
	): Promise<ImprovementResult> {
		const response = await api.post<
			ApiResponse<{ improvement: ImprovementResult }>
		>(`/resumes/${resumeId}/improve`, { jobId });
		return response.data.data!.improvement;
	},
};
