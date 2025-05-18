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
		expect(
			screen.getByRole("combobox", { name: /sprint/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("combobox", { name: /status/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("spinbutton", { name: /estimated hours/i })
		).toBeInTheDocument();
	});
});
