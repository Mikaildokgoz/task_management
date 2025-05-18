import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Alert,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { TextField } from "../common/TextField";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { createSprint } from "../../features/sprint/sprintSlice";
import type { CreateSprintDto } from "../../types/sprint";

const validationSchema = Yup.object({
	name: Yup.string().required("Sprint name is required"),
});

const initialValues: CreateSprintDto = {
	name: "",
};

interface SprintFormProps {
	open: boolean;
	onClose: () => void;
}

export const SprintForm = ({ open, onClose }: SprintFormProps) => {
	const dispatch = useAppDispatch();
	const { isLoading, error } = useAppSelector((state) => state.sprint);
	const { user } = useAppSelector((state) => state.auth);

	const handleSubmit = async (values: CreateSprintDto) => {
		if (!user) {
			console.error("User not authenticated");
			return;
		}

		try {
			await dispatch(createSprint(values)).unwrap();
			if (!error) {
				onClose();
			}
		} catch (err) {
			console.error("Failed to create sprint:", err);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Create New Sprint</DialogTitle>
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}
			>
				{({ isSubmitting }) => (
					<Form>
						<DialogContent>
							{error && <Alert severity="error">{error}</Alert>}
							<TextField name="name" label="Sprint Name" />
						</DialogContent>
						<DialogActions>
							<Button onClick={onClose}>Cancel</Button>
							<Button
								type="submit"
								variant="contained"
								disabled={isLoading || isSubmitting || !user}
							>
								{isLoading ? "Creating..." : "Create Sprint"}
							</Button>
						</DialogActions>
					</Form>
				)}
			</Formik>
		</Dialog>
	);
};
