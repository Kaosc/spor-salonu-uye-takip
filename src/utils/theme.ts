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
