import { View, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"

import ThemedText from "./ui/ThemedText"
import ThemedIcon from "./ui/ThemedIcon"

import { Theme } from "../utils/theme"
import { useTranslation } from "react-i18next"

export default function MemberListCard({ member }: { member: MemberCard }) {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const isScearchScreen = navigation.getState().routes.some((route: any) => route.name === "SearchScreen")
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const thene = Theme[darkMode ? "dark" : "light"]

	const memberStatusColor = member.isActive ? thene.green.foreground : thene.red.foreground

	const subStatusColor =
		member.subscriptionStatus === "ACTIVE"
			? thene.green.foreground
			: member.subscriptionStatus === "PAUSED"
				? thene.orange.foreground
				: thene.red.foreground

	const handleNavigate = () => {
		navigation.navigate("MemberDetailsScreen", {
			memberId: member.uid,
			prevScreen: isScearchScreen ? "SearchScreen" : undefined,
		})
	}

	return (
		<TouchableOpacity
			style={styles.member}
			onPress={handleNavigate}
		>
			<ThemedIcon
				name={member.gender === "FEMALE" ? "female" : "male"}
				size={45}
				style={styles.avatarIcon}
			/>
			<View style={{ flex: 1 }}>
				<ThemedText style={styles.itemName}>
					{member.firstName} {member.lastName}
				</ThemedText>
				<ThemedText style={styles.itemPhone}>{member.email}</ThemedText>
				<View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
					<ThemedText style={styles.itemSubscriptionLabel}>{t("subscription") + ": "}</ThemedText>
					<ThemedText style={[styles.itemSubscription, { color: subStatusColor }]}>
						{member.subscriptionStatus === "ACTIVE" ? t("active") : member.subscriptionStatus === "PAUSED" ? t("paused") : t("none")}
					</ThemedText>
				</View>
			</View>
			<View style={[styles.statusDot, { backgroundColor: memberStatusColor }]} />
		</TouchableOpacity>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		member: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 15,
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			marginBottom: 10,
			borderRadius: 12,
			paddingHorizontal: 15,
		},
		itemName: {
			fontSize: 16,
			fontWeight: "600",
		},
		itemPhone: {
			fontSize: 14,
			marginTop: 2,
			opacity: 0.7,
		},
		statusDot: {
			width: 10,
			height: 10,
			borderRadius: 5,
		},
		avatarIcon: {
			marginRight: 12,
			opacity: 0.75,
			borderRadius: 22.5,
		},
		itemSubscriptionLabel: {
			fontSize: 13,
			fontWeight: "600",
		},
		itemSubscription: {
			fontSize: 13,
			fontWeight: "600",
			marginTop: 1.5,
		},
	})
}
