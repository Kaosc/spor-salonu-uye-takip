import { useEffect, useState } from "react"
import { View, ScrollView, StyleSheet } from "react-native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

import ThemedText from "../../components/ui/ThemedText"
import ThemedIcon from "../../components/ui/ThemedIcon"
import CustomHeader from "../../components/CustomHeader"
import SubscriptionView from "../../components/SubscriptionView"
import ThemedActivityIndicator from "../../components/ui/ThemedActivityIndicator"

import { getSubscriptionsByMemberId } from "../../lib/firebase/firestore/subscriptions"

import { Theme } from "../../utils/theme"
import { moderateScale } from "../../utils/responsive"

export default function MemberSubscriptionsScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { uid } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()
	const styles = createStyles(darkMode)

	const [subscription, setSubscription] = useState<Subscription | null>(null)
	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

	const fetchMember = async () => {
		if (!uid) return

		setStatus("loading")
		const subscriptions = await getSubscriptionsByMemberId(uid)
		setSubscription(subscriptions.length > 0 ? subscriptions[0] : null)
		setStatus("idle")
	}

	useEffect(() => {
		fetchMember()
	}, [])

	if (status === "loading") {
		return (
			<View
				style={[
					styles.container,
					{
						alignItems: "center",
						justifyContent: "center",
					},
				]}
			>
				<ThemedActivityIndicator size={60} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={t("mySubscriptions")}
				showBackButton={false}
			/>

			<ScrollView
				style={styles.scrollContent}
				contentContainerStyle={styles.scrollContentContainer}
				showsVerticalScrollIndicator={false}
			>
				{subscription ? (
					<View style={styles.activePlanCard}>
						{/* Active Plan Card */}
						<SubscriptionView subscription={subscription} />
					</View>
				) : (
					<View style={styles.placeholderContainer}>
						<ThemedIcon
							name="alert"
							size={50}
							style={{ opacity: 0.7 }}
						/>
						<ThemedText style={styles.placeholderText}>{t("noActiveSubscription")}</ThemedText>
					</View>
				)}
			</ScrollView>
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
		scrollContent: {
			flex: 1,
		},
		scrollContentContainer: {
			flexGrow: 1,
			paddingBottom: 15,
		},
		activePlanCard: {
			marginHorizontal: 10,
			marginTop: 16,
			padding: moderateScale(24),
			borderRadius: 16,
			borderWidth: 1,
			backgroundColor: theme.cardBackground,
			borderColor: theme.border,
		},
		planHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: moderateScale(16),
		},
		planBadge: {
			paddingHorizontal: 12,
			paddingVertical: 4,
			borderRadius: 12,
			backgroundColor: darkMode ? "#1f492d" : "#b5ffb3",
		},
		planBadgeText: {
			fontSize: 12,
			fontWeight: "700",
			color: darkMode ? "#27f08b" : "#0b8b4b",
		},
		planTitle: {
			fontSize: 14,
			opacity: 0.6,
			fontWeight: "500",
		},
		planName: {
			fontSize: 22,
			fontWeight: "800",
			marginTop: 4,
		},
		planDivider: {
			height: 1,
			backgroundColor: theme.border,
			marginVertical: moderateScale(16),
		},
		planInfoRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: moderateScale(8),
		},
		planInfoLabel: {
			fontSize: 14,
			opacity: 0.6,
			fontWeight: "500",
		},
		planInfoValue: {
			fontSize: 15,
			fontWeight: "700",
		},
		placeholderContainer: {
			flexGrow: 1,
			alignItems: "center",
			justifyContent: "center",
			gap: 12,
		},
		placeholderText: {
			fontSize: 19,
			opacity: 0.5,
			textAlign: "center",
		},
	})
}
