import api from "@/lib/api";
import { ApiResponse, User, UserRole } from "@/types";

export interface LoginData {
	email: string;
	password: string;
}

export interface RegisterData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: UserRole;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface ProfileUpdateData {
	firstName?: string;
	lastName?: string;
	phone?: string;
	location?: string;
	title?: string;
	company?: string;
	summary?: string;
	experience?: string;
	skills?: string;
	linkedin?: string;
	website?: string;
}

export const authService = {
	async login(data: LoginData): Promise<AuthResponse> {
		const response = await api.post<ApiResponse<AuthResponse>>(
			"/auth/login",
			data,
		);
		return response.data.data!;
	},

	async register(data: RegisterData): Promise<AuthResponse> {
		const response = await api.post<ApiResponse<AuthResponse>>(
			"/auth/register",
			data,
		);
		return response.data.data!;
	},

	async getProfile(): Promise<User> {
		const response =
			await api.get<ApiResponse<{ user: User }>>("/auth/profile");
		return response.data.data!.user;
	},

	async updateProfile(data: ProfileUpdateData): Promise<User> {
		const response = await api.put<ApiResponse<{ user: User }>>(
			"/auth/profile",
			data,
		);
		return response.data.data!.user;
	},
};
