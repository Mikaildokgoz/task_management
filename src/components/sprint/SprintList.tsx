import { useEffect, useState } from "react";
import {
	Box,
	Button,
	Card,
	Typography,
	CircularProgress,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Alert,
	Snackbar,
	Container,
} from "@mui/material";
import {
	Add as AddIcon,
	ExpandMore as ExpandMoreIcon,
	Task as TaskIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchSprints, clearError } from "../../features/sprint/sprintSlice";
import { fetchTasksBySprintId } from "../../features/task/taskSlice";
import { SprintForm } from "./SprintForm";
import { TaskForm } from "../task/TaskForm";
import { TaskList } from "../task/TaskList";
import type { Task } from "../../types/task";

const TASKS_PER_PAGE = 5;

interface SprintTaskPagination {
	[sprintId: string]: {
		currentPage: number;
	};
}

const formatDate = (dateString: string) => {
	if (!dateString) return "N/A";

	try {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	} catch {
		return "N/A";
	}
};

export const SprintList = () => {
	const [isSprintFormOpen, setIsSprintFormOpen] = useState(false);
	const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
	const [showNoSprintAlert, setShowNoSprintAlert] = useState(false);
	const [pagination, setPagination] = useState<SprintTaskPagination>({});

	const dispatch = useAppDispatch();
	const {
		sprints,
		isLoading: sprintsLoading,
		error: sprintsError,
	} = useAppSelector((state) => state.sprint);
	const { tasksBySprintId, isLoading: tasksLoading } = useAppSelector(
		(state) => state.task
	);

	useEffect(() => {
		dispatch(fetchSprints());
	}, [dispatch]);

	useEffect(() => {
		if (sprints.length > 0) {
			// Initialize pagination state for each sprint
			const initialPagination: SprintTaskPagination = {};
			sprints.forEach((sprint) => {
				dispatch(fetchTasksBySprintId({ sprintId: sprint.id }));
				initialPagination[sprint.id] = {
					currentPage: 1,
				};
			});
			setPagination(initialPagination);
		}
	}, [dispatch, sprints]);

	const handleTaskButtonClick = () => {
		if (sprints.length === 0) {
			setShowNoSprintAlert(true);
		} else {
			setIsTaskFormOpen(true);
		}
	};

	const getParentTasks = (sprintId: string): Task[] => {
		const tasks = tasksBySprintId[sprintId] || [];
		return tasks.filter((task) => !task.parent_id); // Sadece üst görevleri al
	};

	const handleLoadMore = (sprintId: string) => {
		const currentPagination = pagination[sprintId];
		setPagination({
			...pagination,
			[sprintId]: {
				currentPage: currentPagination.currentPage + 1,
			},
		});
	};

	const getVisibleTasks = (sprintId: string): Task[] => {
		const allTasks = tasksBySprintId[sprintId] || [];
		const parentTasks = getParentTasks(sprintId);
		const currentPagination = pagination[sprintId];

		if (!currentPagination) return allTasks;

		// Görüntülenecek üst görevleri al
		const visibleParentTasks = parentTasks.slice(
			0,
			currentPagination.currentPage * TASKS_PER_PAGE
		);

		// Üst görevlerin alt görevlerini de ekle
		const visibleTasksWithChildren = visibleParentTasks.reduce<Task[]>(
			(acc, parentTask) => {
				const children = allTasks.filter(
					(task) => task.parent_id === parentTask.id
				);
				return [...acc, parentTask, ...children];
			},
			[]
		);

		return visibleTasksWithChildren;
	};

	const hasMoreTasks = (sprintId: string): boolean => {
		const parentTasks = getParentTasks(sprintId);
		const currentPagination = pagination[sprintId];
		if (!currentPagination) return false;

		return parentTasks.length > currentPagination.currentPage * TASKS_PER_PAGE;
	};

	const isLoading = sprintsLoading || tasksLoading;

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" p={4} minHeight="100vh">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				bgcolor: "#f5f5f5",
			}}
		>
			<Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
				{sprintsError && (
					<Alert
						severity="error"
						onClose={() => dispatch(clearError())}
						sx={{ mb: 2 }}
					>
						{sprintsError}
					</Alert>
				)}

				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					mb={3}
					width="100%"
				>
					<Button
						variant="contained"
						startIcon={<TaskIcon />}
						onClick={handleTaskButtonClick}
						sx={{ minWidth: 150 }}
					>
						Create Task
					</Button>
					<Button
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={() => setIsSprintFormOpen(true)}
						sx={{ minWidth: 150 }}
					>
						Create Sprint
					</Button>
				</Box>

				<Box display="flex" flexDirection="column" gap={3}>
					{sprints.map((sprint) => (
						<Card
							key={sprint.id}
							sx={{
								width: "100%",
								boxShadow: 2,
								"&:hover": {
									boxShadow: 4,
								},
							}}
						>
							<Accordion defaultExpanded>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									sx={{
										"&:hover": {
											bgcolor: "rgba(0, 0, 0, 0.04)",
										},
									}}
								>
									<Box
										display="flex"
										justifyContent="space-between"
										alignItems="center"
										width="100%"
										pr={2}
									>
										<Box display="flex" alignItems="center" gap={2}>
											<Typography variant="h6">{sprint.name}</Typography>
										</Box>
										<Typography variant="body2" color="text.secondary">
											Created: {formatDate(sprint.created_at)}
										</Typography>
									</Box>
								</AccordionSummary>
								<AccordionDetails>
									<Box>
										<TaskList
											tasks={getVisibleTasks(sprint.id)}
											sprints={sprints}
										/>
										<Box display="flex" justifyContent="center" mt={2}>
											<Button
												variant="outlined"
												onClick={() => handleLoadMore(sprint.id)}
												disabled={!hasMoreTasks(sprint.id)}
											>
												Load More Tasks
											</Button>
										</Box>
									</Box>
								</AccordionDetails>
							</Accordion>
						</Card>
					))}
				</Box>

				<SprintForm
					open={isSprintFormOpen}
					onClose={() => setIsSprintFormOpen(false)}
				/>

				<TaskForm
					open={isTaskFormOpen}
					onClose={() => {
						setIsTaskFormOpen(false);
						sprints.forEach((sprint) => {
							dispatch(fetchTasksBySprintId({ sprintId: sprint.id }));
						});
					}}
					sprints={sprints}
					tasks={Object.values(tasksBySprintId).reduce(
						(allTasks, sprintTasks) => {
							return [
								...allTasks,
								...sprintTasks,
								...sprintTasks.flatMap((task) => task.children || []),
							];
						},
						[]
					)}
				/>

				<Snackbar
					open={showNoSprintAlert}
					autoHideDuration={6000}
					onClose={() => setShowNoSprintAlert(false)}
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				>
					<Alert
						onClose={() => setShowNoSprintAlert(false)}
						severity="warning"
						variant="filled"
						sx={{ width: "100%" }}
					>
						Please create a sprint first before adding tasks.
					</Alert>
				</Snackbar>
			</Container>
		</Box>
	);
};
