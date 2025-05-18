import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from "react-router-dom";
import { AuthPage } from "../components/auth/AuthPage";
import { Dashboard } from "../components/dashboard/Dashboard";
import { Layout } from "../components/layout/Layout";
import { useAppSelector } from "../hooks/store";
import { ResetPasswordForm } from "../components/auth/ResetPasswordForm";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAppSelector((state) => state.auth);

	if (!user) {
		return <Navigate to="/auth" replace />;
	}

	return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAppSelector((state) => state.auth);

	if (user) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

// Special route for password reset that won't redirect even if there's a session
const ResetPasswordRoute = ({ children }: { children: React.ReactNode }) => {
	return <>{children}</>;
};

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<ProtectedRoute>
				<Dashboard />
			</ProtectedRoute>
		),
	},
	{
		path: "/auth",
		element: (
			<PublicRoute>
				<AuthPage />
			</PublicRoute>
		),
	},
	{
		path: "/reset-password",
		element: (
			<ResetPasswordRoute>
				<ResetPasswordForm />
			</ResetPasswordRoute>
		),
	},
]);

export const AppRouter = () => {
	return <RouterProvider router={router} />;
};
