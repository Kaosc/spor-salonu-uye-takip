import { useEffect, useState } from "react"
import { View, ScrollView, StyleSheet } from "react-native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

import ThemedText from "../../components/ui/ThemedText"
import ThemedIcon from "../../components/ui/ThemedIcon"
import CustomHeader from "../../components/CustomHeader"
import SubscriptionView from "../../components/SubscriptionView"

import { getSubscriptionsByMemberId } from "../../lib/firebase/firestore/subscriptions"

import { Theme } from "../../utils/theme"
import { moderateScale } from "../../utils/responsive"
import { BOTTOM_TAB_HEIGHT } from "../../lib/constants"

export default function MemberSubscriptionsScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { uid } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()
	const styles = createStyles(darkMode)

	const [subscription, setSubscription] = useState<Subscription | null>(null)

	const fetchMember = async () => {
		if (!uid) return

		const subscriptions = await getSubscriptionsByMemberId(uid)
		setSubscription(subscriptions.length > 0 ? subscriptions[0] : null)
	}

	useEffect(() => {
		fetchMember()
	}, [])

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
			paddingBottom: BOTTOM_TAB_HEIGHT + moderateScale(20),
		},
		activePlanCard: {
			marginHorizontal: moderateScale(16),
			marginTop: moderateScale(20),
			padding: moderateScale(24),
			borderRadius: 16,
			backgroundColor: darkMode ? "#1a1a1a" : "#f0f0f0",
			borderWidth: 1,
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
