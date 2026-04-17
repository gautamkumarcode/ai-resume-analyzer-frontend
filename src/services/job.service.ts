import api from "@/lib/api";
import { ApiResponse, Job, JobMatch, RecommendedJob } from "@/types";

export interface CreateJobData {
	title: string;
	company: string;
	location?: string;
	type?: "full-time" | "part-time" | "contract" | "internship" | "remote";
	description: string;
	requirements?: string[];
	skills?: string[];
	salary?: {
		min?: number;
		max?: number;
		currency?: string;
	};
}

export const jobService = {
	async createJob(data: CreateJobData): Promise<Job> {
		const response = await api.post<ApiResponse<{ job: Job }>>("/jobs", data);
		return response.data.data!.job;
	},

	async getJobs(): Promise<Job[]> {
		const response = await api.get<ApiResponse<{ jobs: Job[] }>>("/jobs");
		return response.data.data!.jobs;
	},

	async getJob(id: string): Promise<Job> {
		const response = await api.get<ApiResponse<{ job: Job }>>(`/jobs/${id}`);
		return response.data.data!.job;
	},

	async updateJob(id: string, data: Partial<CreateJobData>): Promise<Job> {
		const response = await api.put<ApiResponse<{ job: Job }>>(
			`/jobs/${id}`,
			data,
		);
		return response.data.data!.job;
	},

	async deleteJob(id: string): Promise<void> {
		await api.delete(`/jobs/${id}`);
	},

	async matchResumeToJob(resumeId: string, jobId: string): Promise<JobMatch> {
		const response = await api.post<ApiResponse<{ jobMatch: JobMatch }>>(
			"/jobs/match",
			{ resumeId, jobId },
		);
		return response.data.data!.jobMatch;
	},

	async getJobMatches(): Promise<JobMatch[]> {
		const response =
			await api.get<ApiResponse<{ jobMatches: JobMatch[] }>>(
				"/jobs/matches/all",
			);
		return response.data.data!.jobMatches;
	},

	async getJobMatch(id: string): Promise<JobMatch> {
		const response = await api.get<ApiResponse<{ jobMatch: JobMatch }>>(
			`/jobs/matches/${id}`,
		);
		return response.data.data!.jobMatch;
	},

	async getRecommendedJobs(): Promise<RecommendedJob[]> {
		const response =
			await api.get<ApiResponse<{ jobs: RecommendedJob[] }>>(
				"/jobs/recommended",
			);
		return response.data.data!.jobs;
	},
};
