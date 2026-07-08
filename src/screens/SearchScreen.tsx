import React, { useState, useMemo } from "react"
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { createMMKV } from "react-native-mmkv"
import Fuse from "fuse.js"
import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"

const storage = createMMKV()

export default function SearchScreen() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const [query, setQuery] = useState("")
	const styles = createStyles(darkMode)

	const raw = storage.getString("members")
	const allMembers: any[] = raw ? JSON.parse(raw) : []

	const fuse = useMemo(
		() =>
			new Fuse(allMembers, {
				keys: ["firstName", "lastName", "phoneNumber"],
				threshold: 0.3,
			}),
		[allMembers]
	)

	const filtered = useMemo(() => {
		if (!query.trim()) return []
		return fuse.search(query).map((r) => r.item)
	}, [query, fuse])

	const renderItem = ({ item }: { item: any }) => (
		<TouchableOpacity
			style={styles.item}
			onPress={() => {
				navigation.navigate("MemberDetailsScreen", { memberId: item.uid })
			}}
		>
			<ThemedText style={styles.itemName}>
				{item.firstName} {item.lastName}
			</ThemedText>
			<ThemedText style={styles.itemPhone}>{item.phoneNumber}</ThemedText>
		</TouchableOpacity>
	)

	return (
		<View style={styles.container}>
			<CustomHeader title="Üye Ara" />
			<TextInput
				style={styles.input}
				placeholder="İsim veya telefon ile ara..."
				placeholderTextColor={darkMode ? "#666" : "#999"}
				value={query}
				onChangeText={setQuery}
				autoFocus
				autoCapitalize="none"
			/>

			<FlashList
				data={filtered}
				renderItem={renderItem}
				keyExtractor={(item: any, index: number) => item.uid ?? index.toString()}
				contentContainerStyle={styles.list}
			/>
		</View>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		input: {
			margin: 16,
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: darkMode ? "#1a1a1a" : "#f0f0f0",
			borderRadius: 10,
			fontSize: 15,
			color: darkMode ? "#e9e9e9" : "#000",
		},
		list: {
			paddingHorizontal: 16,
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
	})