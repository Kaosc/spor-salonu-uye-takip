import { View, Modal, StyleSheet } from "react-native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import QRCode from "react-native-qrcode-svg"

import ThemedButton from "./ui/ThemedButton"

import { Theme } from "../utils/theme"
import { moderateScale } from "../utils/responsive"

export default function QRCodeModal({ data, visible, onClose }: { data: any; visible: boolean; onClose: () => void }) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()
	const styles = createStyles(darkMode)

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContent}>
					<View style={styles.qrContainer}>
						{data && (
							<QRCode
								value={JSON.stringify(data)}
								size={moderateScale(300)}
								backgroundColor="white"
								color="black"
							/>
						)}
					</View>
					<ThemedButton
						style={styles.closeButton}
						onPress={onClose}
						text={t("close")}
					/>
				</View>
			</View>
		</Modal>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		// Modal
		modalOverlay: {
			flex: 1,
			backgroundColor: "rgba(0,0,0,0.6)",
			justifyContent: "center",
			alignItems: "center",
			padding: moderateScale(15),
		},
		modalContent: {
			width: "100%",
			borderRadius: 20,
			padding: moderateScale(30),
			alignItems: "center",
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
			gap: 50,
		},
		modalTitle: {
			fontSize: 20,
			fontWeight: "700",
			marginBottom: moderateScale(24),
		},
		qrContainer: {
			padding: moderateScale(16),
			borderRadius: 16,
			backgroundColor: "#ffffff",
		},
		qrHint: {
			fontSize: 13,
			opacity: 0.5,
			textAlign: "center",
			marginTop: moderateScale(16),
			marginBottom: moderateScale(24),
		},
		closeButton: {
			width: "100%",
			paddingVertical: moderateScale(14),
			alignItems: "center",
		},
	})
}
