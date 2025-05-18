import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import type {
	AuthState,
	LoginCredentials,
	RegisterCredentials,
} from "../../types/auth";
import { transformUser } from "../../types/auth";

const initialState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	isLoading: false,
	error: null,
};

export const register = createAsyncThunk(
	"auth/register",
	async (credentials: RegisterCredentials) => {
		const data = await authService.register(credentials);
		return {
			user: transformUser(data.user),
			session: data.session,
		};
	}
);

export const login = createAsyncThunk(
	"auth/login",
	async ({ email, password }: LoginCredentials) => {
		const data = await authService.login({ email, password });
		return {
			user: transformUser(data.user),
			session: data.session,
		};
	}
);

export const logout = createAsyncThunk("auth/logout", async () => {
	await authService.logout();
});

export const getCurrentSession = createAsyncThunk(
	"auth/getCurrentSession",
	async () => {
		const session = await authService.getCurrentSession();
		if (!session) return null;
		return {
			user: transformUser(session.user),
			session,
		};
	}
);

export const refreshSession = createAsyncThunk(
	"auth/refreshSession",
	async () => {
		const session = await authService.refreshSession();
		if (!session) return null;
		return {
			user: transformUser(session.user),
			session,
		};
	}
);

export const resetPasswordRequest = createAsyncThunk(
	"auth/resetPasswordRequest",
	async (email: string) => {
		await authService.resetPasswordRequest(email);
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Register
			.addCase(register.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(register.fulfilled, (state) => {
				state.isLoading = false;
				state.error = null;
			})
			.addCase(register.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Registration failed.";
			})
			// Login
			.addCase(login.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.isLoading = false;
				if (action.payload?.user) {
					state.user = action.payload.user;
					state.accessToken = action.payload.session?.access_token || null;
					state.refreshToken = action.payload.session?.refresh_token || null;
				}
			})
			.addCase(login.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Login failed.";
			})
			// Logout
			.addCase(logout.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(logout.fulfilled, (state) => {
				state.isLoading = false;
				state.user = null;
				state.accessToken = null;
				state.refreshToken = null;
			})
			.addCase(logout.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Logout failed.";
			})
			// Get Current Session
			.addCase(getCurrentSession.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(getCurrentSession.fulfilled, (state, action) => {
				state.isLoading = false;
				if (action.payload?.user) {
					state.user = action.payload.user;
					state.accessToken = action.payload.session?.access_token || null;
					state.refreshToken = action.payload.session?.refresh_token || null;
				}
			})
			.addCase(getCurrentSession.rejected, (state, action) => {
				state.isLoading = false;
				state.error =
					action.error.message || "Failed to get session information.";
			})
			// Refresh Session
			.addCase(refreshSession.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(refreshSession.fulfilled, (state, action) => {
				state.isLoading = false;
				if (action.payload?.user) {
					state.user = action.payload.user;
					state.accessToken = action.payload.session?.access_token || null;
					state.refreshToken = action.payload.session?.refresh_token || null;
				}
			})
			.addCase(refreshSession.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to refresh session.";
			})
			// Reset Password Request
			.addCase(resetPasswordRequest.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(resetPasswordRequest.fulfilled, (state) => {
				state.isLoading = false;
				state.error = null;
			})
			.addCase(resetPasswordRequest.rejected, (state, action) => {
				state.isLoading = false;
				state.error =
					action.error.message || "Failed to send reset password email.";
			});
	},
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
