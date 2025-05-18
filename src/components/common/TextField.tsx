import { TextField as MuiTextField } from "@mui/material";
import { useField } from "formik";

interface TextFieldProps {
	name: string;
	label: string;
	type?: string;
}

export const TextField = ({ name, label, type = "text" }: TextFieldProps) => {
	const [field, meta] = useField(name);

	return (
		<MuiTextField
			{...field}
			label={label}
			type={type}
			fullWidth
			margin="normal"
			error={meta.touched && Boolean(meta.error)}
			helperText={meta.touched && meta.error}
		/>
	);
};
