import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { TaskService } from "../../services/TaskService";
import type { TaskState, CreateTaskDto, UpdateTaskDto } from "../../types/task";

const initialState: TaskState = {
	tasks: [],
	isLoading: false,
	error: null,
	totalCount: 0,
	currentPage: 1,
	pageSize: 10,
	tasksBySprintId: {},
	taskTree: [],
	hasMore: false,
	tasksByParentId: {},
};

export const fetchTasksBySprintId = createAsyncThunk(
	"task/fetchTasksBySprintId",
	async ({ sprintId }: { sprintId: string }) => {
		const result = await TaskService.getTasksBySprintId(sprintId);
		return {
			sprintId,
			...result,
		};
	}
);

export const createTask = createAsyncThunk(
	"task/create",
	async (data: CreateTaskDto) => {
		return TaskService.createTask(data);
	}
);

export const updateTask = createAsyncThunk(
	"task/update",
	async (data: UpdateTaskDto) => {
		return TaskService.updateTask(data);
	}
);

export const deleteTask = createAsyncThunk(
	"task/delete",
	async (taskId: string, { rejectWithValue }) => {
		try {
			await TaskService.deleteTask(taskId);
			return taskId;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue("An unknown error occurred");
		}
	}
);

export const fetchTasks = createAsyncThunk(
	"task/fetchAll",
	async (_, { rejectWithValue }) => {
		try {
			const tasks = await TaskService.getAllTasks();
			return tasks;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue("An unknown error occurred");
		}
	}
);

export const taskSlice = createSlice({
	name: "task",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setTasks: (state, action) => {
			state.tasks = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchTasksBySprintId.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchTasksBySprintId.fulfilled, (state, action) => {
				state.isLoading = false;
				state.tasksBySprintId[action.payload.sprintId] = action.payload.tasks;
				state.hasMore = action.payload.hasMore;
			})
			.addCase(fetchTasksBySprintId.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message ?? "Failed to fetch tasks";
			})
			.addCase(createTask.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(createTask.fulfilled, (state, action) => {
				state.isLoading = false;
				const sprintId = action.payload.sprint_id;
				if (!state.tasksBySprintId[sprintId]) {
					state.tasksBySprintId[sprintId] = [];
				}

				if (action.payload.parent_id) {
					// If it's a subtask, find the parent task and add it to its children
					const parentTask = state.tasksBySprintId[sprintId]?.find(
						(task) => task.id === action.payload.parent_id
					);
					if (parentTask) {
						if (!parentTask.children) {
							parentTask.children = [];
						}
						parentTask.children.push(action.payload);
					}
				} else {
					// If it's a parent task, add it to the sprint's task list
					state.tasksBySprintId[sprintId].unshift(action.payload);
				}
			})
			.addCase(createTask.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message ?? "Failed to create task";
			})
			.addCase(updateTask.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updateTask.fulfilled, (state, action) => {
				state.isLoading = false;
				const sprintId = action.payload.sprint_id;
				const tasks = state.tasksBySprintId[sprintId];
				if (tasks) {
					const index = tasks.findIndex(
						(task) => task.id === action.payload.id
					);
					if (index !== -1) {
						tasks[index] = action.payload;
					}
				}
			})
			.addCase(updateTask.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message ?? "Failed to update task";
			})
			.addCase(deleteTask.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(deleteTask.fulfilled, (state, action) => {
				state.isLoading = false;
				// Update tasksBySprintId for all sprints
				Object.keys(state.tasksBySprintId).forEach((sprintId) => {
					state.tasksBySprintId[sprintId] = state.tasksBySprintId[
						sprintId
					].filter((task) => task.id !== action.payload);
				});
				// Update tasks array
				state.tasks = state.tasks.filter((task) => task.id !== action.payload);
				state.error = null;
			})
			.addCase(deleteTask.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message ?? "Failed to delete task";
			})
			.addCase(fetchTasks.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchTasks.fulfilled, (state, action) => {
				state.isLoading = false;
				state.tasks = action.payload;
				state.error = null;
			})
			.addCase(fetchTasks.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message ?? "Failed to fetch tasks";
			});
	},
});

export const { clearError, setTasks } = taskSlice.actions;
export default taskSlice.reducer;
