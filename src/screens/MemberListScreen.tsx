import { View, TouchableOpacity, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useMMKVObject } from "react-native-mmkv"
import { useTranslation } from "react-i18next"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"
import ThemedIcon from "../components/ui/ThemedIcon"

export default function MemberListScreen() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [members] = useMMKVObject<Member[]>("members")

	const renderItem = ({ item }: { item: any }) => (
		<TouchableOpacity
			style={styles.item}
			onPress={() => navigation.navigate("MemberDetailsScreen", { memberId: item.uid })}
		>
			<ThemedText style={styles.itemName}>
				{item.firstName} {item.lastName}
			</ThemedText>
			<ThemedText style={styles.itemPhone}>{item.phoneNumber}</ThemedText>
		</TouchableOpacity>
	)

	return (
		<View style={styles.container}>
			<CustomHeader title={t("members")} />
			<TouchableOpacity
				style={styles.searchBar}
				onPress={() => navigation.navigate("SearchScreen")}
			>
				<ThemedText style={styles.searchBarText}>{t("searchMembers")}</ThemedText>
			</TouchableOpacity>

			<FlashList
				data={members}
				renderItem={renderItem}
				keyExtractor={(item: any, index: number) => item.uid ?? index.toString()}
				contentContainerStyle={styles.list}
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

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		searchBar: {
			marginHorizontal: 16,
			marginTop: 8,
			marginBottom: 8,
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: darkMode ? "#1a1a1a" : "#f0f0f0",
			borderRadius: 10,
		},
		searchBarText: {
			fontSize: 15,
			color: darkMode ? "#666" : "#999",
		},
		list: {
			paddingHorizontal: 16,
			paddingBottom: 80,
		},
		item: {
			paddingVertical: 14,
			borderBottomWidth: 1,
			borderBottomColor: darkMode ? "#222" : "#eee",
		},
		itemName: {
			fontSize: 16,
			fontWeight: "600",
		},
		itemPhone: {
			fontSize: 14,
			color: darkMode ? "#aaa" : "#666",
			marginTop: 2,
		},
		fab: {
			position: "absolute",
			bottom: 24,
			right: 24,
			width: 56,
			height: 56,
			borderRadius: 28,
			backgroundColor: darkMode ? "#ffffff" : "#000000",
			alignItems: "center",
			justifyContent: "center",
			elevation: 4,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.25,
			shadowRadius: 4,
		},
	})
