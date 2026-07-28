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

	const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
	const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)
	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

	const fetchMember = async () => {
		if (!uid) return
		setStatus("loading")

		const subscriptions = await getSubscriptionsByMemberId(uid)
		const activeSubscription = subscriptions.find((sub) => sub.status === "ACTIVE") || null

		setSubscriptions(subscriptions.filter((sub) => sub.id !== activeSubscription?.id))
		setActiveSubscription(activeSubscription)

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
				{subscriptions.length > 0 ? (
					<>
						<View style={styles.activePlanCard}>
							{/* Active Plan Card */}
							{activeSubscription ? (
								<SubscriptionView subscription={activeSubscription} />
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
						</View>

						{subscriptions.length > 0 ? (
							<>
								<View style={styles.titleContainer}>
									<ThemedIcon
										name="history"
										size={30}
										style={{ marginTop: 2.5 }}
									/>
									<ThemedText style={styles.sectionTitle}>{t("previousSubscriptions")}</ThemedText>
								</View>
								{subscriptions.map((sub) => (
									<View
										style={styles.activePlanCard}
										key={sub.id}
									>
										<SubscriptionView
											key={sub.id}
											subscription={sub}
										/>
									</View>
								))}
							</>
						) : (
							<></>
						)}
					</>
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
		sectionTitle: {
			fontSize: 20,
			fontWeight: "bold",
			marginBottom: 8,
			marginTop: 13,
		},
		titleContainer: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
			marginHorizontal: 15,
			marginTop: 10,
		},
	})
}
