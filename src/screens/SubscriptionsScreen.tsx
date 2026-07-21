import { useState, useCallback } from "react"
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import { useTranslation } from "react-i18next"

import ThemedText from "../components/ui/ThemedText"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"

import { daysSince, daysUntil, isThisMonth, safeTimestampToDateString, toDate } from "../utils/date"
import { Theme } from "../utils/theme"
import { moderateScale } from "../utils/responsive"
import { getAllSubscriptions } from "../lib/firebase/firestore/subscriptions"
import { getAllMembers } from "../lib/firebase/firestore/member"

type FilterType = "ALL" | "EXPIRING_SOON" | "RECENTLY_EXPIRED" | "PAUSED"

export default function SubscriptionsScreen() {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const theme = Theme[darkMode ? "dark" : "light"]

	const styles = createStyles(darkMode, theme)

	const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
	const [members, setMembers] = useState<Record<string, Member>>({})
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState<FilterType>("ALL")

	const FILTERS: { key: FilterType; label: string }[] = [
		{ key: "ALL", label: t("all") },
		{ key: "EXPIRING_SOON", label: t("expiring_soon") },
		{ key: "RECENTLY_EXPIRED", label: t("recently_expired") },
		{ key: "PAUSED", label: t("paused") },
	]

	const fetchData = useCallback(async () => {
		try {
			setLoading(true)

			const subscriptions = await getAllSubscriptions()
			const members = await getAllMembers()

			const membersMap: Record<string, any> = {}
			members.forEach((member) => {
				membersMap[member.uid] = member
			})

			setSubscriptions(subscriptions)
			setMembers(membersMap)
		} catch (e) {
			console.error("[SubscriptionsScreen] fetchData:", e)
		} finally {
			setLoading(false)
		}
	}, [])

	useFocusEffect(
		useCallback(() => {
			fetchData()
		}, [fetchData]),
	)

	const totalRevenueThisMonth = subscriptions.reduce((sum, sub) => {
		if (isThisMonth(sub.createdAt)) {
			return sum + (sub.price || 0)
		}
		return sum
	}, 0)

	const activeSubscriptionsCount = subscriptions.filter((s) => s.status === "ACTIVE").length

	const filteredSubscriptions = subscriptions.filter((sub: Subscription) => {
		const endDate = toDate(sub.endDate)
		switch (filter) {
			case "EXPIRING_SOON":
				return sub.status === "ACTIVE" && endDate && daysUntil(endDate) >= 0 && daysUntil(endDate) <= 7
			case "RECENTLY_EXPIRED":
				return sub.status === "EXPIRED" && endDate && daysSince(endDate) >= 0 && daysSince(endDate) <= 15
			case "PAUSED":
				return sub.status === "PAUSED"
			default:
				return true
		}
	})

	const renderItem = useCallback(
		({ item }: { item: Subscription }) => {
			const member = members[item.memberUid]
			const memberName = member ? `${member.firstName} ${member.lastName}` : "Bilinmeyen Üye"
			const endDate = safeTimestampToDateString(item.endDate)

			let statusColor = theme.green.foreground
			if (item.status === "PAUSED") statusColor = "#f0a500"
			if (item.status === "EXPIRED" || item.status === "CANCELLED") statusColor = theme.red.foreground

			const statusLabel =
				item.status === "ACTIVE"
					? t("active")
					: item.status === "PAUSED"
						? t("paused")
						: item.status === "EXPIRED"
							? t("expired")
							: t("cancelled")

			return (
				<TouchableOpacity
					style={styles.listItem}
					activeOpacity={0.7}
					onPress={() =>
						navigation.navigate("MemberDetailsScreen", {
							memberId: item.memberUid,
							prevScreen: "SubscriptionsScreen",
							initialPage: 1,
						})
					}
				>
					<View style={styles.listItemLeft}>
						<View style={[styles.statusDot, { backgroundColor: statusColor }]} />
						<View style={styles.listItemInfo}>
							<ThemedText
								style={styles.memberName}
								numberOfLines={1}
							>
								{memberName}
							</ThemedText>
							<ThemedText style={styles.subscriptionInfo}>
								{t(item.packageType)} · {endDate || "—"}
							</ThemedText>
						</View>
					</View>
					<View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
						<ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</ThemedText>
					</View>
				</TouchableOpacity>
			)
		},
		[members],
	)

	const keyExtractor = useCallback((item: Subscription, index: number) => item.id || index.toString(), [])

	if (loading) {
		return (
			<View style={styles.centered}>
				<ThemedActivityIndicator size="large" />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Summary Card */}
				<View style={styles.summaryCard}>
					<View style={styles.summaryColumn}>
						<ThemedText style={styles.summaryLabel}>{t("totalRevenueThisMonth")}</ThemedText>
						<ThemedText style={styles.summaryValue}>{totalRevenueThisMonth.toLocaleString("tr-TR")} ₺</ThemedText>
					</View>
					<View style={styles.summaryDivider} />
					<View style={styles.summaryColumn}>
						<ThemedText style={styles.summaryLabel}>{t("activeSubscriptions")}</ThemedText>
						<ThemedText style={styles.summaryValue}>{activeSubscriptionsCount}</ThemedText>
					</View>
				</View>

				{/* Filter Bar */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.filterBar}
					contentContainerStyle={styles.filterBarContent}
				>
					{FILTERS.map((f) => {
						const isActive = filter === f.key
						return (
							<TouchableOpacity
								key={f.key}
								style={[styles.filterButton, isActive && styles.filterButtonActive]}
								onPress={() => setFilter(f.key)}
								activeOpacity={0.7}
							>
								<ThemedText style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>{f.label}</ThemedText>
							</TouchableOpacity>
						)
					})}
				</ScrollView>

				{/* List */}
				<View style={styles.listContainer}>
					{filteredSubscriptions.length === 0 ? (
						<View style={styles.emptyState}>
							<ThemedText style={styles.emptyStateText}>{t("noSubscriptionsFound")}</ThemedText>
						</View>
					) : (
						<FlashList
							data={filteredSubscriptions}
							renderItem={renderItem}
							onRefresh={fetchData}
							keyExtractor={keyExtractor}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={styles.flashListContent}
						/>
					)}
				</View>
			</ScrollView>
		</View>
	)
}

const createStyles = (darkMode: boolean, theme: any) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		centered: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.background,
		},
		scrollContent: {
			flex: 1,
		},
		// Summary Card
		summaryCard: {
			flexDirection: "row",
			marginHorizontal: moderateScale(16),
			marginTop: moderateScale(16),
			padding: moderateScale(20),
			borderRadius: 16,
			backgroundColor: darkMode ? "#1a1a1a" : "#f0f0f0",
			borderWidth: 1,
			borderColor: theme.border,
		},
		summaryColumn: {
			flex: 1,
			alignItems: "center",
			gap: 8,
		},
		summaryDivider: {
			width: 1,
			backgroundColor: theme.border,
			marginHorizontal: moderateScale(16),
		},
		summaryLabel: {
			fontSize: 13,
			color: darkMode ? "#aaa" : "#666",
			fontWeight: "bold",
			letterSpacing: 0.5,
		},
		summaryValue: {
			fontSize: 24,
			fontWeight: "bold",
		},
		// Filter Bar
		filterBar: {
			marginTop: moderateScale(16),
			maxHeight: moderateScale(44),
		},
		filterBarContent: {
			paddingHorizontal: moderateScale(16),
			gap: 8,
		},
		filterButton: {
			paddingHorizontal: moderateScale(16),
			paddingVertical: moderateScale(8),
			borderRadius: 20,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: "transparent",
		},
		filterButtonActive: {
			backgroundColor: darkMode ? "#fff" : "#000",
			borderColor: darkMode ? "#fff" : "#000",
		},
		filterButtonText: {
			fontSize: 13,
			fontWeight: "bold",
		},
		filterButtonTextActive: {
			color: darkMode ? "#000" : "#fff",
			fontWeight: "bold",
		},
		// List
		listContainer: {
			flex: 1,
			marginTop: moderateScale(12),
			marginHorizontal: moderateScale(16),
			minHeight: moderateScale(300),
		},
		listItem: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: moderateScale(14),
			paddingHorizontal: moderateScale(16),
			borderRadius: 12,
			marginBottom: 8,
			backgroundColor: theme.cardBackground,
			borderWidth: 1,
			borderColor: theme.border,
		},
		listItemLeft: {
			flexDirection: "row",
			alignItems: "center",
			flex: 1,
			gap: 12,
		},
		statusDot: {
			width: 10,
			height: 10,
			borderRadius: 5,
		},
		listItemInfo: {
			flex: 1,
			gap: 4,
		},
		memberName: {
			fontSize: 15,
			fontWeight: "600",
		},
		subscriptionInfo: {
			fontSize: 12,
			opacity: 0.7,
		},
		statusBadge: {
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 8,
		},
		statusBadgeText: {
			fontSize: 12,
			fontWeight: "bold",
			letterSpacing: 0.5,
		},
		emptyState: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: moderateScale(60),
		},
		emptyStateText: {
			fontSize: 15,
			opacity: 0.6,
		},
		flashListContent: {
			paddingBottom: 10,
		},
	})
}
