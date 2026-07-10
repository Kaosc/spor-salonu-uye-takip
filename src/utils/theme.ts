import { DarkTheme, DefaultTheme } from "@react-navigation/native"

export const NavigatorLight: ReactNavigation.Theme = {
	...DefaultTheme,
	dark: false,
	colors: {
		primary: "#000000",
		background: "#ffffff",
		card: "#ffffff",
		text: "#000000",
		border: "#313131",
		notification: "rgb(144, 110, 238)",
	},
}

export const NavigatorDark: ReactNavigation.Theme = {
	...DarkTheme,
	dark: true,
	colors: {
		primary: "#ffffff",
		background: "#000000",
		card: "#000000",
		text: "#ffffff",
		border: "#696969",
		notification: "rgb(144, 110, 238)",
	},
}

export const Theme = {
	dark: {
		background: "#000000",
		cardBackground: "#111111",
		text: "#ffffff",
		border: "#333333",
		green: {
			background: "#1f492d",
			foreground: "#27f08b",
		},
		red: {
			background: "#3a1a1a",
			foreground: "#ff6b6b",
		},
	},
	light: {
		background: "#ffffff",
		cardBackground: "#f5f5f5",
		text: "#000000",
		border: "#c9c9c9",
		green: {
			background: "#b5ffb3",
			foreground: "#0b8b4b",
		},
		red: {
			background: "#ffdae0",
			foreground: "#c62828",
		},
	},
}
