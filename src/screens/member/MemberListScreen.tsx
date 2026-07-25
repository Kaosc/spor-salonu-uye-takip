import { useCallback, useEffect, useRef, useState } from "react"
import { View, TouchableOpacity, StyleSheet, BackHandler, FlatList } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useMMKVBoolean } from "react-native-mmkv"

import ThemedText from "../../components/ui/ThemedText"
import ThemedIcon from "../../components/ui/ThemedIcon"
import MemberListCard from "../../components/MemberListCard"

import { getMembersPaged } from "../../lib/firebase/firestore/member"

import { Theme } from "../../utils/theme"

export default function MemberListContent() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const route = useRoute<any>()

	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [coldStart, setColdStart] = useMMKVBoolean("coldStart")

	const [members, setMembers] = useState<Member[]>([])
	const [refreshing, setRefreshing] = useState(false)

	const lastSnapshotRef = useRef<any>(null)
	const isLoadingMoreRef = useRef(false)

	useEffect(() => {
		const backAction = () => {
			navigation.navigate("DashboardScreen")
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	const fetchMembers = async (isRefresh: boolean = false) => {
		if (isRefresh) {
			setRefreshing(true)
			lastSnapshotRef.current = null
		}

		try {
			const cursor = isRefresh ? undefined : lastSnapshotRef.current
			const { members: membersData, lastSnapshot } = await getMembersPaged(cursor)

			if (membersData.length === 0) {
				return
			}

			lastSnapshotRef.current = lastSnapshot

			if (isRefresh) {
				setMembers(membersData as Member[])
			} else {
				setMembers([...(members || []), ...(membersData as Member[])])
			}
		} catch (e) {
			console.error("Error fetching members:", e)
		}

		if (isRefresh) {
			setRefreshing(false)
		}
	}

	const onRefresh = () => {
		fetchMembers(true)
	}

	const onEndReached = () => {
		if (isLoadingMoreRef.current) return
		isLoadingMoreRef.current = true
		fetchMembers(false).finally(() => {
			isLoadingMoreRef.current = false
		})
	}

	useEffect(() => {
		if (route.params?.refresh || members?.length === 0 || coldStart) {
			fetchMembers()
			if (coldStart) setColdStart(false)
			setTimeout(() => navigation.setParams({ refresh: false }), 300)
		}
	}, [])

	const renderItem = useCallback(({ item }: { item: Member }) => {
		return <MemberListCard member={item} />
	}, [])

	const keyExtractor = useCallback((item: Member) => item.uid, [])

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.searchButtonContainer}
				onPress={() => navigation.navigate("SearchScreen")}
			>
				<ThemedIcon
					name="magnify"
					size={25}
					style={styles.searchIcon}
				/>
				<ThemedText style={styles.searchText}>{t("searchMembers")}</ThemedText>
			</TouchableOpacity>

			<FlatList
				data={members}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				contentContainerStyle={styles.list}
				onRefresh={onRefresh}
				onEndReached={onEndReached}
				refreshing={refreshing}
				onEndReachedThreshold={0.1}
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
		searchButtonContainer: {
			flexDirection: "row",
			alignItems: "center",
			borderRadius: 8,
			marginHorizontal: 15,
			marginTop: 10,
			marginBottom: 8,
			gap: 10,
		},
		searchIcon: {
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			paddingHorizontal: 16,
			borderRadius: 15,
			paddingVertical: 16,
		},
		searchText: {
			fontSize: 17,
			flex: 1,
			borderRadius: 15,
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			paddingHorizontal: 16,
			paddingVertical: 16,
		},
		list: {
			paddingHorizontal: 16,
			paddingBottom: 100,
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
