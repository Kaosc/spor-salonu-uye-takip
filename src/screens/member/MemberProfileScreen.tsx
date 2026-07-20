import { useEffect, useState } from "react"
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { useNavigation, NavigationProp, StackActions, useRoute } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import ThemedText from "../../components/ui/ThemedText"
import ThemedIcon from "../../components/ui/ThemedIcon"
import ThemedButton from "../../components/ui/ThemedButton"
import CustomHeader from "../../components/CustomHeader"
import MemberAvatar from "../../components/MemberAvatar"
import BMIDisplay from "../../components/BMIDisplay"
import DetailsRow from "../../components/DetailsRow"
import ThemedActivityIndicator from "../../components/ui/ThemedActivityIndicator"

import { getMemberById } from "../../lib/firebase/firestore/member"
import { logoutUser } from "../../lib/firebase/auth"
import { logout } from "../../store/features/authSlice"

import { moderateScale } from "../../utils/responsive"
import { Theme } from "../../utils/theme"
import { safeTimestampToDateString } from "../../utils/date"

export default function MemberProfileScreen() {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const route = useRoute<any>()
	const { uid } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const dispatch = useDispatch<any>()

	const theme = Theme[darkMode ? "dark" : "light"]
	const styles = createStyles(darkMode)

	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

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
		console.log(route.params?.refresh)
		if (route.params?.refresh || member === null) {
			fetchMember()
		}
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

	const EditButton = () => {
		return (
			<TouchableOpacity onPress={() => navigation.navigate("MemberFormScreen", { memberId: member?.uid })}>
				<ThemedIcon
					name="pen"
					size={26}
				/>
			</TouchableOpacity>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={t("myProfile")}
				showBackButton={false}
				rightComponent={<EditButton />}
			/>

			<ScrollView
				style={styles.scrollContent}
				contentContainerStyle={styles.scrollContentContainer}
				showsVerticalScrollIndicator={false}
			>
				{/* Profile Card */}
				<View style={styles.card}>
					<View style={styles.avatarSection}>
						<MemberAvatar
							gender={member?.gender}
							size={100}
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
					<DetailsRow
						label={t("address")}
						value={member.address || "-"}
						iconName="home"
					/>

					<DetailsRow
						label={t("birthDate")}
						value={new Date(safeTimestampToDateString(member.birthDate)).toLocaleDateString()}
						iconName="calendar"
					/>
					<DetailsRow
						label={t("gender")}
						value={t(member.gender || "UNSPECIFIED")}
						iconName="gender-male-female"
					/>
					<DetailsRow
						label={t("bloodType")}
						value={member.bloodType || "-"}
						iconName="water"
					/>

					<ThemedText style={styles.sectionTitle}>{t("emergencyContact")}</ThemedText>

					<DetailsRow
						label={t("name")}
						value={member.emergencyContact?.name || "-"}
						iconName="account-star-outline"
					/>
					<DetailsRow
						label={t("phone")}
						value={member.emergencyContact?.phone || "-"}
						iconName="phone-forward"
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
			paddingBottom: 15,
		},
		card: {
			marginHorizontal: 10,
			marginTop: 16,
			padding: moderateScale(20),
			borderRadius: 16,
			backgroundColor: theme.cardBackground,
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
			backgroundColor: darkMode ? "#fff" : "#000",
		},
		roleBadgeText: {
			fontSize: 14,
			fontWeight: "bold",
			color: darkMode ? "#000" : "#fff",
		},
		divider: {
			height: 1,
			backgroundColor: theme.border,
			marginTop: 20,
		},
		sectionTitle: {
			fontSize: 19,
			fontWeight: "900",
			marginVertical: 20,
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
