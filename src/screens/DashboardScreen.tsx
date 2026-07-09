import { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { useSelector } from "react-redux"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"

import { getStaffUserById } from "../lib/firebase/firestore/users"

export default function DashboardScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const uid = useSelector((state: RootState) => state.auth.uid)

	const styles = createStyles(darkMode)

	const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!uid) return

		setLoading(true)
		getStaffUserById(uid)
			.then((user) => setStaffUser(user))
			.catch(() => {})
			.finally(() => setLoading(false))
	}, [uid])

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
		<View style={styles.container}>
			<View style={styles.profileSection}>
				<View style={styles.avatar}>
					<ThemedIcon
						name="account"
						size={48}
					/>
				</View>
				<ThemedText style={styles.name}>
					{staffUser.firstName} {staffUser.lastName}
				</ThemedText>
				<View style={[styles.roleBadge, { backgroundColor: darkMode ? "#fff" : "#000" }]}>
					<ThemedText style={[styles.roleText, { color: darkMode ? "#000" : "#fff" }]}>{staffUser.role}</ThemedText>
				</View>
			</View>

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
					/>
					<ThemedText style={styles.infoText}>{staffUser.isActive ? "Active" : "Inactive"}</ThemedText>
				</View>
			</View>
		</View>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			paddingHorizontal: 24,
			paddingTop: 40,
		},
		centered: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
		},
		profileSection: {
			alignItems: "center",
			marginBottom: 40,
		},
		avatar: {
			width: 96,
			height: 96,
			borderRadius: 48,
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 16,
			borderWidth: 2,
			borderColor: "#888",
		},
		name: {
			fontSize: 28,
			fontWeight: "700",
			marginBottom: 8,
			textAlign: "center",
		},
		roleBadge: {
			paddingHorizontal: 16,
			paddingVertical: 4,
			borderRadius: 12,
		},
		roleText: {
			fontSize: 13,
			fontWeight: "600",
			letterSpacing: 0.5,
			textTransform: "uppercase",
		},
		infoCard: {
			borderRadius: 16,
			padding: 20,
			borderWidth: 1,
			borderColor: "#444",
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
			backgroundColor: "#333",
		},
	})
