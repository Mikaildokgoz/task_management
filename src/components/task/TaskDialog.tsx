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
} from "@mui/material";
import { useEffect, useState } from "react";
import type { Task, TaskStatus } from "../../types/task";
import { useAppDispatch } from "../../hooks/redux";
import { updateTask } from "../../features/tasks/taskSlice";

interface TaskDialogProps {
	open: boolean;
	onClose: () => void;
	task: Task;
}

export const TaskDialog = ({ open, onClose, task }: TaskDialogProps) => {
	const dispatch = useAppDispatch();
	const [formData, setFormData] = useState({
		subject: task.subject || "",
		description: task.description || "",
		status: task.status || ("Open" as TaskStatus),
		estimated_hours: task.estimated_hours || 0,
	});

	useEffect(() => {
		setFormData({
			subject: task.subject || "",
			description: task.description || "",
			status: task.status || ("Open" as TaskStatus),
			estimated_hours: task.estimated_hours || 0,
		});
	}, [task]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await dispatch(
			updateTask({
				id: task.id,
				...formData,
			})
		);
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<form onSubmit={handleSubmit}>
				<DialogTitle>Update Task</DialogTitle>
				<DialogContent>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
						<TextField
							label="Subject"
							value={formData.subject}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, subject: e.target.value }))
							}
							required
							fullWidth
						/>

						<TextField
							label="Description"
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							required
							fullWidth
							multiline
							rows={4}
						/>

						<FormControl fullWidth required>
							<InputLabel>Status</InputLabel>
							<Select
								value={formData.status}
								label="Status"
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										status: e.target.value as TaskStatus,
									}))
								}
							>
								<MenuItem value="Open">Open</MenuItem>
								<MenuItem value="Working">Working</MenuItem>
								<MenuItem value="Completed">Completed</MenuItem>
							</Select>
						</FormControl>

						<TextField
							label="Estimated Hours"
							type="number"
							value={formData.estimated_hours}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									estimated_hours: parseInt(e.target.value) || 0,
								}))
							}
							required
							fullWidth
							inputProps={{ min: 0 }}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button type="submit" variant="contained" color="primary">
						Update
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};
