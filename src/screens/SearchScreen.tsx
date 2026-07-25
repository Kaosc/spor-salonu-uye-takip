import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { View, TextInput, TouchableOpacity, StyleSheet, BackHandler } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import Fuse from "fuse.js"

import ThemedIcon from "../components/ui/ThemedIcon"
import MemberListCard from "../components/MemberListCard"
import ThemedText from "../components/ui/ThemedText"

import { Theme } from "../utils/theme"
import { getAllMembers } from "../lib/firebase/firestore/member"

export default function SearchScreen() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const route = useRoute<any>()
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [members, setMembers] = useState<Member[]>([])
	const [search, setSearch] = useState(route.params?.search || "")
	const [debouncedQuery, setDebouncedQuery] = useState("")

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const searchRef = useRef<string | null>(null)

	useEffect(() => {
		const backAction = () => {
			goBack()
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	const goBack = () => {
		navigation.navigate("Tabs", { screen: "MemberStack" })
	}

	const fetchMembers = useCallback(async () => {
		console.debug("[SearchScreen] fetchMembers")
		const fetchedMembers = await getAllMembers()
		setMembers(fetchedMembers)
	}, [])

	useEffect(() => {
		fetchMembers()
	}, [fetchMembers])

	useEffect(() => {
		if (timerRef.current) clearTimeout(timerRef.current)

		timerRef.current = setTimeout(() => setDebouncedQuery(search), 400)

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [search])

	const fuse = useMemo(() => {
		if (members) {
			return new Fuse(members, {
				keys: ["firstName", "lastName", "phoneNumber", "email"],
				threshold: 0.3,
			})
		} else {
			return new Fuse([], {})
		}
	}, [members])

	const filtered = useMemo(() => {
		if (!debouncedQuery.trim()) return []
		searchRef.current = search
		return fuse.search(debouncedQuery).map((r) => r.item)
	}, [debouncedQuery, fuse])

	const renderItem = useCallback(({ item }: { item: Member }) => {
		return (
			<MemberListCard
				member={item}
				search={searchRef.current}
			/>
		)
	}, [])

	const keyExtractor = useCallback((item: Member) => item.uid, [])

	const EmptyComponent = useCallback(() => {
		return (
			<View style={styles.emptyPageContainer}>
				<ThemedIcon
					name={debouncedQuery && filtered.length === 0 ? "magnify-close" : "magnify"}
					size={100}
					style={{ opacity: 0.6 }}
				/>
				<ThemedText style={{ opacity: 0.6 }}>
					{debouncedQuery && filtered.length === 0 ? t("noMembersFound") : t("searchMembers")}
				</ThemedText>
			</View>
		)
	}, [debouncedQuery, darkMode])

	return (
		<View style={styles.container}>
			<View style={styles.searchContainer}>
				<TouchableOpacity
					onPress={goBack}
					style={styles.backButtonContainer}
				>
					<ThemedIcon
						name="arrow-left"
						size={24}
						style={{ margin: 15 }}
					/>
				</TouchableOpacity>
				<TextInput
					style={styles.input}
					placeholder={t("searchPlaceholder")}
					placeholderTextColor={darkMode ? "#666" : "#999"}
					value={search}
					onChangeText={setSearch}
					autoFocus
					autoCapitalize="none"
				/>
			</View>
			<FlashList
				data={filtered}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				contentContainerStyle={styles.list}
				ListEmptyComponent={EmptyComponent}
			/>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
		},
		input: {
			flex: 1,
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: theme.cardBackground,
			borderColor: theme.border,
			borderWidth: StyleSheet.hairlineWidth,
			borderRadius: 12,
			fontSize: 15,
			height: 55,
			color: darkMode ? "#fff" : "#000",
		},
		list: {
			flexGrow: 1,
			paddingHorizontal: 16,
			marginTop: 10,
		},
		backButtonContainer: {
			justifyContent: "center",
			alignItems: "center",
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
			borderRadius: 12,
		},
		searchContainer: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
			marginHorizontal: 10,
			marginTop: 12,
		},
		emptyPageContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: 15,
		},
	})
}
