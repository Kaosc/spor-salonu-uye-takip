import { View, StyleSheet, TouchableOpacity } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp } from "@react-navigation/native"

import ThemedText from "./ui/ThemedText"
import ThemedIcon from "./ui/ThemedIcon"

import { Theme } from "../utils/theme"
import { safeTimestampToDateTimeString } from "../utils/date"

export default function CheckinListCard({ checkin, selectedDate }: { checkin: CheckIn; selectedDate: string }) {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	const handleOnPress = () => {
		navigation.navigate("MemberDetailsScreen", {
			memberId: checkin.memberUid,
			prevScreen: "DailyCheckinsScreen",
			selectedDate: selectedDate,
		})
	}

	return (
		<TouchableOpacity
			style={styles.card}
			onPress={handleOnPress}
		>
			<View style={{ flex: 1, gap: 6 }}>
				<View style={styles.row}>
					<ThemedIcon
						name="account-outline"
						size={20}
					/>
					<ThemedText style={styles.memberUid}>
						{checkin.firstName} {checkin.lastName}
					</ThemedText>
				</View>
				<View style={styles.row}>
					<ThemedIcon
						name="calendar-clock-outline"
						size={20}
					/>
					<ThemedText style={styles.checkedInBy}>{safeTimestampToDateTimeString(checkin.checkInTime)}</ThemedText>
				</View>
			</View>
			<ThemedIcon
				name="check-circle-outline"
				size={40}
				style={styles.icon}
			/>
		</TouchableOpacity>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		card: {
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
		icon: {
			marginRight: 12,
			opacity: 0.75,
		},
		memberUid: {
			fontSize: 16,
			fontWeight: "600",
		},
		checkedInBy: {
			fontSize: 14,
			marginTop: 2,
			opacity: 0.7,
		},
		row: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: 4,
			gap: 7,
		},
	})
}
