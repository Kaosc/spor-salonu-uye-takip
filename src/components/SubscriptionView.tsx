import { View, StyleSheet } from "react-native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

import ThemedText from "./ui/ThemedText"
import DetailsRow from "./DetailsRow"

import { calculateEndDateAsDays, safeTimestampToDateString, safeTimestampToDateTimeString } from "../utils/date"
import { Theme } from "../utils/theme"

export default function SubscriptionView({ subscription }: { subscription: Subscription }) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)
	const theme = Theme[darkMode ? "dark" : "light"]

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "ACTIVE":
				return darkMode ? Theme.dark.green.foreground : Theme.light.green.foreground
			case "EXPIRED":
				return darkMode ? Theme.dark.red.foreground : Theme.light.red.foreground
			case "CANCELLED":
				return darkMode ? Theme.dark.red.foreground : Theme.light.red.foreground
			case "PAUSED":
				return "#f0ad4e"
			default:
				return theme.text
		}
	}

	const statusColor = subscription ? getStatusColor(subscription.status) : getStatusColor(undefined)
	const daysLeft = subscription ? calculateEndDateAsDays(subscription.endDate) : null

	const formatPrice = (price: number) => {
		return `${price.toFixed(2)} ₺`
	}

	const formatEndDate = (date: unknown) => {
		const dateStr = safeTimestampToDateString(date)
		if (!dateStr) return "-"
		return new Date(dateStr).toLocaleDateString()
	}

	return (
		<View>
			{/* Status Badge */}
			<View style={[styles.statusBadge, { borderColor: statusColor }]}>
				<View style={[styles.statusDot, { backgroundColor: statusColor }]} />
				<ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
					{t(subscription.status?.toLowerCase() || "")}
				</ThemedText>
			</View>

			{/* Package Header */}
			<View style={styles.subHeader}>
				<ThemedText style={styles.packageName}>{t(subscription.packageType)}</ThemedText>
				<ThemedText style={styles.packagePrice}>{formatPrice(subscription.price)}</ThemedText>
			</View>

			{/* Days Left */}
			{daysLeft !== null && (
				<View style={styles.daysLeftRow}>
					<ThemedText style={styles.daysLeftNumber}>{daysLeft}</ThemedText>
					<ThemedText style={styles.daysLeftLabel}>{t("daysLeft")}</ThemedText>
				</View>
			)}

			{/* Divider */}
			<View style={styles.divider} />

			{/* Info Rows */}
			<DetailsRow
				label={t("startDate")}
				value={formatEndDate(subscription.startDate)}
				iconName="calendar-start"
			/>

			<DetailsRow
				label={t("endDate")}
				value={formatEndDate(subscription.endDate)}
				iconName="calendar-end"
			/>

			<DetailsRow
				label={t("paymentMethod")}
				value={t(subscription.paymentMethod)}
				iconName="credit-card-outline"
			/>

			{subscription.notes ? (
				<DetailsRow
					label={t("notes")}
					value={subscription.notes}
					iconName="note-text-outline"
				/>
			) : null}

			<View style={styles.divider} />

			<DetailsRow
				label={t("createdBy")}
				value={subscription.createdBy || "-"}
				iconName="account-plus-outline"
			/>

			{subscription.createdAt && (
				<DetailsRow
					label={t("createdAt")}
					value={safeTimestampToDateTimeString(subscription.createdAt)}
					iconName="clock-outline"
				/>
			)}

			{subscription.pausedAt && (
				<DetailsRow
					label={t("pausedAt")}
					value={safeTimestampToDateTimeString(subscription.pausedAt)}
					iconName="clock-outline"
				/>
			)}
			<View style={styles.divider} />
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
			marginHorizontal: 10,
			paddingBottom: 10,
			gap: 8,
		},
		tab: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 6,
			paddingVertical: 9,
			opacity: 0.6,
			marginTop: 10,
			borderRadius: 40,
			borderWidth: 1,
			borderColor: theme.border,
		},
		tabActive: {
			backgroundColor: darkMode ? "#fff" : "#000",
			opacity: 1,
		},
		tabText: {
			fontSize: 14,
			fontWeight: "bold",
		},
		tabTextActive: {
			fontWeight: "bold",
			color: darkMode ? "#000" : "#fff",
		},
		pageContent: {
			flexGrow: 1,
			paddingBottom: 20,
			paddingHorizontal: 9,
		},
		card: {
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			borderRadius: 12,
			padding: 20,
		},
		statusBadge: {
			flexDirection: "row",
			alignItems: "center",
			alignSelf: "flex-start",
			gap: 6,
			borderWidth: 1,
			borderRadius: 20,
			paddingHorizontal: 12,
			paddingVertical: 4,
			marginBottom: 16,
		},
		statusDot: {
			width: 8,
			height: 8,
			borderRadius: 4,
		},
		statusBadgeText: {
			fontSize: 12,
			fontWeight: "700",
			textTransform: "uppercase",
		},
		subHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		packageName: {
			fontSize: 22,
			fontWeight: "800",
		},
		packagePrice: {
			fontSize: 20,
			fontWeight: "700",
			opacity: 0.8,
		},
		daysLeftRow: {
			flexDirection: "row",
			alignItems: "baseline",
			gap: 12,
			marginTop: 12,
		},
		daysLeftNumber: {
			fontSize: 32,
			fontWeight: "800",
		},
		daysLeftLabel: {
			fontSize: 16,
			fontWeight: "600",
			opacity: 0.8,
		},
		divider: {
			marginVertical: 15,
		},
		infoRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: 10,
		},
		infoRowLabel: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		infoLabel: {
			fontSize: 13,
			fontWeight: "600",
			opacity: 0.7,
		},
		infoValue: {
			fontSize: 14,
			fontWeight: "600",
		},
		notesSection: {
			paddingVertical: 10,
			gap: 6,
		},
		notesText: {
			fontSize: 13,
			opacity: 0.8,
			lineHeight: 18,
		},
		noSubscriptionCard: {
			alignItems: "center",
			paddingVertical: 30,
		},
		noSubscriptionTitle: {
			fontSize: 16,
			fontWeight: "700",
			textAlign: "center",
			opacity: 0.7,
		},
		noSubscriptionSubtitle: {
			fontSize: 13,
			fontWeight: "500",
			textAlign: "center",
			opacity: 0.4,
			marginTop: 4,
		},
		title: {
			fontSize: 22,
			fontWeight: "700",
			marginBottom: 20,
			textAlign: "center",
		},
		sectionTitle: {
			fontSize: 20,
			fontWeight: "bold",
			marginBottom: 8,
			marginTop: 13,
		},
		row: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: 12,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: theme.border,
		},
		rowLabel: {
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
			fontSize: 15,
			fontWeight: "600",
		},
		actionRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			gap: 20,
			marginBottom: 30,
		},
		noSubscriptionText: {
			flex: 1,
			fontSize: 13,
			fontWeight: "600",
			color: theme.red.foreground,
		},
		sellPackageButton: {
			paddingVertical: 14,
			alignItems: "center",
		},
		sellPackageButtonText: {
			color: darkMode ? "#000" : "#fff",
			fontSize: 16,
			fontWeight: "bold",
		},
		noSubContainer: {
			flex: 1,
			flexDirection: "row",
			gap: 8,
			alignItems: "center",
			borderWidth: 1,
			padding: 12,
			borderRadius: 8,
			borderColor: theme.red.foreground,
		},
		subButtonsContainer: {
			gap: 10,
		},
		cancelSubscriptionButton: {
			backgroundColor: theme.red.background,
			paddingVertical: 14,
			alignItems: "center",
			borderWidth: 1,
			borderColor: theme.red.foreground,
		},
		cancelSubscriptionButtonText: {
			color: theme.red.foreground,
			fontSize: 16,
			fontWeight: "bold",
		},
		// Body Metrics
		bodyMetricsContainer: {
			marginTop: 16,
			marginBottom: 8,
			paddingVertical: 16,
			paddingHorizontal: 12,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			borderRadius: 8,
			backgroundColor: darkMode ? "#111" : "#f8f8f8",
		},
		bodyMetricsRow: {
			flexDirection: "row",
			justifyContent: "space-around",
		},
		bodyMetricItem: {
			alignItems: "center",
			gap: 4,
		},
		bodyMetricLabel: {
			fontSize: 12,
			opacity: 0.6,
			fontWeight: "600",
		},
		bodyMetricValue: {
			fontSize: 16,
			fontWeight: "700",
		},
		pauseToggleButton: {
			backgroundColor: theme.orange.background,
			paddingVertical: 14,
			alignItems: "center",
			borderWidth: 1,
			borderColor: theme.orange.foreground,
		},
		pauseButtonText: {
			color: theme.orange.foreground,
			fontSize: 16,
			fontWeight: "bold",
		},
	})
}
