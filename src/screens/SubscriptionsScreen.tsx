import { useState, useCallback, useEffect, useRef } from "react"
import { View, TouchableOpacity, StyleSheet, BackHandler, FlatList } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import ThemedText from "../components/ui/ThemedText"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"

import { daysUntil, isThisMonth, safeTimestampToDateString, toDate } from "../utils/date"
import { Theme } from "../utils/theme"
import { moderateScale } from "../utils/responsive"
import { getSubscriptionsPaged } from "../lib/firebase/firestore/subscriptions"

type FilterType = "ALL" | "EXPIRING_SOON" | "RECENTLY_EXPIRED" | "PAUSED"

export default function SubscriptionsScreen() {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const theme = Theme[darkMode ? "dark" : "light"]

	const styles = createStyles(darkMode, theme)

	const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [filter, setFilter] = useState<FilterType>("ALL")

	const lastDocRef = useRef<any>(null)
	const isLoadingMoreRef = useRef(false)

	const FILTERS: { key: FilterType; label: string }[] = [
		{ key: "ALL", label: t("all") },
		{ key: "EXPIRING_SOON", label: t("expiring_soon") },
		{ key: "RECENTLY_EXPIRED", label: t("recently_expired") },
		{ key: "PAUSED", label: t("paused") },
	]

	useEffect(() => {
		const backAction = () => {
			navigation.goBack()
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	const fetchData = useCallback(async (isRefresh: boolean = false) => {
		if (isRefresh) {
			setRefreshing(true)
			lastDocRef.current = null
		}

		try {
			const cursor = isRefresh ? undefined : lastDocRef.current
			const { subscriptions: subscriptionsData, lastSnapshot } = await getSubscriptionsPaged(cursor)

			if (subscriptionsData.length === 0) {
				return
			}

			lastDocRef.current = lastSnapshot

			if (isRefresh) {
				setSubscriptions(subscriptionsData)
			} else {
				setSubscriptions((prev) => [...prev, ...subscriptionsData])
			}
		} catch (e) {
			console.error("[SubscriptionsScreen] fetchData:", e)
		} finally {
			setLoading(false)
			if (isRefresh) {
				setRefreshing(false)
			}
		}
	}, [])

	useFocusEffect(
		useCallback(() => {
			setLoading(true)
			lastDocRef.current = null
			setSubscriptions([])
			fetchData()
		}, [fetchData]),
	)

	const onEndReached = () => {
		if (isLoadingMoreRef.current) return
		isLoadingMoreRef.current = true
		fetchData(false).finally(() => {
			isLoadingMoreRef.current = false
		})
	}

	const totalRevenueThisMonth = subscriptions.reduce((sum, sub) => {
		if (sub?.price) {
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
				return sub.status === "EXPIRED"
			case "PAUSED":
				return sub.status === "PAUSED"
			default:
				return true
		}
	}).filter((sub) => sub?.memberUid)

	const renderItem = useCallback(
		({ item }: { item: Subscription }) => {
			const memberName = item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : "Bilinmeyen Üye"
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
		[darkMode],
	)

	const keyExtractor = useCallback((item: Subscription, index: number) => item.id || index.toString(), [])

	const ListHeaderComponent = useCallback(
		() => (
			<>
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
				<View style={styles.filterBar}>
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
				</View>
			</>
		),
		[filter, totalRevenueThisMonth, activeSubscriptionsCount],
	)

	if (loading && subscriptions.length === 0) {
		return (
			<View style={styles.centered}>
				<ThemedActivityIndicator size="large" />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={filteredSubscriptions}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.flashListContent}
				ListHeaderComponent={ListHeaderComponent}
				onRefresh={() => fetchData(true)}
				refreshing={refreshing}
				onEndReached={onEndReached}
				onEndReachedThreshold={0.1}
			/>
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
		// Summary Card
		summaryCard: {
			flexDirection: "row",
			marginHorizontal: moderateScale(16),
			marginTop: moderateScale(16),
			padding: moderateScale(20),
			borderRadius: 16,
			backgroundColor: theme.cardBackground,
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
			flexDirection: "row",
			marginTop: moderateScale(16),
			marginBottom: moderateScale(12),
			marginHorizontal: moderateScale(16),
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
		listItem: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: moderateScale(14),
			paddingHorizontal: moderateScale(16),
			borderRadius: 12,
			marginBottom: 8,
			marginHorizontal: moderateScale(16),
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
		flashListContent: {
			paddingBottom: 20,
		},
	})
}
