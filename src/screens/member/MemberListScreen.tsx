import { useCallback, useEffect } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useMMKVBoolean, useMMKVObject } from "react-native-mmkv"

import ThemedText from "../../components/ui/ThemedText"
import ThemedIcon from "../../components/ui/ThemedIcon"
import MemberListCard from "../../components/MemberListCard"

import { getAllMembers } from "../../lib/firebase/firestore/member"
import { getAllSubscriptions } from "../../lib/firebase/firestore/subscriptions"

import { Theme } from "../../utils/theme"

export default function MemberListContent() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const route = useRoute<any>()

	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [members, setMembers] = useMMKVObject<MemberCard[]>("members")
	const [coldStart, setColdStart] = useMMKVBoolean("coldStart")
	const fetchMembers = async () => {
		try {
			const membersData = await getAllMembers()
			const subscriptionsData = await getAllSubscriptions()

			const membersWithSubscription = membersData.map((member) => {
				const subscriptionStatus = subscriptionsData.find((sub: Subscription) => sub.memberUid === member.uid)?.status || "NONE"
				return { ...member, subscriptionStatus }
			})

			setMembers(membersWithSubscription)
		} catch (e) {
			console.error("Error fetching members:", e)
		}
	}

	useEffect(() => {
		if (route.params?.refresh || members?.length === 0 || coldStart) {
			fetchMembers()
			if (coldStart) setColdStart(false)
			setTimeout(() => navigation.setParams({ refresh: false }), 300)
		}
	}, [])

	const renderItem = useCallback(({ item }: { item: MemberCard }) => {
		return <MemberListCard member={item} />
	}, [])

	const keyExtractor = useCallback((item: MemberCard) => item.uid, [])

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.searchBar}
				onPress={() => navigation.navigate("SearchScreen")}
			>
				<ThemedIcon
					name="magnify"
					size={23}
				/>
				<ThemedText style={styles.searchBarText}>{t("searchMembers")}</ThemedText>
			</TouchableOpacity>

			<FlashList
				data={members}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				contentContainerStyle={styles.list}
				onRefresh={fetchMembers}
			/>

			<TouchableOpacity
				style={styles.fab}
				onPress={() => navigation.navigate("MemberFormScreen")}
			>
				<ThemedIcon
					name="plus"
					size={25}
					color={darkMode ? "#000" : "#fff"}
				/>
			</TouchableOpacity>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
		},
		searchBar: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			borderRadius: 8,
			marginHorizontal: 15,
			marginTop: 10,
			marginBottom: 8,
			paddingHorizontal: 16,
			paddingVertical: 16,
			gap: 15,
		},
		searchBarText: {
			fontSize: 17,
		},
		list: {
			paddingHorizontal: 16,
			paddingBottom: 80,
			marginTop: 10,
		},
		fab: {
			position: "absolute",
			bottom: 24,
			right: 24,
			width: 56,
			height: 56,
			borderRadius: 28,
			backgroundColor: darkMode ? "#fff" : "#000",
			alignItems: "center",
			justifyContent: "center",
		},
	})
}
