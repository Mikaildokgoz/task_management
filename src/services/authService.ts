import { supabase } from "../config/supabaseClient";
import type { LoginCredentials, RegisterCredentials } from "../types/auth";

export const authService = {
	async register(credentials: RegisterCredentials) {
		const { data, error } = await supabase.auth.signUp({
			email: credentials.email,
			password: credentials.password,
			options: {
				data: {
					firstName: credentials.firstName,
					lastName: credentials.lastName,
				},
				emailRedirectTo: `${window.location.origin}/auth`,
			},
		});

		if (error) throw new Error(error.message);
		return data;
	},

	async login(credentials: LoginCredentials) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: credentials.email,
			password: credentials.password,
		});

		if (error) throw new Error(error.message);
		return data;
	},

	async logout() {
		const { error } = await supabase.auth.signOut();
		if (error) throw new Error(error.message);
	},

	async getCurrentSession() {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();
		if (error) throw new Error(error.message);
		return session;
	},

	async resetPasswordRequest(email: string) {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password#recovery`,
		});
		if (error) throw error;
	},

	async updatePassword(newPassword: string) {
		const { error } = await supabase.auth.updateUser({
			password: newPassword,
		});
		if (error) throw new Error(error.message);
	},

	async refreshSession() {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();
		if (error) throw new Error(error.message);

		if (session && session.expires_at) {
			const expiresAt = new Date(session.expires_at * 1000);
			const now = new Date();
			const timeUntilExpiry = expiresAt.getTime() - now.getTime();

			// Refresh session if it expires in less than 5 minutes
			if (timeUntilExpiry < 5 * 60 * 1000) {
				const { data, error: refreshError } =
					await supabase.auth.refreshSession();
				if (refreshError) throw new Error(refreshError.message);
				return data.session;
			}
		}

		return session;
	},

	async handleEmailConfirmation() {
		// Get the confirmation token from URL
		const hashParams = new URLSearchParams(window.location.hash.substring(1));
		const accessToken = hashParams.get("access_token");
		const refreshToken = hashParams.get("refresh_token");

		if (accessToken && refreshToken) {
			// Set the session with the tokens
			const { data, error } = await supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: refreshToken,
			});

			if (error) throw new Error(error.message);

			// If we have a session, clear it from both Supabase and localStorage
			if (data.session) {
				// Clear the session from localStorage
				localStorage.removeItem("task-management-auth");

				// Sign out from Supabase
				await this.logout();

				// Clear the URL hash
				window.history.replaceState(null, "", window.location.pathname);

				return { emailConfirmed: true };
			}
		}

		return { emailConfirmed: false };
	},

	async handlePasswordReset(newPassword: string) {
		const { error } = await supabase.auth.updateUser({
			password: newPassword,
		});
		if (error) throw error;
	},
};
