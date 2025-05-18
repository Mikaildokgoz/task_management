import { Box } from "@mui/material";
import { Navbar } from "./Navbar";

interface LayoutProps {
	children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				width: "100vw",
			}}
		>
			<Navbar />
			<Box
				component="main"
				sx={{
					flex: 1,
					bgcolor: "background.default",
					width: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{children}
			</Box>
		</Box>
	);
};
