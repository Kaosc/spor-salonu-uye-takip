import { StackActions } from "@react-navigation/native"
import { BackHandler, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { Trans, useTranslation } from "react-i18next"
import { useMMKVBoolean } from "react-native-mmkv"
import { useSelector } from "react-redux"
import { Image } from "expo-image"

import ThemedText from "../components/ui/ThemedText"

import { openPrivacyPolicy, openTermsOfService } from "../lib/links"

export default function ConsentScreen({ navigation }: { navigation: any }) {
	const { darkMode, lang } = useSelector((state: RootState) => state.settings)
	const [_, setIsPoliciesAccepted] = useMMKVBoolean("consentAccepted")
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const handleOnReject = () => {
		BackHandler.exitApp()
	}

	const handleOnAccept = () => {
		setIsPoliciesAccepted(true)
		navigation.dispatch(StackActions.replace("Tabs"))
	}

	return (
		<View style={styles.container}>
			{/* Logo at top */}
			<View style={styles.logoContainer}>
				<Image
					source={darkMode ? require("../assets/logow.png") : require("../assets/logob.png")}
					style={styles.logo}
				/>
			</View>

			{/* Policy text in middle */}
			<ScrollView
				style={styles.textContainer}
				contentContainerStyle={styles.textContent}
			>
				<ThemedText style={styles.heading}>{t("consentTitle")}</ThemedText>
				<ThemedText style={styles.paragraph}>
					<Trans
						i18nKey="consentMessage"
						components={{
							terms: (
								<ThemedText
									style={styles.link}
									onPress={() => openTermsOfService(lang)}
								/>
							),
							privacy: (
								<ThemedText
									style={styles.link}
									onPress={() => openPrivacyPolicy(lang)}
								/>
							),
						}}
					/>
				</ThemedText>
			</ScrollView>

			{/* Buttons at bottom */}
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={[styles.button, styles.acceptButton]}
					onPress={handleOnAccept}
				>
					<ThemedText style={styles.acceptButtonText}>{t("acceptContinue")}</ThemedText>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.button, styles.rejectButton]}
					onPress={handleOnReject}
				>
					<ThemedText style={styles.rejectButtonText}>{t("rejectExit")}</ThemedText>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			paddingHorizontal: 20,
		},
		logoContainer: {
			alignItems: "center",
			marginTop: 40,
			marginBottom: 30,
		},
		logo: {
			width: 140,
			height: 140,
			borderRadius: 20,
			marginBottom: 20,
			borderWidth: darkMode ? 0 : 1,
			borderColor: "#ccc",
			borderBottomWidth: darkMode ? 0 : 2,
		},
		title: {
			fontSize: 24,
			fontWeight: "bold",
		},
		textContainer: {
			flex: 1,
			marginBottom: 20,
		},
		textContent: {
			paddingHorizontal: 10,
		},
		heading: {
			fontSize: 23,
			fontWeight: "bold",
			marginBottom: 20,
			textAlign: "center",
		},
		paragraph: {
			fontSize: 18,
			lineHeight: 24,
			marginBottom: 16,
			textAlign: "center",
			opacity: 0.8,
		},
		link: {
			fontSize: 18,
			lineHeight: 24,
			color: darkMode ? "#ffffff" : "#000000",
			textDecorationLine: "underline",
			fontWeight: "bold",
		},
		buttonContainer: {
			gap: 12,
			paddingBottom: 20,
		},
		button: {
			paddingVertical: 15,
			paddingHorizontal: 24,
			borderRadius: 12,
			alignItems: "center",
		},
		acceptButton: {
			backgroundColor: darkMode ? "#dfdfdf" : "#0e0e0e",
		},
		rejectButton: {
			backgroundColor: darkMode ? "#292929" : "#dfdfdf",
		},
		acceptButtonText: {
			color: darkMode ? "#000" : "#ffffff",
			fontSize: 18,
			fontWeight: "bold",
		},
		rejectButtonText: {
			fontSize: 16,
			fontWeight: "600",
		},
	})
