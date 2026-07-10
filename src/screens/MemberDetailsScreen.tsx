import { useEffect, useState } from "react"
import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"

import { getMemberById } from "../lib/firebase/firestore/member"
import { safeTimestampToDateString, safeTimestampToDateTimeString } from "../utils/date"

export default function MemberDetailsScreen() {
	const navigation = useNavigation<any>()
	const route = useRoute<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [member, setMember] = useState<Member | null>(null)
	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

	useEffect(() => {
		const fetchMember = async () => {
			setTimeout(() => setStatus("loading"), 1000)
			const member = await getMemberById(route.params?.memberId)
			setMember(member)
			setStatus(member ? "idle" : "error")
		}

		fetchMember()
	}, [route.params?.memberId])

	const editButton = (
		<TouchableOpacity onPress={() => navigation.navigate("MemberFormScreen", { memberId: member?.uid })}>
			<ThemedIcon
				name="pen"
				size={24}
				color={darkMode ? "#fff" : "#000"}
			/>
		</TouchableOpacity>
	)

	return (
		<View style={styles.container}>
			<CustomHeader
				title={t("memberDetails")}
				rightComponent={member ? editButton : undefined}
			/>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{!member ? (
					status === "loading" ? (
						<ThemedActivityIndicator size={70} />
					) : (
						status === "error" && (
							<View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 5 }}>
								<ThemedIcon
									name="account-alert-outline"
									size={90}
									style={{ alignSelf: "center", marginLeft: 10, opacity: 0.7 }}
								/>
								<ThemedText style={{ textAlign: "center" }}>{t("memberNotFound")}</ThemedText>
							</View>
						)
					)
				) : (
					<View style={styles.card}>
						<ThemedIcon
							name={member?.gender === "FEMALE" ? "female" : "male"}
							size={80}
							color={darkMode ? "#fff" : "#000"}
							style={{ alignSelf: "center", marginBottom: 20 }}
						/>

						<ThemedText style={styles.title}>
							{member.firstName} {member.lastName}
						</ThemedText>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("phone")}</ThemedText>
							<ThemedText style={styles.value}>{member.phoneNumber || "-"}</ThemedText>
						</View>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("email")}</ThemedText>
							<ThemedText style={styles.value}>{member.email || "-"}</ThemedText>
						</View>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("gender")}</ThemedText>
							<ThemedText style={styles.value}>{member.gender || "-"}</ThemedText>
						</View>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("birthDate")}</ThemedText>
							<ThemedText style={styles.value}>
								{new Date(safeTimestampToDateString(member.birthDate)).toLocaleDateString()}
							</ThemedText>
						</View>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("bloodType")}</ThemedText>
							<ThemedText style={styles.value}>{member.bloodType || "-"}</ThemedText>
						</View>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("lockerNumber")}</ThemedText>
							<ThemedText style={styles.value}>{member.lockerNumber || "-"}</ThemedText>
						</View>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("isActive")}</ThemedText>
							<ThemedText style={styles.value}>{member.isActive ? t("yes") : t("no")}</ThemedText>
						</View>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("createdAt")}</ThemedText>
							<ThemedText style={styles.value}>{safeTimestampToDateTimeString(member.createdAt)}</ThemedText>
						</View>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("updatedAt")}</ThemedText>
							<ThemedText style={styles.value}>{safeTimestampToDateTimeString(member.updatedAt)}</ThemedText>
						</View>

						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("createdBy")}</ThemedText>
							<ThemedText style={styles.value}>{member.createdBy || "-"}</ThemedText>
						</View>

						<ThemedText style={styles.sectionTitle}>{t("emergencyContact")}</ThemedText>
						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("name")}</ThemedText>
							<ThemedText style={styles.value}>{member.emergencyContact?.name || "-"}</ThemedText>
						</View>
						<View style={styles.row}>
							<ThemedText style={styles.label}>{t("phone")}</ThemedText>
							<ThemedText style={styles.value}>{member.emergencyContact?.phone || "-"}</ThemedText>
						</View>
					</View>
				)}
			</ScrollView>
		</View>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#f5f5f5",
		},
		scrollContent: {
			padding: 20,
			flexGrow: 1,
			justifyContent: "center",
		},
		card: {
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
			borderRadius: 12,
			padding: 20,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 4,
			elevation: 3,
		},
		title: {
			fontSize: 22,
			fontWeight: "700",
			marginBottom: 20,
			textAlign: "center",
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: "700",
			marginTop: 16,
			marginBottom: 8,
		},
		row: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: darkMode ? "#333" : "#eee",
		},
		label: {
			fontSize: 15,
			color: darkMode ? "#aaa" : "#666",
			fontWeight: "500",
		},
		value: {
			fontSize: 15,
			fontWeight: "600",
		},
		button: {
			backgroundColor: "#007AFF",
			borderRadius: 8,
			fontWeight: "600",
		},
		buttonText: {
			color: "#fff",
			fontSize: 16,
			fontWeight: "600",
			textAlign: "center",
			paddingVertical: 14,
		},
		editButtonText: {
			color: "#007AFF",
			fontSize: 16,
			fontWeight: "600",
		},
	})
