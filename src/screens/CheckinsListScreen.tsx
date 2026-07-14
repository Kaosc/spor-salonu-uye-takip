import { useCallback, useEffect, useState, useMemo } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useSelector } from "react-redux"

import ThemedText from "../components/ui/ThemedText"
import CheckinListCard from "../components/CheckinListCard"
import ThemedIcon from "../components/ui/ThemedIcon"

import { getAllCheckIns } from "../lib/firebase/firestore/checkin"
import { toDate } from "../utils/date"
import { Theme } from "../utils/theme"

type FilterTab = "all" | "today"

export default function CheckinsListScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	const [checkins, setCheckins] = useState<CheckIn[]>([])
	const [activeTab, setActiveTab] = useState<FilterTab>("all")

	const fetchCheckins = async () => {
		const checkinsData = await getAllCheckIns()
		setCheckins(checkinsData)
	}

	useEffect(() => {
		fetchCheckins()
	}, [])

	const filteredCheckins = useMemo(() => {
		if (activeTab === "all") return checkins

		const now = new Date()
		const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

		return checkins.filter((c) => {
			const date = toDate(c.checkInTime)
			if (!date) return false
			return date >= twentyFourHoursAgo && date <= now
		})
	}, [checkins, activeTab])

	const renderItem = useCallback(({ item }: { item: CheckIn }) => {
		return <CheckinListCard checkin={item} />
	}, [])

	const keyExtractor = useCallback((item: CheckIn, index: number) => `${item.memberUid}-${index}`, [])

	const iconColor = (tab: FilterTab) => {
		if (activeTab === tab) {
			return darkMode ? "#000" : "#fff"
		} else {
			return darkMode ? "#fff" : "#000"
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.tabBar}>
				<TouchableOpacity
					style={[styles.tab, activeTab === "all" && styles.tabActive]}
					activeOpacity={0.7}
					onPress={() => setActiveTab("all")}
				>
					<ThemedIcon
						name="calendar-multiple-check"
						size={18}
						color={iconColor("all")}
					/>
					<ThemedText style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>All</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === "today" && styles.tabActive]}
					activeOpacity={0.7}
					onPress={() => setActiveTab("today")}
				>
					<ThemedIcon
						name="calendar-today"
						size={18}
						color={iconColor("today")}
					/>
					<ThemedText style={[styles.tabText, activeTab === "today" && styles.tabTextActive]}>Today</ThemedText>
				</TouchableOpacity>
			</View>

			<FlashList
				data={filteredCheckins}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				contentContainerStyle={styles.list}
				onRefresh={fetchCheckins}
			/>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
		},
		tabBar: {
			flexDirection: "row",
			marginHorizontal: 16,
			marginTop: 10,
			gap: 14,
		},
		tab: {
			flex: 1,
			flexDirection: "row",
			justifyContent: "center",
			gap: 8,
			borderRadius: 8,
			paddingVertical: 12,
			borderWidth: 1,
			borderColor: theme.border,
			alignItems: "center",
		},
		tabActive: {
			backgroundColor: darkMode ? "#fff" : "#000",
		},
		tabText: {
			fontSize: 15,
			fontWeight: "bold",
		},
		tabTextActive: {
			color: darkMode ? "#000" : "#fff",
			fontWeight: "bold",
		},
		list: {
			paddingHorizontal: 16,
			paddingBottom: 24,
			marginTop: 15,
		},
	})
}
