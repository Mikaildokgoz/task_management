import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import sprintReducer from "../features/sprint/sprintSlice";
import taskReducer from "../features/task/taskSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		sprint: sprintReducer,
		task: taskReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
