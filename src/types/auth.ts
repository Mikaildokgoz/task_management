import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
	id: string;
	email: string;
	user_metadata: {
		firstName: string;
		lastName: string;
	};
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials extends LoginCredentials {
	firstName: string;
	lastName: string;
}

export interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isLoading: boolean;
	error: string | null;
}

export const transformUser = (user: SupabaseUser | null): User | null => {
	if (!user || !user.email) return null;

	return {
		id: user.id,
		email: user.email,
		user_metadata: user.user_metadata as {
			firstName: string;
			lastName: string;
		},
	};
};
