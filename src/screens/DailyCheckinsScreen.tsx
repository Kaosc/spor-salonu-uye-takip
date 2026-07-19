import { useCallback, useEffect, useState } from "react"
import { View, StyleSheet, BackHandler } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useSelector } from "react-redux"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import CheckinListCard from "../components/CheckinListCard"
import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import CustomHeader from "../components/CustomHeader"

import { getCheckinsByDate } from "../lib/firebase/firestore/checkin"
import { Theme } from "../utils/theme"

export default function DailyCheckinsScreen() {
	const navigation = useNavigation<any>()
	const route = useRoute<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const selectedDate = route.params?.selectedDate || null

	const [checkins, setCheckins] = useState<CheckIn[]>([])
	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

	useEffect(() => {
		const backAction = () => {
			handleGoBack()
			return true
		}

		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)

		return () => backHandler.remove()
	}, [])

	const handleGoBack = () => {
		navigation.navigate("Tabs", {
			screen: "CheckinsStack",
			params: {
				screen: "CheckinsCalendarScreen",
			},
		})
	}

	const fetchCheckins = async () => {
		if (selectedDate) {
			try {
				setStatus("loading")
				const checkinsData = await getCheckinsByDate(selectedDate)
				if (Array.isArray(checkinsData) && checkinsData.length > 0) {
					setCheckins(checkinsData)
				}
				setStatus("idle")
			} catch (error) {
				setStatus("error")
			}
		}
	}

	useEffect(() => {
		fetchCheckins()
	}, [])

	const renderItem = useCallback(
		({ item }: { item: CheckIn }) => {
			return (
				<CheckinListCard
					checkin={item}
					selectedDate={selectedDate}
				/>
			)
		},
		[selectedDate],
	)

	const keyExtractor = useCallback((item: CheckIn, index: number) => `${item.memberUid}-${index}`, [])

	if (status === "error") {
		return (
			<View style={styles.emptyContainer}>
				<ThemedIcon
					name="calendar-remove"
					size={100}
					style={{ opacity: 0.5 }}
				/>
				<ThemedText style={{ fontSize: 18, marginTop: 10 }}>{t("checkinFetchError")}</ThemedText>
			</View>
		)
	}

	if (status === "loading") {
		return (
			<View style={styles.emptyContainer}>
				<ThemedActivityIndicator size={60} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={`${t("checkinsFor")} | ${new Date(selectedDate).toLocaleDateString()}`}
				onBackPress={handleGoBack}
			/>
			<FlashList
				data={checkins}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				contentContainerStyle={styles.list}
				onRefresh={fetchCheckins}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<ThemedIcon
							name="calendar-remove"
							size={100}
							style={{ opacity: 0.5 }}
						/>
						<ThemedText style={{ fontSize: 18, marginTop: 10 }}>{t("noCheckinsFound")}</ThemedText>
					</View>
				}
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
		emptyContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingHorizontal: 16,
		},
		list: {
			paddingHorizontal: 16,
			paddingBottom: 24,
			marginTop: 15,
			flexGrow: 1,
		},
	})
}
