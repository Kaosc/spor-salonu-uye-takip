import { StyleSheet, View } from "react-native"
import { Image } from "expo-image"
import { useSelector } from "react-redux"

import { moderateScale } from "../utils/responsive"
import ThemedActivityIndicator from "./ui/ThemedActivityIndicator"

export default function LoadingView() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const styles = createStyles(darkMode)

	return (
		<View style={styles.container}>
			<Image
				source={darkMode ? require("../assets/logo-transparent-white.png") : require("../assets/logo-transparent-black.png")}
				style={styles.logo}
			/>
			<ThemedActivityIndicator size={50} />
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: 30,
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		logo: {
			width: moderateScale(120),
			height: moderateScale(120),
			borderRadius: 20,
			alignSelf: "center",
		},
	})
}
