import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Sprint, SprintState, CreateSprintDto } from "../../types/sprint";
import { supabase } from "../../config/supabaseClient";

const initialState: SprintState = {
	sprints: [],
	isLoading: false,
	error: null,
};

export const createSprint = createAsyncThunk(
	"sprint/create",
	async (data: CreateSprintDto) => {
		const { data: session } = await supabase.auth.getSession();
		if (!session.session?.user?.id) {
			throw new Error("User not authenticated");
		}

		const { data: sprint, error } = await supabase
			.from("sprints")
			.insert([
				{
					name: data.name,
					user_id: session.session.user.id,
				},
			])
			.select()
			.single();

		if (error) {
			console.error("Supabase error:", error);
			throw new Error(error.message);
		}

		if (!sprint) {
			throw new Error("Failed to create sprint");
		}

		return sprint as Sprint;
	}
);

export const fetchSprints = createAsyncThunk(
	"sprint/fetchAll",
	async (_, { rejectWithValue }) => {
		try {
			const { data: sprints, error } = await supabase
				.from("sprints")
				.select()
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Supabase error:", error);
				return rejectWithValue(error.message);
			}

			return sprints as Sprint[];
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue("An unknown error occurred");
		}
	}
);

const sprintSlice = createSlice({
	name: "sprint",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(createSprint.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(createSprint.fulfilled, (state, action) => {
				state.isLoading = false;
				state.sprints.unshift(action.payload);
			})
			.addCase(createSprint.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message ?? "Failed to create sprint";
			})
			.addCase(fetchSprints.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchSprints.fulfilled, (state, action) => {
				state.isLoading = false;
				state.sprints = action.payload;
			})
			.addCase(fetchSprints.rejected, (state, action) => {
				state.isLoading = false;
				state.error = (action.payload as string) ?? "Failed to fetch sprints";
			});
	},
});

export const { clearError } = sprintSlice.actions;
export default sprintSlice.reducer;
