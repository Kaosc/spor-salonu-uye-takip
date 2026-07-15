import { useCallback, useEffect, useState } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { FlashList } from "@shopify/flash-list"
import { useTranslation } from "react-i18next"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"

import { getAllMembers } from "../lib/firebase/firestore/member"
import { Theme } from "../utils/theme"
import { TOTAL_LOCKERS } from "../lib/constants"

interface Locker {
	number: number
	owner: Member | null
}

export default function LockerScreen() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()
	const styles = createStyles(darkMode)

	const [loading, setLoading] = useState(true)
	const [lockers, setLockers] = useState<Locker[]>([])
	const [emptyCount, setEmptyCount] = useState(TOTAL_LOCKERS)
	const [occupiedCount, setOccupiedCount] = useState(0)

	const theme = Theme[darkMode ? "dark" : "light"]

	useEffect(() => {
		fetchLockerData()
	}, [])

	const fetchLockerData = async () => {
		try {
			const members = await getAllMembers()

			// Create locker array 1-100
			const lockerArray: Locker[] = Array.from({ length: TOTAL_LOCKERS }, (_, i) => ({
				number: i + 1,
				owner: null,
			}))

			let occupied = 0

			members.forEach((member) => {
				if (member.lockerNumber) {
					const num = member.lockerNumber
					if (num >= 1 && num <= TOTAL_LOCKERS) {
						lockerArray[num - 1].owner = member
						occupied++
					}
				}
			})

			setLockers(lockerArray)
			setEmptyCount(TOTAL_LOCKERS - occupied)
			setOccupiedCount(occupied)
		} catch (e) {
			console.error("[LockerScreen] fetchLockerData:", e)
		} finally {
			setLoading(false)
		}
	}

	const handleLockerPress = (locker: Locker) => {
		if (locker.owner) {
			navigation.navigate("MemberDetailsScreen", { memberId: locker.owner.uid, prevScreen: "LockerScreen" })
		} else {
			navigation.navigate("MemberFormScreen", {
				prefilledLockerNumber: locker.number.toString(),
				prevScreen: "LockerScreen",
			})
		}
	}

	const renderLocker = useCallback(
		({ item }: { item: Locker }) => {
			const isOccupied = !!item.owner
			const firstName = item.owner?.firstName || ""

			return (
				<TouchableOpacity
					style={[
						styles.lockerCard,
						{
							backgroundColor: isOccupied ? theme.red.background : theme.green.background,
							borderColor: isOccupied ? theme.red.foreground : theme.green.foreground,
						},
					]}
					onPress={() => handleLockerPress(item)}
					activeOpacity={0.7}
				>
					<ThemedText style={styles.lockerNumber}>{item.number}</ThemedText>
					{isOccupied && (
						<ThemedText
							style={styles.memberName}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{firstName.split(" ")[0]}
						</ThemedText>
					)}
				</TouchableOpacity>
			)
		},
		[darkMode, theme],
	)

	const keyExtractor = useCallback((item: Locker) => item.number.toString(), [])

	if (loading) {
		return (
			<View style={styles.centered}>
				<ThemedActivityIndicator />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<View style={styles.summaryRow}>
				<View style={styles.summaryItem}>
					<ThemedIcon
						name="locker"
						size={20}
						color={darkMode ? "#e9e9e9" : "#000"}
					/>
					<ThemedText style={styles.summaryLabel}>{t("total")}</ThemedText>
					<ThemedText style={styles.summaryValue}>{TOTAL_LOCKERS}</ThemedText>
				</View>

				<View style={styles.summaryItem}>
					<ThemedIcon
						name="lock-open-outline"
						size={20}
						color={theme.green.foreground}
					/>
					<ThemedText style={styles.summaryLabel}>{t("empty")}</ThemedText>
					<ThemedText style={[styles.summaryValue, { color: theme.green.foreground }]}>{emptyCount}</ThemedText>
				</View>

				<View style={styles.summaryItem}>
					<ThemedIcon
						name="lock-outline"
						size={20}
						color={theme.red.foreground}
					/>
					<ThemedText style={styles.summaryLabel}>{t("occupied")}</ThemedText>
					<ThemedText style={[styles.summaryValue, { color: theme.red.foreground }]}>{occupiedCount}</ThemedText>
				</View>
			</View>

			<FlashList
				data={lockers}
				renderItem={renderLocker}
				keyExtractor={keyExtractor}
				numColumns={4}
				style={{ flex: 1, gap: 10 }}
				contentContainerStyle={styles.gridContent}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		centered: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		summaryRow: {
			flexDirection: "row",
			justifyContent: "space-around",
			paddingVertical: 16,
			paddingHorizontal: 8,
			borderBottomWidth: 1,
			borderBottomColor: darkMode ? "#222" : "#eee",
		},
		summaryItem: {
			alignItems: "center",
			gap: 4,
		},
		summaryLabel: {
			fontSize: 12,
			opacity: 0.7,
		},
		summaryValue: {
			fontSize: 20,
			fontWeight: "bold",
		},
		gridContent: {
			marginLeft: 11,
			marginTop: 5,
			paddingBottom: 11,
		},
		lockerCard: {
			flex: 1,
			aspectRatio: 1,
			justifyContent: "center",
			alignItems: "center",
			borderRadius: 8,
			margin: 3,
		},
		lockerNumber: {
			fontSize: 20,
			fontWeight: "bold",
		},
		memberName: {
			fontSize: 11,
			marginTop: 2,
			textAlign: "center",
		},
	})
}
