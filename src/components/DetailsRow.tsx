import { View, StyleSheet } from "react-native"
import { useSelector } from "react-redux"

import ThemedIcon from "./ui/ThemedIcon"
import ThemedText from "./ui/ThemedText"

import { AllIconNames } from "../types/icon"
import { Theme } from "../utils/theme"

export default function DetailsRow({
	label,
	value,
	iconName,
	textColor,
}: {
	label: string
	value: string
	iconName: AllIconNames
	textColor?: string
}) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)
	const customColor = textColor ? { color: textColor } : {}
	return (
		<View style={styles.row}>
			<View style={styles.rowLabel}>
				<ThemedIcon
					name={iconName}
					size={18}
					color={customColor.color}
				/>
				<ThemedText style={[styles.label, customColor]}>{label}</ThemedText>
			</View>
			<ThemedText style={[styles.value, customColor]}>{value || "-"}</ThemedText>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		row: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: 12,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: theme.border,
		},
		rowLabel: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		label: {
			fontSize: 14,
			opacity: 0.8,
			fontWeight: "bold",
		},
		value: {
			flex: 1,
			fontSize: 15,
			fontWeight: "600",
		},
	})
}
