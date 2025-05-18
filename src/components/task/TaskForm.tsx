import { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Box,
	Alert,
	OutlinedInput,
	Chip,
	FormHelperText,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { useAppDispatch } from "../../hooks/redux";
import { createTask, updateTask } from "../../features/task/taskSlice";
import type { CreateTaskDto, TaskStatus, Task } from "../../types/task";
import type { Sprint } from "../../types/sprint";

const STATUS_OPTIONS: TaskStatus[] = ["Open", "Working", "Completed"];

interface TaskFormProps {
	open: boolean;
	onClose: () => void;
	sprints: Sprint[];
	tasks: Task[];
	task?: Task;
	isUpdate?: boolean;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

export const TaskForm = ({
	open,
	onClose,
	sprints,
	tasks,
	task,
	isUpdate = false,
}: TaskFormProps) => {
	const dispatch = useAppDispatch();
	const [error, setError] = useState<string | null>(null);
	const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
	const [selectedParent, setSelectedParent] = useState<Task | null>(null);

	const [formData, setFormData] = useState<CreateTaskDto>({
		subject: "",
		description: "",
		status: "Open",
		sprint_id: "",
		parent_id: undefined,
		estimated_hours: undefined,
		assignees: [],
	});

	useEffect(() => {
		if (isUpdate && task) {
			setFormData({
				subject: task.subject,
				description: task.description,
				status: task.status,
				sprint_id: task.sprint_id,
				parent_id: task.parent_id,
				estimated_hours: task.estimated_hours,
				assignees: task.assignees || [],
			});
			setSelectedSprint(sprints.find((s) => s.id === task.sprint_id) || null);
			setSelectedParent(task);
		} else {
			setFormData({
				subject: "",
				description: "",
				status: "Open",
				sprint_id: "",
				parent_id: undefined,
				estimated_hours: undefined,
				assignees: [],
			});
			setSelectedSprint(null);
			setSelectedParent(null);
		}
		setError(null);
	}, [isUpdate, task, sprints]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validate sprint and parent task
		if (
			selectedParent &&
			selectedSprint &&
			selectedParent.sprint_id !== selectedSprint.id
		) {
			setError("Parent task and new task must be in the same sprint");
			return;
		}

		// Validate required fields
		if (!formData.subject.trim()) {
			setError("Subject is required");
			return;
		}
		if (!formData.description) {
			setError("Description is required");
			return;
		}
		if (!formData.sprint_id) {
			setError("Sprint selection is required");
			return;
		}
		if (formData.estimated_hours === undefined) {
			setError("Estimated hours is required");
			return;
		}
		if (!formData.assignees || formData.assignees.length === 0) {
			setError("At least one assignee is required");
			return;
		}

		try {
			if (isUpdate && task) {
				await dispatch(updateTask({ id: task.id, ...formData })).unwrap();
			} else {
				await dispatch(createTask(formData)).unwrap();
			}
			onClose();
		} catch (error) {
			console.error("Failed to save task:", error);
			setError("Failed to save task. Please try again.");
		}
	};

	const handleChange = (
		e:
			| React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
			| (Event & { target: { value: unknown; name: string } })
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name as keyof CreateTaskDto]: value,
		}));
		setError(null);
	};

	const handleAssigneesChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| (Event & { target: { value: string[]; name: string } })
	) => {
		setFormData((prev) => ({
			...prev,
			assignees: event.target.value as string[],
		}));
		setError(null);
	};

	const handleParentTaskChange = (e: SelectChangeEvent<string>) => {
		const selectedTaskId = e.target.value;
		setError(null);

		if (selectedTaskId) {
			const selectedTask = tasks.find((t) => t.id === selectedTaskId);
			if (selectedTask) {
				// Check if selected task is a subtask
				if (selectedTask.parent_id) {
					setError(
						"The selected task is a subtask and cannot be assigned to another subtask"
					);
					setFormData((prev) => ({
						...prev,
						parent_id: "",
					}));
					return;
				}

				// Check if selected task's sprint matches the current sprint
				if (
					formData.sprint_id &&
					selectedTask.sprint_id !== formData.sprint_id
				) {
					setError("Parent task must be in the same sprint as the new task");
					return;
				}

				setSelectedParent(selectedTask);
				setFormData((prev) => ({
					...prev,
					parent_id: selectedTaskId,
				}));
			}
		} else {
			setSelectedParent(null);
			setFormData((prev) => ({
				...prev,
				parent_id: undefined,
			}));
		}
	};

	const handleSprintChange = (e: SelectChangeEvent<string>) => {
		const sprintId = e.target.value;
		setError(null);

		// If there's a selected parent task, check if it's in the same sprint
		if (selectedParent && sprintId && selectedParent.sprint_id !== sprintId) {
			setError("Parent task must be in the same sprint as the new task");
			return;
		}

		handleChange(e);
	};

	const handleEstimatedHoursChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value;
		// Allow empty value for initial state
		if (value === "") {
			setFormData((prev) => ({
				...prev,
				estimated_hours: undefined,
			}));
			return;
		}

		// Replace comma with dot and ensure only one decimal point
		const sanitizedValue = value.replace(",", ".");
		if (/^\d*\.?\d*$/.test(sanitizedValue)) {
			setFormData((prev) => ({
				...prev,
				estimated_hours:
					sanitizedValue === "" ? undefined : Number(sanitizedValue),
			}));
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<form onSubmit={handleSubmit}>
				<DialogTitle>
					{isUpdate ? "Update Task" : "Create New Task"}
				</DialogTitle>
				<DialogContent>
					<Box display="flex" flexDirection="column" gap={2} mt={1}>
						{error && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{error}
							</Alert>
						)}

						<TextField
							name="subject"
							label="Subject"
							value={formData.subject}
							onChange={handleChange}
							required
							fullWidth
							error={!!error && error.includes("Subject")}
							helperText={error && error.includes("Subject") ? error : ""}
						/>

						<FormControl
							fullWidth
							required
							error={!!error && error.includes("Sprint")}
							data-testid="sprint-select"
						>
							<InputLabel>Sprint</InputLabel>
							<Select
								name="sprint_id"
								value={formData.sprint_id}
								onChange={handleSprintChange}
								label="Sprint"
							>
								{sprints.map((sprint) => (
									<MenuItem key={sprint.id} value={sprint.id}>
										{sprint.name}
									</MenuItem>
								))}
							</Select>
							{error && error.includes("Sprint") && (
								<FormHelperText>{error}</FormHelperText>
							)}
						</FormControl>

						<FormControl
							fullWidth
							error={!!error && error.includes("Parent task")}
						>
							<InputLabel>Parent Task</InputLabel>
							<Select
								name="parent_id"
								value={formData.parent_id || ""}
								onChange={handleParentTaskChange}
								label="Parent Task"
							>
								<MenuItem value="">
									<em>None (Create as Parent Task)</em>
								</MenuItem>
								{tasks.map((task) => {
									const isSubtask =
										task.parent_id !== undefined && task.parent_id !== null;
									return (
										<MenuItem
											key={task.id}
											value={task.id}
											sx={isSubtask ? { color: "text.secondary" } : {}}
										>
											{task.subject} {isSubtask ? " (sub task)" : ""}
										</MenuItem>
									);
								})}
							</Select>
							{error && error.includes("Parent task") && (
								<FormHelperText>{error}</FormHelperText>
							)}
						</FormControl>

						<TextField
							name="estimated_hours"
							label="Estimated Hours"
							type="text"
							value={
								formData.estimated_hours === undefined
									? ""
									: formData.estimated_hours
							}
							onChange={handleEstimatedHoursChange}
							required
							error={!!error && error.includes("Estimated hours")}
							helperText={
								error && error.includes("Estimated hours") ? error : ""
							}
							inputProps={{
								inputMode: "decimal",
								pattern: "^\\d*\\.?\\d*$",
								step: "0.5",
							}}
							fullWidth
						/>

						<FormControl
							fullWidth
							required
							error={!!error && error.includes("Status")}
							data-testid="status-select"
						>
							<InputLabel>Status</InputLabel>
							<Select
								name="status"
								value={formData.status}
								onChange={handleChange}
								label="Status"
							>
								{STATUS_OPTIONS.map((status) => (
									<MenuItem key={status} value={status}>
										{status}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl
							fullWidth
							required
							error={!!error && error.includes("assignee")}
						>
							<InputLabel>Assignees</InputLabel>
							<Select
								multiple
								name="assignees"
								value={formData.assignees}
								onChange={handleAssigneesChange}
								input={<OutlinedInput label="Assignees" />}
								renderValue={(selected) => (
									<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
										{selected.map((value) => (
											<Chip key={value} label={value} />
										))}
									</Box>
								)}
								MenuProps={MenuProps}
							>
								{["User 1", "User 2", "User 3"].map((user) => (
									<MenuItem key={user} value={user}>
										{user}
									</MenuItem>
								))}
							</Select>
							{error && error.includes("assignee") && (
								<FormHelperText>{error}</FormHelperText>
							)}
						</FormControl>

						<Box sx={{ width: "100%" }}>
							<Editor
								apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
								value={formData.description}
								onEditorChange={(content) =>
									setFormData((prev) => ({
										...prev,
										description: content,
									}))
								}
								init={{
									height: 300,
									menubar: false,
									plugins: [
										"advlist",
										"autolink",
										"lists",
										"link",
										"image",
										"charmap",
										"preview",
										"anchor",
										"searchreplace",
										"visualblocks",
										"code",
										"fullscreen",
										"insertdatetime",
										"media",
										"table",
										"code",
										"help",
										"wordcount",
									],
									toolbar:
										"undo redo | blocks | " +
										"bold italic forecolor | alignleft aligncenter " +
										"alignright alignjustify | bullist numlist outdent indent | " +
										"removeformat | help",
									content_style:
										"body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }",
								}}
							/>
							{error && error.includes("Description") && (
								<FormHelperText error sx={{ ml: 1, mt: 0.5 }}>
									{error}
								</FormHelperText>
							)}
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button type="submit" variant="contained" color="primary">
						{isUpdate ? "Update Task" : "Create Task"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};
