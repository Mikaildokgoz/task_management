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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { register, clearError } from "../../features/auth/authSlice";

const validationSchema = yup.object({
	email: yup
		.string()
		.email("Please enter a valid email address")
		.required("Email is required"),
	password: yup
		.string()
		.min(6, "Password must be at least 6 characters")
		.required("Password is required"),
	firstName: yup
		.string()
		.min(2, "First name must be at least 2 characters")
		.required("First name is required"),
	lastName: yup
		.string()
		.min(2, "Last name must be at least 2 characters")
		.required("Last name is required"),
});

export const RegisterForm = () => {
	const dispatch = useAppDispatch();
	const { isLoading, error } = useAppSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);
	const [showVerificationMessage, setShowVerificationMessage] = useState(false);

	const formik = useFormik({
		initialValues: {
			email: "",
			password: "",
			firstName: "",
			lastName: "",
		},
		validationSchema,
		onSubmit: async (values) => {
			try {
				await dispatch(register(values)).unwrap();
				setShowVerificationMessage(true);
			} catch {
				// Error is handled by the slice
			}
		},
	});

	const handleTogglePassword = () => {
		setShowPassword((prev) => !prev);
	};

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
				Register
			</Typography>

			{error && (
				<Alert severity="error" onClose={() => dispatch(clearError())}>
					{error}
				</Alert>
			)}

			{showVerificationMessage ? (
				<Alert severity="success">
					Registration successful! Please check your email for verification
					link.
				</Alert>
			) : (
				<>
					<TextField
						fullWidth
						id="firstName"
						name="firstName"
						label="First Name"
						value={formik.values.firstName}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.firstName && Boolean(formik.errors.firstName)}
						helperText={formik.touched.firstName && formik.errors.firstName}
					/>

					<TextField
						fullWidth
						id="lastName"
						name="lastName"
						label="Last Name"
						value={formik.values.lastName}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.lastName && Boolean(formik.errors.lastName)}
						helperText={formik.touched.lastName && formik.errors.lastName}
					/>

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

					<Button
						type="submit"
						variant="contained"
						color="primary"
						fullWidth
						disabled={isLoading || !formik.isValid}
						startIcon={
							isLoading && <CircularProgress size={20} color="inherit" />
						}
					>
						{isLoading ? "Registering..." : "Register"}
					</Button>
				</>
			)}
		</Box>
	);
};
