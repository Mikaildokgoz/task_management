export interface Sprint {
	id: string;
	name: string;
	created_at: string;
}

export interface SprintState {
	sprints: Sprint[];
	isLoading: boolean;
	error: string | null;
}

export interface CreateSprintDto {
	name: string;
}
