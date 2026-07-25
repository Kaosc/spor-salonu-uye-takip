import { useEffect, useRef, useState } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, BackHandler } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import QRCode from "react-native-qrcode-svg"
import { useTranslation } from "react-i18next"
import { useNavigation, NavigationProp } from "@react-navigation/native"

import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import CustomHeader from "../components/CustomHeader"
import QRScannerView from "../components/QRScannerView"
import SettingsButton from "../components/SettingsButton"
import QRCodeModal from "../components/QRCodeModal"

import { logout } from "../store/features/authSlice"

import { logoutUser } from "../lib/firebase/auth"
import { getStaffUserById } from "../lib/firebase/firestore/users"

import { moderateScale } from "../utils/responsive"
import { Theme } from "../utils/theme"

export default function DashboardScreen() {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { uid, role } = useSelector((state: RootState) => state.auth)

	const theme = Theme[darkMode ? "dark" : "light"]

	const dispatch = useDispatch<any>()
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
	const [loading, setLoading] = useState(true)
	const [qrModalVisible, setQrModalVisible] = useState(false)
	const [scannerModalVisible, setScannerModalVisible] = useState(false)

	const qrAction = useRef<QRScannerAction>("VIEW_MEMBER")

	useEffect(() => {
		const backAction = () => {
			BackHandler.exitApp()
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	useEffect(() => {
		if (!uid) return

		setLoading(true)
		getStaffUserById(uid)
			.then((user) => setStaffUser(user))
			.catch(() => {})
			.finally(() => setLoading(false))
	}, [uid])

	const handleLogout = async () => {
		await logoutUser()
		dispatch(logout())
		navigation.reset({
			index: 0,
			routes: [{ name: "AuthStack" }],
		})
	}

	const handleOnQRModalClose = () => {
		setScannerModalVisible(false)
	}

	if (loading) {
		return (
			<View style={styles.centered}>
				<ThemedActivityIndicator size="large" />
			</View>
		)
	}

	if (!staffUser) {
		return (
			<View style={styles.centered}>
				<ThemedText>User not found</ThemedText>
			</View>
		)
	}

	return (
		<>
			<QRCodeModal
				data={uid}
				visible={qrModalVisible}
				onClose={() => setQrModalVisible(false)}
			/>

			{scannerModalVisible && (
				<QRScannerView
					onClose={handleOnQRModalClose}
					action={qrAction.current}
				/>
			)}

			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
				stickyHeaderIndices={[0]}
			>
				<CustomHeader
					title={t("dashboard")}
					rightComponent={<SettingsButton />}
					showBackButton={false}
				/>

				<View style={styles.profileSection}>
					<View style={styles.avatar}>
						<ThemedIcon
							name="account-badge"
							size={45}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<ThemedText style={styles.name}>
							{staffUser.firstName} {staffUser.lastName}
						</ThemedText>
						<View style={styles.roleBadge}>
							<ThemedText style={styles.roleText}>{staffUser.role}</ThemedText>
						</View>
					</View>
				</View>

				<TouchableOpacity
					style={[styles.staffQrCard, {}]}
					activeOpacity={0.7}
					onPress={() => setQrModalVisible(true)}
				>
					<ThemedText style={styles.qrCardTitle}>{t("staffCard")}</ThemedText>
					<QRCode
						value={staffUser.uid}
						size={moderateScale(35)}
					/>
				</TouchableOpacity>

				<View style={styles.infoCard}>
					<View style={styles.infoRow}>
						<ThemedIcon
							name="email-outline"
							size={20}
						/>
						<ThemedText style={styles.infoText}>{staffUser.email}</ThemedText>
					</View>
					<View style={styles.divider} />
					<View style={styles.infoRow}>
						<ThemedIcon
							name="badge-account-outline"
							size={20}
						/>
						<ThemedText style={styles.infoText}>
							{staffUser.firstName} {staffUser.lastName}
						</ThemedText>
					</View>
					<View style={styles.divider} />
					<View style={styles.infoRow}>
						<ThemedIcon
							name="shield-account-outline"
							size={20}
						/>
						<ThemedText style={styles.infoText}>{staffUser.role}</ThemedText>
					</View>
					<View style={styles.divider} />
					<View style={styles.infoRow}>
						<ThemedIcon
							name={staffUser.isActive ? "check-circle-outline" : "close-circle-outline"}
							size={20}
							color={staffUser.isActive ? theme.green.foreground : theme.red.foreground}
						/>
						<ThemedText
							style={[
								styles.infoText,
								{
									color: staffUser.isActive ? theme.green.foreground : theme.red.foreground,
								},
							]}
						>
							{staffUser.isActive ? t("active") : t("inactive")}
						</ThemedText>
					</View>

					<TouchableOpacity
						onPress={handleLogout}
						style={styles.logoutButton}
					>
						<ThemedText style={styles.logoutText}>{t("logout")}</ThemedText>
						<ThemedIcon
							name="logout"
							size={20}
							color={theme.red.foreground}
						/>
					</TouchableOpacity>
				</View>
							
				<View style={styles.qrActionsContainer}>
					<TouchableOpacity
						style={[
							styles.qrActionButton,
							{
								backgroundColor: theme.green.background,
								borderColor: theme.green.foreground,
							},
						]}
						activeOpacity={0.7}
						onPress={() => {
							qrAction.current = "CHECK_IN"
							setScannerModalVisible(true)
						}}
					>
						<View style={styles.qrCardContent}>
							<ThemedIcon
								name="qrcode-scan"
								size={40}
							/>
							<ThemedText style={styles.qrCardTitle}>{t("userCheckin")}</ThemedText>
						</View>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.qrActionButton,
							{
								backgroundColor: theme.red.background,
								borderColor: theme.red.foreground,
							},
						]}
						activeOpacity={0.7}
						onPress={() => {
							qrAction.current = "CHECK_OUT"
							setScannerModalVisible(true)
						}}
					>
						<View style={styles.qrCardContent}>
							<ThemedIcon
								name="qrcode-scan"
								size={40}
							/>
							<ThemedText style={styles.qrCardTitle}>{t("userCheckout")}</ThemedText>
						</View>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					style={styles.qrCard}
					activeOpacity={0.7}
					onPress={() => {
						qrAction.current = "VIEW_MEMBER"
						setScannerModalVisible(true)
					}}
				>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
						<ThemedIcon
							name="account"
							size={20}
						/>
						<ThemedText style={styles.qrCardTitle}>{t("memberDetails")}</ThemedText>
					</View>
					<ThemedIcon
						name="qrcode-scan"
						size={40}
					/>
				</TouchableOpacity>

				<View style={styles.qrActionsContainer}>
					<TouchableOpacity
						style={[styles.qrActionButton]}
						onPress={() => navigation.navigate("MemberFormScreen")}
					>
						<View style={[styles.qrCardContent, { gap: 5 }]}>
							<ThemedIcon
								name="account-plus"
								size={40}
							/>
							<ThemedText style={styles.qrCardTitle}>{t("addMember")}</ThemedText>
						</View>
					</TouchableOpacity>

					{role === "ADMIN" && (
						<TouchableOpacity
							style={[styles.qrActionButton]}
							onPress={() => navigation.navigate("StaffFormScreen")}
						>
							<View style={[styles.qrCardContent, { gap: 5 }]}>
								<ThemedIcon
									name="account-plus-outline"
									size={40}
								/>
								<ThemedText style={styles.qrCardTitle}>{t("addStaff")}</ThemedText>
							</View>
						</TouchableOpacity>
					)}
				</View>
			</ScrollView>
		</>
	)
}
const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flexGrow: 1,
			gap: 20,
			paddingBottom: 20,
			paddingHorizontal: 10,
		},
		centered: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
		},
		profileSection: {
			flexDirection: "row",
			marginHorizontal: 20,
			alignItems: "center",
			justifyContent: "flex-start",
			gap: 14,
		},
		avatar: {
			width: moderateScale(85),
			height: moderateScale(85),
			borderRadius: 48,
			alignItems: "center",
			justifyContent: "center",
			borderWidth: 2,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
			borderBottomWidth: 4,
		},
		name: {
			fontSize: 24,
			fontWeight: "700",
			marginBottom: 8,
		},
		roleBadge: {
			paddingHorizontal: 16,
			paddingVertical: 4,
			borderRadius: 12,
			alignSelf: "flex-start",
			backgroundColor: darkMode ? "#fff" : "#000",
		},
		roleText: {
			fontSize: 13,
			fontWeight: "bold",
			letterSpacing: 0.5,
			textTransform: "uppercase",
			color: darkMode ? "#000" : "#fff",
		},
		infoCard: {
			borderRadius: 16,
			padding: 20,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
		},
		infoRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			paddingVertical: 12,
		},
		infoText: {
			fontSize: 15,
			flex: 1,
		},
		divider: {
			height: 1,
			backgroundColor: theme.border,
		},
		staffQrCard: {
			gap: 10,
			borderRadius: 16,
			paddingHorizontal: 20,
			paddingVertical: 15,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		qrCard: {
			alignItems: "center",
			flexDirection: "row",
			justifyContent: "space-between",
			borderRadius: 16,
			paddingHorizontal: 30,
			paddingLeft: 20,
			paddingVertical: 20,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
		},
		qrCardContent: {
			gap: 10,
			alignItems: "center",
			justifyContent: "center",
		},
		qrCardTitle: {
			fontSize: 15,
			fontWeight: "700",
			textAlign: "center",
		},
		logoutButton: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "flex-end",
			gap: 10,
			marginBottom: -5,
			marginTop: -10,
		},
		logoutText: {
			fontSize: 16,
			fontWeight: "bold",
			color: theme.red.foreground,
		},
		qrActionsContainer: {
			flexDirection: "row",
			justifyContent: "space-between",
			gap: 20,
		},
		qrActionButton: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 16,
			padding: 20,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
		},
	})
}
