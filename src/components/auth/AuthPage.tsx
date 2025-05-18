import { useState, useEffect } from "react";
import { Box, Tab, Tabs, Paper, Alert } from "@mui/material";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { authService } from "../../services/authService";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`auth-tabpanel-${index}`}
			aria-labelledby={`auth-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

export const AuthPage = () => {
	const [value, setValue] = useState(0);
	const [emailConfirmationStatus, setEmailConfirmationStatus] = useState<{
		success?: boolean;
		message?: string;
	} | null>(null);

	useEffect(() => {
		const checkEmailConfirmation = async () => {
			try {
				const { emailConfirmed } = await authService.handleEmailConfirmation();
				if (emailConfirmed) {
					// Store confirmation status in localStorage
					localStorage.setItem("email-confirmed", "true");

					setEmailConfirmationStatus({
						success: true,
						message: "Email confirmed successfully! Please login to continue.",
					});
					setValue(0); // Switch to login tab

					// Force a page reload to clear any remaining session data
					window.location.reload();
				}
			} catch (error: unknown) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to confirm email. Please try again.";
				setEmailConfirmationStatus({
					success: false,
					message: errorMessage,
				});
			}
		};

		// Check if email was just confirmed
		const wasEmailConfirmed = localStorage.getItem("email-confirmed");
		if (wasEmailConfirmed === "true") {
			setEmailConfirmationStatus({
				success: true,
				message: "Email confirmed successfully! Please login to continue.",
			});
			setValue(0); // Switch to login tab
			localStorage.removeItem("email-confirmed");
		} else {
			checkEmailConfirmation();
		}
	}, []);

	const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	return (
		<Box
			sx={{
				display: "flex",
				minHeight: "100vh",
				width: "100vw",
				maxWidth: "100%",
				overflow: "hidden",
				bgcolor: "background.default",
				backgroundImage: "url('/auth-bg.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				position: "relative",
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "rgba(0, 0, 0, 0.65)",
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					flex: 1,
					position: "relative",
					zIndex: 1,
					width: "100%",
					maxWidth: "100%",
					overflow: "hidden",
				}}
			>
				{/* Welcome message section */}
				<Box
					sx={{
						flex: { xs: "0 0 100%", md: "1 1 60%" },
						display: { xs: "none", md: "flex" },
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "flex-start",
						p: { xs: 3, md: 6 },
						color: "white",
					}}
				>
					<Box sx={{ maxWidth: "600px" }}>
						<h1
							style={{
								fontSize: "3rem",
								marginBottom: "1.5rem",
								fontWeight: 300,
								letterSpacing: "0.5px",
							}}
						>
							Welcome to Task Management System
						</h1>
						<p
							style={{
								fontSize: "1.25rem",
								opacity: 0.9,
								lineHeight: "1.6",
								fontWeight: 300,
							}}
						>
							Organize your projects, manage your tasks and collaborate with
							your team.
						</p>
					</Box>
				</Box>

				{/* Auth forms section */}
				<Box
					sx={{
						flex: { xs: "1 1 100%", md: "1 1 40%" },
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						p: { xs: 2, md: 3 },
					}}
				>
					<Paper
						elevation={24}
						sx={{
							width: "100%",
							maxWidth: { xs: "100%", sm: "450px" },
							bgcolor: "background.paper",
							borderRadius: 2,
							overflow: "hidden",
							backdropFilter: "blur(10px)",
							backgroundColor: "rgba(255, 255, 255, 0.95)",
						}}
					>
						{emailConfirmationStatus && (
							<Alert
								severity={emailConfirmationStatus.success ? "success" : "error"}
								sx={{ m: 2 }}
							>
								{emailConfirmationStatus.message}
							</Alert>
						)}

						<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
							<Tabs
								value={value}
								onChange={handleChange}
								aria-label="auth tabs"
								variant="fullWidth"
							>
								<Tab
									label="Login"
									id="auth-tab-0"
									sx={{
										py: 2,
										fontSize: "1rem",
										fontWeight: 500,
									}}
								/>
								<Tab
									label="Register"
									id="auth-tab-1"
									sx={{
										py: 2,
										fontSize: "1rem",
										fontWeight: 500,
									}}
								/>
							</Tabs>
						</Box>

						<Box sx={{ p: 3 }}>
							<TabPanel value={value} index={0}>
								<LoginForm />
							</TabPanel>
							<TabPanel value={value} index={1}>
								<RegisterForm />
							</TabPanel>
						</Box>
					</Paper>
				</Box>
			</Box>
		</Box>
	);
};
