import { View, StyleSheet, TouchableOpacity } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import ThemedText from "./ui/ThemedText"
import ThemedIcon from "./ui/ThemedIcon"

import { safeTimestampToDateTimeString } from "../utils/date"
import { Theme } from "../utils/theme"

export default function CheckinListCard({ checkin, selectedDate }: { checkin: CheckIn; selectedDate: string }) {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()
	const styles = createStyles(darkMode)

	const hasCheckOut = checkin.checkOutTime !== null

	const handleOnPress = () => {
		navigation.navigate("MemberDetailsScreen", {
			memberId: checkin.memberUid,
			prevScreen: "DailyCheckinsScreen",
			selectedDate: selectedDate,
		})
	}

	return (
		<TouchableOpacity
			style={[styles.card, hasCheckOut ? styles.cardCheckedOut : styles.cardCheckedIn]}
			onPress={handleOnPress}
		>
			<View style={{ flex: 1, gap: 6 }}>
				<View style={styles.row}>
					<ThemedIcon
						name="account-outline"
						size={23}
					/>
					<ThemedText style={styles.memberUid}>
						{checkin.firstName} {checkin.lastName}
					</ThemedText>
				</View>
				<View style={styles.row}>
					<ThemedIcon
						name="check-circle-outline"
						size={23}
					/>
					<ThemedText style={styles.timeText}>{safeTimestampToDateTimeString(checkin.checkInTime)}</ThemedText>
				</View>
				{hasCheckOut && (
					<View style={styles.row}>
						<ThemedIcon
							name="close-circle-outline"
							size={23}
						/>
						<ThemedText style={styles.timeText}>
							{checkin.checkOutTime ? safeTimestampToDateTimeString(checkin.checkOutTime!) : t("noCheckOutTime")}
						</ThemedText>
					</View>
				)}
			</View>
			<ThemedIcon
				name={hasCheckOut ? "check-circle-outline" : "clock-outline"}
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
			marginBottom: 10,
			borderRadius: 12,
			paddingHorizontal: 15,
		},
		cardCheckedIn: {
			backgroundColor: theme.green.background,
			borderWidth: 1,
			borderColor: theme.green.foreground,
		},
		cardCheckedOut: {
			backgroundColor: theme.red.background,
			borderWidth: 1,
			borderColor: theme.red.foreground,
		},
		icon: {
			marginRight: 12,
			opacity: 0.75,
		},
		memberUid: {
			fontSize: 16,
			fontWeight: "600",
		},
		timeText: {
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
