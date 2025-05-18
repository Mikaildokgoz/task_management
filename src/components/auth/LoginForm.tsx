import { useState } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Alert,
	CircularProgress,
	IconButton,
	InputAdornment,
	Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { login, clearError } from "../../features/auth/authSlice";
import { Link as RouterLink } from "react-router-dom";

const validationSchema = yup.object({
	email: yup
		.string()
		.email("Please enter a valid email address")
		.required("Email is required"),
	password: yup
		.string()
		.min(6, "Password must be at least 6 characters")
		.required("Password is required"),
});

interface LoginFormProps {
	onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
	const dispatch = useAppDispatch();
	const { isLoading, error } = useAppSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);

	const handleTogglePassword = () => {
		setShowPassword((prev) => !prev);
	};

	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema,
		onSubmit: async (values) => {
			try {
				await dispatch(login(values)).unwrap();
				onSuccess?.();
			} catch {
				// Error is handled by the slice
			}
		},
	});

	return (
		<Box
			component="form"
			onSubmit={formik.handleSubmit}
			sx={{
				display: "flex",
				flexDirection: "column",
				gap: 2,
				width: "100%",
				maxWidth: 400,
				mx: "auto",
				p: 3,
			}}
		>
			<Typography variant="h5" component="h1" align="center" gutterBottom>
				Login
			</Typography>

			{error && (
				<Alert severity="error" onClose={() => dispatch(clearError())}>
					{error}
				</Alert>
			)}

			<TextField
				fullWidth
				id="email"
				name="email"
				label="Email"
				type="email"
				value={formik.values.email}
				onChange={formik.handleChange}
				onBlur={formik.handleBlur}
				error={formik.touched.email && Boolean(formik.errors.email)}
				helperText={formik.touched.email && formik.errors.email}
			/>

			<TextField
				fullWidth
				id="password"
				name="password"
				label="Password"
				type={showPassword ? "text" : "password"}
				value={formik.values.password}
				onChange={formik.handleChange}
				onBlur={formik.handleBlur}
				error={formik.touched.password && Boolean(formik.errors.password)}
				helperText={formik.touched.password && formik.errors.password}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							<IconButton
								aria-label="toggle password visibility"
								onClick={handleTogglePassword}
								edge="end"
							>
								{showPassword ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						</InputAdornment>
					),
				}}
			/>

			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<Link
					component={RouterLink}
					to="/reset-password"
					variant="body2"
					sx={{ textDecoration: "none" }}
				>
					Forgot Password?
				</Link>
			</Box>

			<Button
				type="submit"
				variant="contained"
				fullWidth
				disabled={isLoading}
				sx={{ mt: 2 }}
			>
				{isLoading ? <CircularProgress size={24} /> : "Login"}
			</Button>
		</Box>
	);
};
