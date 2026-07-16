import { useEffect, useState } from "react"
import { View, ScrollView, StyleSheet, BackHandler } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { useNavigation, NavigationProp, StackActions } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import ThemedText from "../../components/ui/ThemedText"
import ThemedIcon from "../../components/ui/ThemedIcon"
import ThemedButton from "../../components/ui/ThemedButton"
import CustomHeader from "../../components/CustomHeader"
import BMIDisplay from "../../components/BMIDisplay"
import DetailsRow from "../../components/DetailsRow"

import { getMemberById } from "../../lib/firebase/firestore/member"
import { logoutUser } from "../../lib/firebase/auth"
import { logout } from "../../store/features/authSlice"

import { BOTTOM_TAB_HEIGHT } from "../../lib/constants"
import { moderateScale } from "../../utils/responsive"
import { Theme } from "../../utils/theme"
import ThemedActivityIndicator from "../../components/ui/ThemedActivityIndicator"

export default function MemberProfileScreen() {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { uid } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const dispatch = useDispatch<any>()

	const theme = Theme[darkMode ? "dark" : "light"]
	const styles = createStyles(darkMode)

	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

	useEffect(() => {
		const backAction = () => {
			navigation.goBack()
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	const handleLogout = async () => {
		await logoutUser()
		dispatch(logout())
		navigation.dispatch(StackActions.replace("AuthStack"))
	}

	const [member, setMember] = useState<Member | null>(null)

	const fetchMember = async () => {
		if (!uid) return

		setStatus("loading")
		const member = await getMemberById(uid)
		setMember(member)
		setStatus("idle")
	}

	useEffect(() => {
		fetchMember()
	}, [])

	if (status === "loading") {
		return (
			<View
				style={[
					styles.container,
					{
						alignItems: "center",
						justifyContent: "center",
					},
				]}
			>
				<ThemedActivityIndicator size={60} />
			</View>
		)
	}

	if (!member) {
		return (
			<View
				style={[
					styles.container,
					{
						alignItems: "center",
						justifyContent: "center",
					},
				]}
			>
				<ThemedIcon
					name="account-off"
					size={80}
				/>
				<View style={styles.scrollContentContainer}>
					<ThemedText>{t("memberNotFound")}</ThemedText>
				</View>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={t("myProfile")}
				showBackButton={false}
			/>

			<ScrollView
				style={styles.scrollContent}
				contentContainerStyle={styles.scrollContentContainer}
				showsVerticalScrollIndicator={false}
			>
				{/* Profile Card */}
				<View style={styles.card}>
					<View style={styles.avatarSection}>
						<ThemedIcon
							name="account-circle"
							size={80}
						/>
						<ThemedText style={styles.fullName}>
							{member.firstName} {member.lastName}
						</ThemedText>
						<View style={styles.roleBadge}>
							<ThemedText style={styles.roleBadgeText}>{t("member")}</ThemedText>
						</View>
					</View>

					<View style={styles.divider} />

					{/* Contact Information */}
					<ThemedText style={styles.sectionTitle}>{t("contactInformation")}</ThemedText>

					<DetailsRow
						iconName="account"
						label={t("name")}
						value={`${member.firstName} ${member.lastName}`}
					/>
					<DetailsRow
						iconName="mail"
						label={t("email")}
						value={member.email || "-"}
					/>
					<DetailsRow
						iconName="phone"
						label={t("phone")}
						value={member.phoneNumber || "-"}
					/>
				</View>

				{/* Body Metrics Card */}
				<View style={styles.card}>
					<ThemedText style={styles.sectionTitle}>{t("bodyMetrics")}</ThemedText>

					<View style={styles.bodyMetricsRow}>
						<View style={styles.bodyMetricItem}>
							<ThemedIcon
								name="scale-bathroom"
								size={22}
							/>
							<ThemedText style={styles.bodyMetricLabel}>{t("weight")}</ThemedText>
							<ThemedText style={styles.bodyMetricValue}>{member.weight ? `${member.weight} kg` : "-"}</ThemedText>
						</View>
						<View style={styles.bodyMetricDivider} />
						<View style={styles.bodyMetricItem}>
							<ThemedIcon
								name="human-male-height"
								size={22}
							/>
							<ThemedText style={styles.bodyMetricLabel}>{t("height")}</ThemedText>
							<ThemedText style={styles.bodyMetricValue}>{member.height ? `${member.height} cm` : "-"}</ThemedText>
						</View>
					</View>

					{member.weight && member.height && member.height > 0 && (
						<BMIDisplay
							weight={member.weight}
							height={member.height}
						/>
					)}
				</View>

				{/* Sign Out Button */}
				<ThemedButton
					style={styles.logoutButton}
					onPress={handleLogout}
				>
					<ThemedIcon
						name="logout"
						size={20}
						color={theme.red.foreground}
					/>
					<ThemedText style={styles.logoutButtonText}>{t("logout")}</ThemedText>
				</ThemedButton>
			</ScrollView>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		scrollContent: {
			flex: 1,
		},
		scrollContentContainer: {
			paddingBottom: BOTTOM_TAB_HEIGHT + moderateScale(20),
		},
		card: {
			marginHorizontal: moderateScale(16),
			marginTop: moderateScale(16),
			padding: moderateScale(20),
			borderRadius: 16,
			backgroundColor: darkMode ? "#1a1a1a" : "#f0f0f0",
			borderWidth: 1,
			borderColor: theme.border,
		},
		avatarSection: {
			alignItems: "center",
			paddingVertical: moderateScale(8),
		},
		fullName: {
			fontSize: 22,
			fontWeight: "700",
			marginTop: moderateScale(12),
			textAlign: "center",
		},
		roleBadge: {
			marginTop: moderateScale(8),
			paddingHorizontal: 16,
			paddingVertical: 4,
			borderRadius: 12,
			backgroundColor: darkMode ? "#1a1a2e" : "#e0e0ff",
		},
		roleBadgeText: {
			fontSize: 12,
			fontWeight: "600",
			opacity: 0.7,
		},
		divider: {
			height: 1,
			backgroundColor: theme.border,
			marginVertical: moderateScale(16),
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: "700",
			marginBottom: moderateScale(12),
		},
		detailRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: moderateScale(10),
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: theme.border,
		},
		detailRowLabel: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		detailLabel: {
			fontSize: 14,
			opacity: 0.7,
			fontWeight: "600",
		},
		detailValue: {
			fontSize: 15,
			fontWeight: "600",
		},
		// Body Metrics
		bodyMetricsRow: {
			flexDirection: "row",
			justifyContent: "space-around",
			alignItems: "center",
			paddingVertical: moderateScale(8),
		},
		bodyMetricItem: {
			alignItems: "center",
			gap: 6,
			flex: 1,
		},
		bodyMetricDivider: {
			width: 1,
			height: 50,
			backgroundColor: theme.border,
		},
		bodyMetricLabel: {
			fontSize: 12,
			opacity: 0.6,
			fontWeight: "600",
		},
		bodyMetricValue: {
			fontSize: 18,
			fontWeight: "700",
		},
		// Logout
		logoutButton: {
			marginHorizontal: moderateScale(16),
			marginTop: moderateScale(24),
			marginBottom: moderateScale(20),
			paddingVertical: moderateScale(14),
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
			backgroundColor: theme.red.background,
			borderWidth: 1,
			borderColor: theme.red.foreground,
		},
		logoutButtonText: {
			color: theme.red.foreground,
			fontSize: 16,
			fontWeight: "bold",
		},
	})
}
