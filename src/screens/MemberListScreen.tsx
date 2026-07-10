import { useCallback, useEffect } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useMMKVObject } from "react-native-mmkv"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"

import { getAllMembers } from "../lib/firebase/firestore/member"
import { Theme } from "../utils/theme"

export default function MemberListContent() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const route = useRoute<any>()

	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [members, setMembers] = useMMKVObject<Member[]>("members")

	// TODO : IMPLEMENT PAGINATION AS SCROLL REACHES TO END OF THE LIST, CURRENTLY IT LOADS ALL MEMBERS AT ONCE
	// 10 USER AT EVERY SCROLL END
	const fetchMembers = async () => {
		try {
			const membersData = await getAllMembers()
			setMembers(membersData)
		} catch (e) {
			console.error("Error fetching members:", e)
		}
	}

	useEffect(() => {
		if (route.params?.refresh || members?.length === 0) {
			fetchMembers()
			navigation.setParams({ refresh: false })
		}
	}, [])

	const renderItem = useCallback(
		({ item }: { item: Member }) => (
			<TouchableOpacity
				style={styles.item}
				onPress={() => navigation.navigate("MemberDetailsScreen", { memberId: item.uid })}
			>
				<ThemedIcon
					name={item.gender === "FEMALE" ? "female" : "male"}
					size={45}
					color={darkMode ? "#fff" : "#000"}
					style={{ marginRight: 12, opacity: 0.9, borderRadius: 22.5 }}
				/>
				<View>
					<ThemedText style={styles.itemName}>
						{item.firstName} {item.lastName}
					</ThemedText>
					<ThemedText style={styles.itemPhone}>{item.email}</ThemedText>
				</View>
			</TouchableOpacity>
		),
		[navigation, styles],
	)

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
				keyExtractor={(item: Member, index: number) => item.uid ?? index.toString()}
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
		},
		item: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 14,
			borderBottomWidth: 1,
			borderBottomColor: theme.border,
		},
		itemName: {
			fontSize: 16,
			fontWeight: "600",
		},
		itemPhone: {
			fontSize: 14,
			marginTop: 2,
			opacity: 0.7,
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
