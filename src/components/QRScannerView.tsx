import { useEffect } from "react"
import { TouchableOpacity, StyleSheet, Modal, View, Dimensions } from "react-native"
import { Image } from "expo-image"
import { useSelector } from "react-redux"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, NavigationProp } from "@react-navigation/native"

import ThemedIcon from "./ui/ThemedIcon"
import ThemedText from "./ui/ThemedText"

import { Theme } from "../utils/theme"

export default function QRScannerView({ visible, onClose }: { visible: boolean; onClose: () => void }) {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const insets = useSafeAreaInsets()

	const [permission, requestPermission] = useCameraPermissions()

	const styles = createStyles(darkMode)

	useEffect(() => {
		requestPermission()
	}, [visible])

	const handleOnQrScanned = (result: any) => {
		if (result?.data) {
			const uid = result.data
			navigation.navigate("MemberStack", { screen: "MemberDetailsScreen", params: { memberId: uid } })
			onClose()
		}
	}

	return (
		<Modal
			animationType="slide"
			transparent
			visible={visible}
			onRequestClose={onClose}
		>
			<View
				style={[
					styles.container,
					{
						backgroundColor: darkMode ? "#000000" : "#ffffff",
						marginTop: insets.top,
						marginBottom: insets.bottom,
					},
				]}
			>
				{permission?.granted ? (
					<>
						<CameraView
							style={styles.cameraContainer}
							facing="back"
							barcodeScannerSettings={{
								barcodeTypes: ["qr"],
							}}
							onBarcodeScanned={handleOnQrScanned}
						/>

						<View style={styles.overlayContainer}>
							<Image
								source={require("../assets/qr-frame.png")}
								style={styles.scanImage}
								contentFit="contain"
							/>
						</View>
					</>
				) : (
					<View style={styles.overlayContainer}>
						<ThemedIcon
							name="camera-off"
							size={100}
						/>
						<ThemedText>Camera permission is required to scan QR codes.</ThemedText>
					</View>
				)}

				<TouchableOpacity
					onPress={onClose}
					style={[styles.closeButton, { bottom: insets.bottom + 65 }]}
				>
					<ThemedIcon
						name="close"
						size={35}
					/>
				</TouchableOpacity>
			</View>
		</Modal>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
		},

		cameraContainer: {
			flex: 1,
			width: "100%",
			filter: "brightness(0.3)",
			height: "100%",
			zIndex: 100,
		},

		overlayContainer: {
			position: "absolute",
			width: "100%",
			height: "100%",
			alignItems: "center",
			justifyContent: "center",
			zIndex: 101,
		},

		scanImage: {
			width: Dimensions.get("window").width * 0.8,
			height: Dimensions.get("window").width * 0.8,
			opacity: 0.8,
		},

		closeButton: {
			position: "absolute",
			alignSelf: "center",
			zIndex: 102,
			backgroundColor: theme.background,
			borderRadius: 99,
			padding: 5,
		},
	})
}
