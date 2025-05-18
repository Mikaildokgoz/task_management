import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskForm } from "../TaskForm";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "../../../features/task/taskSlice";

// Create mock store
const store = configureStore({
	reducer: {
		task: taskReducer,
	},
});

describe("TaskForm", () => {
	const mockProps = {
		open: true,
		onClose: vi.fn(),
		sprints: [],
		tasks: [],
		isUpdate: false,
	};

	it("renders form elements correctly", () => {
		render(
			<Provider store={store}>
				<TaskForm {...mockProps} />
			</Provider>
		);

		// Check if form elements exist
		expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();

		// Check select components using data-testid
		const sprintSelect = screen.getByTestId("sprint-select");
		expect(sprintSelect).toBeInTheDocument();
		expect(sprintSelect.querySelector("label")).toHaveTextContent(/sprint/i);

		const statusSelect = screen.getByTestId("status-select");
		expect(statusSelect).toBeInTheDocument();
		expect(statusSelect.querySelector("label")).toHaveTextContent(/status/i);

		// Check estimated hours input
		expect(screen.getByLabelText(/estimated hours/i)).toBeInTheDocument();
	});
});
