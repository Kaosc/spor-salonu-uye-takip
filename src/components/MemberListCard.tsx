import { View, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"

import ThemedText from "./ui/ThemedText"
import ThemedIcon from "./ui/ThemedIcon"

import { Theme } from "../utils/theme"

export default function MemberListCard({ member }: { member: Member }) {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)
	const isScearchScreen = navigation.getState().routes.some((route: any) => route.name === "SearchScreen")

	const statusColor = member.isActive
		? Theme[darkMode ? "dark" : "light"].green.foreground
		: Theme[darkMode ? "dark" : "light"].red.foreground

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
				size={37}
				style={styles.avatarIcon}
			/>
			<View style={{ flex: 1 }}>
				<ThemedText style={styles.itemName}>
					{member.firstName} {member.lastName}
				</ThemedText>
				<ThemedText style={styles.itemPhone}>{member.email}</ThemedText>
			</View>
			<View style={[styles.statusDot, { backgroundColor: statusColor }]} />
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
	})
}
