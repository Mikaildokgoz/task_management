import axios from "axios";
import { supabase } from "./supabaseClient";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
	async (config) => {
		const session = await supabase.auth.getSession();
		if (session.data.session?.access_token) {
			config.headers.Authorization = `Bearer ${session.data.session.access_token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const {
					data: { session },
					error: refreshError,
				} = await supabase.auth.refreshSession();

				if (refreshError) throw refreshError;

				if (session) {
					originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
					return api(originalRequest);
				}
			} catch (refreshError) {
				await supabase.auth.signOut();
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default api;
