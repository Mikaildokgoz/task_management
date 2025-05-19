import { supabase } from "../config/supabaseClient";
import type { CreateTaskDto, Task, UpdateTaskDto } from "../types/task";

export class TaskService {
	static async createTask(data: CreateTaskDto): Promise<Task> {
		// Check if trying to assign a child to a child task
		if (data.parent_id) {
			const { data: parentTask } = await supabase
				.from("tasks")
				.select("parent_id")
				.eq("id", data.parent_id)
				.single();

			if (parentTask?.parent_id) {
				throw new Error("Cannot add a subtask to another subtask.");
			}
		}

		const now = new Date().toISOString();
		const taskData = {
			...data,
			assignees: Array.isArray(data.assignees) ? data.assignees : [],
			created_at: now,
			updated_at: now,
		};

		const { data: task, error } = await supabase
			.from("tasks")
			.insert([taskData])
			.select("*, parent_id, sprint_id")
			.single();

		if (error) {
			console.error("Error creating task:", error);
			if (error.message.includes("tasks_status_check")) {
				throw new Error(
					"Invalid task status. Valid statuses are: Open, Working, Completed"
				);
			}
			throw error;
		}

		if (!task) {
			throw new Error("Failed to create task: No data returned");
		}

		return task as Task;
	}

	static async updateTask(data: UpdateTaskDto): Promise<Task> {
		if (data.parent_id) {
			const { data: parentTask } = await supabase
				.from("tasks")
				.select("parent_id")
				.eq("id", data.parent_id)
				.single();

			if (parentTask?.parent_id) {
				throw new Error("Cannot add a subtask to another subtask.");
			}
		}

		const now = new Date().toISOString();
		const updateData = {
			...data,
			...(data.assignees && {
				assignees: Array.isArray(data.assignees) ? data.assignees : [],
			}),
			updated_at: now,
		};

		const { data: task, error } = await supabase
			.from("tasks")
			.update(updateData)
			.eq("id", data.id)
			.select("*, parent_id, sprint_id")
			.single();

		if (error) {
			console.error("Error updating task:", error);
			if (error.message.includes("tasks_status_check")) {
				throw new Error(
					"Invalid task status. Valid statuses are: Open, Working, Completed"
				);
			}
			throw error;
		}

		if (!task) {
			throw new Error("Failed to update task: No data returned");
		}

		return task as Task;
	}

	static async getAllTasks(): Promise<Task[]> {
		const { data: tasks, error } = await supabase
			.from("tasks")
			.select("*, parent_id, sprint_id")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching all tasks:", error);
			throw error;
		}

		return (tasks || []) as Task[];
	}

	static async getTasksBySprintId(
		sprintId: string
	): Promise<{ tasks: Task[]; hasMore: boolean }> {
		// Get all tasks for this sprint
		const { data: allSprintTasks, error: sprintError } = await supabase
			.from("tasks")
			.select("*")
			.eq("sprint_id", sprintId)
			.order("created_at", { ascending: false });

		if (sprintError) {
			console.error("Error fetching sprint tasks:", sprintError);
			throw sprintError;
		}

		if (!allSprintTasks?.length) {
			return { tasks: [], hasMore: false };
		}

		// Separate parent and child tasks
		const parentTasks = allSprintTasks.filter((task) => !task.parent_id);
		const childTasks = allSprintTasks.filter((task) => task.parent_id);

		// Build task tree
		const taskTree = parentTasks.map((parent) => ({
			...parent,
			assignees: Array.isArray(parent.assignees) ? parent.assignees : [],
			children: childTasks
				.filter((child) => child.parent_id === parent.id)
				.map((child) => ({
					...child,
					assignees: Array.isArray(child.assignees) ? child.assignees : [],
				})),
		}));

		return {
			tasks: taskTree,
			hasMore: false, // Pagination'ı kaldırdık çünkü tüm taskları gösteriyoruz
		};
	}

	static async deleteTask(taskId: string): Promise<void> {
		const { error } = await supabase.from("tasks").delete().eq("id", taskId);

		if (error) {
			console.error("Error deleting task:", error);
			throw error;
		}
	}
}
