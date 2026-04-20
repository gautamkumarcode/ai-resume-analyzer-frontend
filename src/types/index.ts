export type UserRole = "candidate" | "recruiter" | "admin";

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	active?: boolean;
	phone?: string;
	location?: string;
	title?: string;
	company?: string;
	summary?: string;
	experience?: string;
	skills?: string[];
	linkedin?: string;
	website?: string;
	createdAt?: string;
}

export interface AuthResponse {
	success: boolean;
	data: {
		user: User;
		token: string;
	};
}

export interface Skill {
	name: string;
	level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Experience {
	title: string;
	company: string;
	location?: string;
	startDate?: string;
	endDate?: string;
	current?: boolean;
	description?: string;
}

export interface Education {
	degree: string;
	institution: string;
	location?: string;
	graduationDate?: string;
	gpa?: string;
}

export interface Resume {
	_id: string;
	user: string;
	fileName: string;
	filePath: string;
	fileType: string;
	rawText?: string;
	parsedData: {
		name?: string;
		email?: string;
		phone?: string;
		location?: string;
		summary?: string;
		skills: Skill[];
		experience: Experience[];
		education: Education[];
	};
	aiAnalysis?: {
		overallScore: number;
		strengths: string[];
		improvements: string[];
		keywords: string[];
		summary: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface Job {
	_id: string;
	user: string;
	title: string;
	company: string;
	location?: string;
	type: "full-time" | "part-time" | "contract" | "internship" | "remote";
	description: string;
	requirements: string[];
	skills: string[];
	salary?: {
		min?: number;
		max?: number;
		currency?: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface JobMatch {
	_id: string;
	user: string;
	resume: Resume | string;
	job: Job | string;
	matchScore: number;
	skillsMatch: {
		matched: string[];
		missing: string[];
		percentage: number;
	};
	experienceMatch: {
		score: number;
		feedback: string;
	};
	recommendations: string[];
	aiAnalysis: string;
	createdAt: string;
	updatedAt: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export type ApplicationStatus = "applied" | "shortlisted" | "rejected";

export interface Application {
	_id: string;
	candidateId: User | string;
	jobId: Job | string;
	resumeId?: Resume | string;
	status: ApplicationStatus;
	matchScore?: number;
	appliedAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface ImprovementResult {
	improvedBulletPoints: string[];
	missingKeywords: string[];
	formattingSuggestions: string[];
}

export interface RecommendedJob extends Job {
	matchScore: number;
}
