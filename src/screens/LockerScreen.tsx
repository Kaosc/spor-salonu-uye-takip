import { useCallback, useEffect, useState } from "react"
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { FlashList } from "@shopify/flash-list"
import { useTranslation } from "react-i18next"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"

import { Theme } from "../utils/theme"
import { addLocker, getAllLockers } from "../lib/firebase/firestore/lockers"

export default function LockerScreen() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const theme = Theme[darkMode ? "dark" : "light"]
	const styles = createStyles(darkMode)

	const [loading, setLoading] = useState(true)
	const [lockers, setLockers] = useState<Locker[]>([])

	useEffect(() => {
		fetchLockerData()
	}, [])

	const fetchLockerData = async () => {
		try {
			const lockers = await getAllLockers()
			let occupied = 0
			lockers.map((locker: Locker) => {
				if (locker.isOccupied) {
					occupied++
				}
			})
			setLockers(lockers)
		} catch (e) {
			console.error("[LockerScreen] fetchLockerData:", e)
		} finally {
			setLoading(false)
		}
	}

	const handleAddLocker = () => {
		Alert.alert(t("addLocker"), t("addLockerMessage"), [
			{
				text: t("cancel"),
				style: "cancel",
			},
			{
				text: t("add"),
				style: "default",
				onPress: async () => {
					try {
						await addLocker()
						toast.show(t("locker_added_success"), { type: "success" })
						fetchLockerData()
					} catch (e) {
						console.error("[LockerScreen] handleAddLocker:", e)
						toast.show(t("locker_assignment_error"), { type: "danger" })
					}
				},
			},
		])
	}

	const handleLockerPress = (locker: Locker) => {
		if (locker.isOccupied) {
			navigation.navigate("MemberDetailsScreen", { memberId: locker.occupiedByUid, prevScreen: "LockerScreen", initialPage: 2 })
		}
	}

	const renderLocker = useCallback(
		({ item }: { item: Locker }) => {
			const isOccupied = !!item.isOccupied

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
					<ThemedText style={styles.lockerNumber}>{item.id}</ThemedText>
				</TouchableOpacity>
			)
		},
		[darkMode, theme],
	)

	const keyExtractor = useCallback((item: Locker) => item.id.toString(), [])

	if (loading) {
		return (
			<View style={styles.centered}>
				<ThemedActivityIndicator size={60} />
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
					<ThemedText style={styles.summaryValue}>{lockers.length}</ThemedText>
				</View>

				<View style={styles.summaryItem}>
					<ThemedIcon
						name="lock-open-outline"
						size={20}
						color={theme.green.foreground}
					/>
					<ThemedText style={styles.summaryLabel}>{t("empty")}</ThemedText>
					<ThemedText style={[styles.summaryValue, { color: theme.green.foreground }]}>
						{lockers.filter((l) => !l.isOccupied).length}
					</ThemedText>
				</View>

				<View style={styles.summaryItem}>
					<ThemedIcon
						name="lock-outline"
						size={20}
						color={theme.red.foreground}
					/>
					<ThemedText style={styles.summaryLabel}>{t("occupied")}</ThemedText>
					<ThemedText style={[styles.summaryValue, { color: theme.red.foreground }]}>
						{lockers.filter((l) => l.isOccupied).length}
					</ThemedText>
				</View>
			</View>

			<FlashList
				data={lockers}
				renderItem={renderLocker}
				keyExtractor={keyExtractor}
				onRefresh={fetchLockerData}
				numColumns={4}
				style={{ flex: 1, gap: 10 }}
				contentContainerStyle={styles.gridContent}
				showsVerticalScrollIndicator={false}
			/>

			<TouchableOpacity
				style={styles.fab}
				onPress={handleAddLocker}
			>
				<ThemedIcon
					name="plus"
					size={28}
					color={darkMode ? "#000" : "#fff"}
				/>
			</TouchableOpacity>
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
			paddingBottom: 100,
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
		fab: {
			position: "absolute",
			bottom: 24,
			right: 24,
			width: 56,
			height: 56,
			borderRadius: 28,
			backgroundColor: darkMode ? "#fff" : "#000",
			alignItems: "center",
			justifyContent: "center",
		},
	})
}
