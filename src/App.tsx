import { Provider } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { store } from "./store";
import { theme } from "./theme";
import { AppRouter } from "./routes";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks/redux";
import { getCurrentSession, refreshSession } from "./features/auth/authSlice";

function AppContent() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		// Initial session check
		dispatch(getCurrentSession());

		// Set up session refresh interval
		const refreshInterval = setInterval(() => {
			dispatch(refreshSession());
		}, 4 * 60 * 1000); // Refresh every 4 minutes

		return () => clearInterval(refreshInterval);
	}, [dispatch]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AppRouter />
		</ThemeProvider>
	);
}

function App() {
	return (
		<Provider store={store}>
			<AppContent />
		</Provider>
	);
}

export default App;
