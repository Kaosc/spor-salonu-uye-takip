import { DefaultTheme, DarkTheme as NavDarkTheme } from "@react-navigation/native"

export const LightTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: "#835db3",
		background: "#FFFFFF",
		card: "#F5F5F5",
		text: "#000000",
		border: "#E0E0E0",
		notification: "#B00020",
	},
	dark: false,
}

export const DarkTheme = {
	...NavDarkTheme,
	colors: {
		...NavDarkTheme.colors,
		primary: "#8f68be",
		background: "#000000",
		card: "#111111",
		text: "#FFFFFF",
		border: "#272727",
		notification: "#FF80AB",
	},
	dark: true,
}
