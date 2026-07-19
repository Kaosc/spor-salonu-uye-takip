import { useCallback, useEffect, useState, useMemo, useRef } from "react"
import { View, StyleSheet, BackHandler } from "react-native"
import { useSelector } from "react-redux"
import { CalendarList, DateData } from "react-native-calendars"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { MarkedDates } from "react-native-calendars/src/types"

import ThemedButton from "../components/ui/ThemedButton"
import CustomHeader from "../components/CustomHeader"
import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"

import { getAllCheckIns } from "../lib/firebase/firestore/checkin"
import { formatToYYYYMMDD } from "../utils/date"
import { Theme } from "../utils/theme"

export default function CheckinsCalendarScreen() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)
	const { t } = useTranslation()

	const [checkins, setCheckins] = useState<CheckIn[]>([])

	const calendarRef = useRef<any>(null)

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
			screen: "DashboardScreen",
		})
	}

	const fetchCheckins = async () => {
		const checkinsData = await getAllCheckIns()
		setCheckins(checkinsData)
	}

	const handleGoToday = useCallback(() => {
		const today = new Date()
		const todayString = formatToYYYYMMDD(today)
		navigation.navigate("DailyCheckinsScreen", {
			selectedDate: todayString,
		})
	}, [navigation])

	const handleScrollToToday = useCallback(() => {
		const todayString = new Date().toISOString().split("T")[0] // Format: YYYY-MM-DD

		// Arguments: (date: string/Date/XDate, offset: number, animated: boolean)
		calendarRef.current.scrollToDay(todayString, -140, true)
	}, [navigation])

	useEffect(() => {
		fetchCheckins()
	}, [])

	const markedDates = useMemo(() => {
		const marks: MarkedDates = {}

		checkins.forEach((c) => {
			const dateString = formatToYYYYMMDD(c.checkInTime)
			if (dateString) {
				marks[dateString] = {
					type: "period",
					color: darkMode ? "#0f61a3" : "#8ebfff",
					startingDay: true,
					endingDay: true,
				}
			}
		})

		return marks
	}, [checkins, darkMode])

	const onDayPress = useCallback(
		(day: DateData) => {
			navigation.navigate("DailyCheckinsScreen", {
				selectedDate: day.dateString,
			})
		},
		[navigation],
	)

	return (
		<View style={styles.container}>
			<CustomHeader title={t("checkins")} onBackPress={handleGoBack} />
			<CalendarList
				key={darkMode ? "dark" : "light"}
				current={new Date().toISOString().split("T")[0]}
				onDayPress={onDayPress}
				markedDates={markedDates}
				markingType="period"
				ref={calendarRef}
				theme={{
					calendarBackground: "transparent",
					textSectionTitleColor: darkMode ? "#b6c1cd" : "#2d4150",
					selectedDayBackgroundColor: darkMode ? "#fff" : "#000",
					selectedDayTextColor: darkMode ? "#000" : "#ffffff",
					todayTextColor: darkMode ? "#fff" : "#000",
					todayBackgroundColor: darkMode ? "#2d8f24" : "#7bd142",
					dayTextColor: darkMode ? "#fff" : "#2d4150",
					textDisabledColor: darkMode ? "#555" : "#d9e1e8",
					dotColor: darkMode ? "#fff" : "#000",
					selectedDotColor: darkMode ? "#000" : "#ffffff",
					arrowColor: darkMode ? "#fff" : "#000",
					monthTextColor: darkMode ? "#fff" : "#2d4150",
					todayButtonTextColor: darkMode ? "#2600ff" : "#ff0000",
				}}
			/>
			<ThemedButton
				onPress={handleGoToday}
				style={styles.todayButton}
			>
				<ThemedIcon
					name="calendar-today"
					size={18}
					color={darkMode ? "#000" : "#fff"}
				/>
				<ThemedText style={styles.buttonText}>{t("goToToday")}</ThemedText>
			</ThemedButton>
			<ThemedButton
				onPress={handleScrollToToday}
				style={styles.backToDayButton}
			>
				<ThemedIcon
					name="arrow-all"
					size={18}
					color={darkMode ? "#000" : "#fff"}
				/>
				<ThemedText style={styles.buttonText}>{t("scrollToToday")}</ThemedText>
			</ThemedButton>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		todayButton: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			position: "absolute",
			bottom: 20,
			right: 20,
			gap: 5,
		},
		backToDayButton: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			position: "absolute",
			bottom: 20,
			left: 20,
			gap: 5,
		},
		buttonText: {
			fontSize: 14,
			color: darkMode ? "#000" : "#fff",
			fontWeight: "bold",
		},
	})
}
