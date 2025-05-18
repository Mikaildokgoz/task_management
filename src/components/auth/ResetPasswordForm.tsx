import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
	Box,
	TextField,
	Button,
	Typography,
	Alert,
	CircularProgress,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import {
	resetPasswordRequest,
	clearError,
} from "../../features/auth/authSlice";
import { supabase } from "../../config/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

const emailValidationSchema = yup.object({
	email: yup
		.string()
		.email("Enter a valid email")
		.required("Email is required"),
});

const passwordValidationSchema = yup.object({
	password: yup
		.string()
		.min(6, "Password must be at least 6 characters")
		.required("Password is required"),
	confirmPassword: yup
		.string()
		.oneOf([yup.ref("password")], "Passwords must match")
		.required("Please confirm your password"),
});

export const ResetPasswordForm = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoading, error } = useAppSelector((state) => state.auth);
	const [resetSent, setResetSent] = useState(false);
	const [isResetMode, setIsResetMode] = useState(false);
	const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		const checkResetToken = async () => {
			// Get the full hash (everything after the first #)
			const fullHash = location.hash.substring(1);

			// If we only have 'recovery', wait for the full token
			if (fullHash === "recovery") {
				return;
			}

			// If we have tokens, they'll be after #recovery#
			if (fullHash.startsWith("recovery#")) {
				const tokensPart = fullHash.substring("recovery#".length);
				const hashParams = new URLSearchParams(tokensPart);

				const accessToken = hashParams.get("access_token");
				const refreshToken = hashParams.get("refresh_token");
				const type = hashParams.get("type");

				if (accessToken && refreshToken && type === "recovery") {
					try {
						// First sign out to clear any existing session
						await supabase.auth.signOut();

						// Then set the new session with the reset tokens
						const { data, error: sessionError } =
							await supabase.auth.setSession({
								access_token: accessToken,
								refresh_token: refreshToken,
							});

						if (sessionError) {
							console.error("Session error:", sessionError);
							setFormError("Invalid or expired reset link. Please try again.");
							return;
						}

						if (data.session) {
							// Clear the URL hash and show password form
							window.history.replaceState(null, "", window.location.pathname);
							setIsResetMode(true);
						}
					} catch (err) {
						console.error("Error setting session:", err);
						setFormError("An error occurred. Please try again.");
					}
				}
			} else if (!location.hash) {
				// If no hash at all, we're in request reset mode
				setIsResetMode(false);
			}
		};

		checkResetToken();
	}, [location.hash]);

	const emailFormik = useFormik({
		initialValues: {
			email: "",
		},
		validationSchema: emailValidationSchema,
		onSubmit: async (values) => {
			try {
				await dispatch(resetPasswordRequest(values.email)).unwrap();
				setResetSent(true);
			} catch {
				// Error is handled by the slice
			}
		},
	});

	const passwordFormik = useFormik({
		initialValues: {
			password: "",
			confirmPassword: "",
		},
		validationSchema: passwordValidationSchema,
		onSubmit: async (values, { setSubmitting }) => {
			try {
				// Get current session to verify we have valid reset token
				const {
					data: { session },
					error: sessionError,
				} = await supabase.auth.getSession();

				if (sessionError || !session) {
					setFormError("Your reset session has expired. Please try again.");
					return;
				}

				const { error: updateError } = await supabase.auth.updateUser({
					password: values.password,
				});

				if (updateError) {
					setFormError(updateError.message);
				} else {
					setPasswordResetSuccess(true);
					// Sign out after successful password reset
					await supabase.auth.signOut();

					// Redirect to login page after a short delay
					setTimeout(() => {
						navigate("/auth");
					}, 1500);
				}
			} catch (err) {
				console.error("Password reset error:", err);
				setFormError("An unexpected error occurred. Please try again.");
			} finally {
				setSubmitting(false);
			}
		},
	});

	// Show the new password form if we're in reset mode (came from reset link)
	if (isResetMode) {
		return (
			<Box
				component="form"
				onSubmit={passwordFormik.handleSubmit}
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
					Set New Password
				</Typography>

				{passwordResetSuccess && (
					<Alert severity="success">
						Password has been reset successfully! Redirecting to login page...
					</Alert>
				)}

				{formError && (
					<Alert severity="error" onClose={() => setFormError(null)}>
						{formError}
					</Alert>
				)}

				<TextField
					fullWidth
					id="password"
					name="password"
					label="New Password"
					type="password"
					value={passwordFormik.values.password}
					onChange={passwordFormik.handleChange}
					onBlur={passwordFormik.handleBlur}
					error={
						passwordFormik.touched.password &&
						Boolean(passwordFormik.errors.password)
					}
					helperText={
						passwordFormik.touched.password && passwordFormik.errors.password
					}
					disabled={passwordResetSuccess}
				/>

				<TextField
					fullWidth
					id="confirmPassword"
					name="confirmPassword"
					label="Confirm New Password"
					type="password"
					value={passwordFormik.values.confirmPassword}
					onChange={passwordFormik.handleChange}
					onBlur={passwordFormik.handleBlur}
					error={
						passwordFormik.touched.confirmPassword &&
						Boolean(passwordFormik.errors.confirmPassword)
					}
					helperText={
						passwordFormik.touched.confirmPassword &&
						passwordFormik.errors.confirmPassword
					}
					disabled={passwordResetSuccess}
				/>

				<Button
					type="submit"
					variant="contained"
					fullWidth
					disabled={passwordFormik.isSubmitting || passwordResetSuccess}
					sx={{ mt: 2 }}
				>
					{passwordFormik.isSubmitting ? (
						<CircularProgress size={24} />
					) : (
						"Set New Password"
					)}
				</Button>
			</Box>
		);
	}

	// Show success message after sending reset email
	if (resetSent) {
		return (
			<Box sx={{ p: 3, textAlign: "center" }}>
				<Alert severity="success" sx={{ mb: 2 }}>
					Password reset instructions have been sent to your email.
				</Alert>
				<Typography variant="body2" color="text.secondary">
					Please check your email for instructions to reset your password.
				</Typography>
			</Box>
		);
	}

	// Show the initial email form
	return (
		<Box
			component="form"
			onSubmit={emailFormik.handleSubmit}
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
				Reset Password
			</Typography>

			<Typography
				variant="body2"
				color="text.secondary"
				align="center"
				sx={{ mb: 2 }}
			>
				Enter your email address and we'll send you instructions to reset your
				password.
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
				value={emailFormik.values.email}
				onChange={emailFormik.handleChange}
				onBlur={emailFormik.handleBlur}
				error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
				helperText={emailFormik.touched.email && emailFormik.errors.email}
			/>

			<Button
				type="submit"
				variant="contained"
				fullWidth
				disabled={isLoading}
				sx={{ mt: 2 }}
			>
				{isLoading ? <CircularProgress size={24} /> : "Send Reset Instructions"}
			</Button>
		</Box>
	);
};
