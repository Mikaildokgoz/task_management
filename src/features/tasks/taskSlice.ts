import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Task, UpdateTaskDto } from "../../types/task";
import { supabase } from "../../config/supabaseClient";

interface TaskState {
	tasksBySprintId: Record<string, Task[]>;
	isLoading: boolean;
	error: string | null;
}

const initialState: TaskState = {
	tasksBySprintId: {},
	isLoading: false,
	error: null,
};

export const updateTask = createAsyncThunk(
	"tasks/updateTask",
	async (taskData: UpdateTaskDto) => {
		const { data, error } = await supabase
			.from("tasks")
			.update({
				subject: taskData.subject,
				description: taskData.description,
				status: taskData.status,
				estimated_hours: taskData.estimated_hours,
				updated_at: new Date().toISOString(),
			})
			.eq("id", taskData.id)
			.select()
			.single();

		if (error) throw new Error(error.message);
		return data as Task;
	}
);

export const deleteTask = createAsyncThunk(
	"tasks/deleteTask",
	async (taskId: string) => {
		const { error } = await supabase.from("tasks").delete().eq("id", taskId);

		if (error) throw new Error(error.message);
		return taskId;
	}
);

const taskSlice = createSlice({
	name: "tasks",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			// Update Task
			.addCase(updateTask.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updateTask.fulfilled, (state, action) => {
				state.isLoading = false;
				Object.keys(state.tasksBySprintId).forEach((sprintId) => {
					const tasks = state.tasksBySprintId[sprintId];
					const index = tasks.findIndex(
						(task) => task.id === action.payload.id
					);
					if (index !== -1) {
						tasks[index] = {
							...tasks[index],
							...action.payload,
						};
					}
				});
			})
			.addCase(updateTask.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to update task";
			})
			// Delete Task
			.addCase(deleteTask.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(deleteTask.fulfilled, (state, action) => {
				state.isLoading = false;
				Object.keys(state.tasksBySprintId).forEach((sprintId) => {
					state.tasksBySprintId[sprintId] = state.tasksBySprintId[
						sprintId
					].filter((task) => task.id !== action.payload);
				});
			})
			.addCase(deleteTask.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to delete task";
			});
	},
});

export default taskSlice.reducer;
