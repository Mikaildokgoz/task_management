export type TaskStatus = "Open" | "Working" | "Completed";

export interface Task {
	id: string;
	subject: string;
	description?: string;
	status: TaskStatus;
	parent_id?: string;
	sprint_id: string;
	estimated_hours?: number;
	assignees?: string[];
	created_at: string;
	updated_at: string;
	children?: Task[];
}

export interface TaskState {
	tasks: Task[];
	tasksByParentId: Record<string | "root", Task[]>;
	isLoading: boolean;
	error: string | null;
	totalCount: number;
	currentPage: number;
	pageSize: number;
	tasksBySprintId: Record<string, Task[]>;
	taskTree: Task[];
	hasMore: boolean;
}

export interface CreateTaskDto {
	subject: string;
	description?: string;
	status?: TaskStatus;
	parent_id?: string;
	sprint_id: string;
	estimated_hours?: number;
	assignees?: string[];
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
	id: string;
}

export interface TaskTreeItem extends Task {
	children: TaskTreeItem[];
	level: number;
	isExpanded: boolean;
}

export const buildTaskTree = (tasks: Task[]): Task[] => {
	const taskMap = new Map<string, Task>();
	const rootTasks: Task[] = [];

	// Önce tüm taskları map'e ekle
	tasks.forEach((task) => {
		taskMap.set(task.id, { ...task, children: [] });
	});

	// Parent-child ilişkilerini kur
	tasks.forEach((task) => {
		const taskWithChildren = taskMap.get(task.id)!;
		if (task.parent_id) {
			const parent = taskMap.get(task.parent_id);
			if (parent) {
				if (!parent.children) {
					parent.children = [];
				}
				parent.children.push(taskWithChildren);
			}
		} else {
			rootTasks.push(taskWithChildren);
		}
	});

	return rootTasks;
};
