import { useEffect, useRef } from "react"
import { TouchableOpacity, StyleSheet, Modal, View, Dimensions } from "react-native"
import { Image } from "expo-image"
import { useSelector } from "react-redux"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import ThemedIcon from "./ui/ThemedIcon"
import ThemedText from "./ui/ThemedText"

import { Theme } from "../utils/theme"
import { checkInMember } from "../lib/firebase/firestore/checkin"
import { incrementMemberCheckInCount } from "../lib/firebase/firestore/member"
import { assignLockerToUser } from "../lib/firebase/firestore/lockers"

type QRScannerViewProps = {
	onClose: () => void
	action: QRScannerAction
}

export default function QRScannerView({ onClose, action }: QRScannerViewProps) {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { uid } = useSelector((state: RootState) => state.auth)
	const insets = useSafeAreaInsets()
	const { t } = useTranslation()

	const [permission, requestPermission] = useCameraPermissions()
	const scanned = useRef(false)

	const styles = createStyles(darkMode)

	useEffect(() => {
		requestPermission()
	}, [])

	const handleOnQrScanned = async (result: any) => {
		if (result?.data && !scanned.current) {
			scanned.current = true

			const memberQrData: CheckInQRData = JSON.parse(result.data)
			let checkInSucces = false

			if (action === "CHECK_IN") {
				const checkedIn = await checkInMember(memberQrData)

				if (checkedIn) {
					const incremented = await incrementMemberCheckInCount(memberQrData.memberUid)
					if (incremented) {
						toast.show(t("checkin_success"), {
							type: "success",
						})
						checkInSucces = true
					}
				}

				if (!checkInSucces) {
					toast.show(t("checkin_failed"), {
						type: "danger",
					})
				}
			}

			if (action === "VIEW_MEMBER") {
				setTimeout(() => {
					navigation.navigate("MemberDetailsScreen", { memberId: memberQrData.memberUid })
				}, 500)
			}

			const lockerId: string = result.data

			if (action === "ASSIGN_LOCKER") {
				try {
					if (!uid) return
					await assignLockerToUser(uid, parseInt(lockerId))
					toast.show(t("locker_assigned_success"), { type: "success" })
				} catch (e: any) {
					if (e.message) {
						toast.show(t(e.message), { type: "danger", duration: 7000 })
					}
				}
			}

			onClose()
		}
	}

	return (
		<Modal
			animationType="slide"
			transparent
			visible={true}
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
