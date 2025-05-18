import React, { useState } from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import {
	Box,
	Typography,
	Chip,
	Card,
	CardContent,
	Menu,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from "@mui/material";
import {
	ExpandMore as ExpandMoreIcon,
	ChevronRight as ChevronRightIcon,
	AccessTime as AccessTimeIcon,
	FiberNew as FiberNewIcon,
	Build as BuildIcon,
	CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import type { Task } from "../../types/task";
import type { Sprint } from "../../types/sprint";
import { TaskForm } from "./TaskForm";
import { useAppDispatch } from "../../hooks/redux";
import {
	deleteTask,
	fetchTasksBySprintId,
} from "../../features/task/taskSlice";

interface TaskListProps {
	tasks: Task[];
	sprints: Sprint[];
}

const getStatusColor = (
	status: string
): "info" | "warning" | "success" | "default" => {
	switch (status) {
		case "Open":
			return "info";
		case "Working":
			return "warning";
		case "Completed":
			return "success";
		default:
			return "default";
	}
};

const getStatusIcon = (status: string): React.ReactElement | undefined => {
	switch (status) {
		case "Open":
			return <FiberNewIcon fontSize="small" />;
		case "Working":
			return <BuildIcon fontSize="small" />;
		case "Completed":
			return <CheckCircleIcon fontSize="small" />;
		default:
			return undefined;
	}
};

const calculateTotalHours = (task: Task): number => {
	if (task.children && task.children.length > 0) {
		return task.children.reduce((total, child) => {
			return total + (child.estimated_hours || 0);
		}, 0);
	}
	return task.estimated_hours || 0;
};

const TaskTreeItem: React.FC<{
	task: Task;
	sprints: Sprint[];
	tasks: Task[];
}> = ({ task, sprints, tasks }) => {
	const dispatch = useAppDispatch();
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
	} | null>(null);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
		setContextMenu({
			mouseX: event.clientX - 2,
			mouseY: event.clientY - 4,
		});
	};

	const handleClose = () => {
		setContextMenu(null);
	};

	const handleUpdate = () => {
		setIsUpdateModalOpen(true);
		handleClose();
	};

	const handleDelete = async () => {
		try {
			await dispatch(deleteTask(task.id)).unwrap();
			// After successful deletion, fetch updated tasks for the sprint
			if (task.sprint_id) {
				await dispatch(
					fetchTasksBySprintId({ sprintId: task.sprint_id })
				).unwrap();
			}
		} catch (error) {
			console.error("Failed to delete task:", error);
		}
		handleClose();
		setIsDeleteDialogOpen(false);
	};

	return (
		<>
			<TreeItem
				itemId={task.id}
				label={
					<Card
						variant="outlined"
						sx={{ mb: 1, width: "100%" }}
						onContextMenu={handleContextMenu}
					>
						<CardContent sx={{ "&:last-child": { pb: 2 } }}>
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
							>
								<Box>
									<Typography variant="h6">{task.subject}</Typography>
									{task.description && (
										<Typography variant="body2" color="text.secondary">
											<div
												dangerouslySetInnerHTML={{ __html: task.description }}
											/>
										</Typography>
									)}
								</Box>
								<Box display="flex" alignItems="center" gap={1}>
									<Box display="flex" alignItems="center">
										<AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
										<Typography variant="body2">
											{calculateTotalHours(task)}h
										</Typography>
									</Box>
									<Chip
										label={task.status}
										color={getStatusColor(task.status)}
										size="small"
										icon={getStatusIcon(task.status)}
										sx={{
											"& .MuiChip-icon": {
												color: "inherit",
											},
										}}
									/>
								</Box>
							</Box>
							{task.assignees && task.assignees.length > 0 && (
								<Box mt={1}>
									<Typography variant="body2" color="text.secondary">
										Assignees: {task.assignees.join(", ")}
									</Typography>
								</Box>
							)}
						</CardContent>
					</Card>
				}
			>
				{task.children &&
					task.children.map((child) => (
						<TaskTreeItem
							key={child.id}
							task={child}
							sprints={sprints}
							tasks={tasks}
						/>
					))}
			</TreeItem>

			<Menu
				open={contextMenu !== null}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu !== null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
						: undefined
				}
			>
				<MenuItem onClick={handleUpdate}>Update</MenuItem>
				<MenuItem
					onClick={() => {
						handleClose();
						setIsDeleteDialogOpen(true);
					}}
				>
					Delete
				</MenuItem>
			</Menu>

			<TaskForm
				open={isUpdateModalOpen}
				onClose={() => setIsUpdateModalOpen(false)}
				task={task}
				isUpdate={true}
				sprints={sprints}
				tasks={tasks}
			/>

			<Dialog
				open={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
			>
				<DialogTitle>Delete Task</DialogTitle>
				<DialogContent>
					Are you sure you want to delete this task? This action cannot be
					undone.
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleDelete} color="error">
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, sprints }) => {
	return (
		<SimpleTreeView
			slots={{
				expandIcon: ChevronRightIcon,
				collapseIcon: ExpandMoreIcon,
			}}
			sx={{ width: "100%" }}
			aria-label="task hierarchy"
		>
			{tasks.map((task) => (
				<TaskTreeItem
					key={task.id}
					task={task}
					sprints={sprints}
					tasks={tasks}
				/>
			))}
		</SimpleTreeView>
	);
};
