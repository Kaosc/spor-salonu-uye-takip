import React, { useMemo } from "react"
import { useSelector } from "react-redux"
import { StyleSheet, View } from "react-native"
import { useTranslation } from "react-i18next"

import ThemedText from "./ui/ThemedText"

import { Theme } from "../utils/theme"

export default function BMIDisplay({ weight, height }: { weight: number; height: number }) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const theme = Theme[darkMode ? "dark" : "light"]
	const styles = createStyles(darkMode)

	const bmi = useMemo(() => {
		const heightInMeters = height / 100
		return weight / (heightInMeters * heightInMeters)
	}, [weight, height])

	const getBmiStatus = (bmiValue: number): { label: string; color: string } => {
		if (bmiValue < 18.5) return { label: t("underweight"), color: theme.orange.foreground }
		if (bmiValue < 25) return { label: t("normal"), color: theme.green.foreground }
		if (bmiValue < 30) return { label: t("overweight"), color: theme.orange.foreground }
		return { label: t("obese"), color: theme.red.foreground }
	}

	const status = getBmiStatus(bmi)

	return (
		<View style={styles.bmiContainer}>
			<View style={styles.bmiRow}>
				<ThemedText style={styles.bmiLabel}>VKE:</ThemedText>
				<ThemedText style={styles.bmiValue}>{bmi.toFixed(1)}</ThemedText>
			</View>
			<View style={[styles.bmiBadge, { borderColor: status.color }]}>
				<View style={[styles.bmiDot, { backgroundColor: status.color }]} />
				<ThemedText style={[styles.bmiBadgeText, { color: status.color }]}>{status.label}</ThemedText>
			</View>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		// BMI
		bmiContainer: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			marginTop: 12,
			paddingTop: 12,
			paddingHorizontal: 12,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: theme.border,
		},
		bmiRow: {
			flexDirection: "row",
			alignItems: "baseline",
			gap: 6,
		},
		bmiLabel: {
			fontSize: 14,
			fontWeight: "600",
			opacity: 0.7,
		},
		bmiValue: {
			fontSize: 22,
			fontWeight: "800",
		},
		bmiBadge: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
			borderWidth: 1,
			borderRadius: 20,
			paddingHorizontal: 10,
			paddingVertical: 3,
		},
		bmiDot: {
			width: 7,
			height: 7,
			borderRadius: 3.5,
		},
		bmiBadgeText: {
			fontSize: 12,
			fontWeight: "700",
		},
	})
}
