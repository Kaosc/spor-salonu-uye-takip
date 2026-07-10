import { useState, useMemo, useEffect, useRef } from "react"
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useMMKVObject } from "react-native-mmkv"
import Fuse from "fuse.js"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"

import { Theme } from "../utils/theme"

export default function SearchScreen() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)

	const styles = createStyles(darkMode)

	const [members] = useMMKVObject<Member[]>("members")
	const [query, setQuery] = useState("")
	const [debouncedQuery, setDebouncedQuery] = useState("")

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	
	useEffect(() => {
		if (timerRef.current) clearTimeout(timerRef.current)

		timerRef.current = setTimeout(() => setDebouncedQuery(query), 400)

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [query])

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
		return fuse.search(debouncedQuery).map((r) => r.item)
	}, [debouncedQuery, fuse])

	const renderItem = ({ item }: { item: Member }) => (
		<TouchableOpacity
			style={styles.item}
			onPress={() => {
				navigation.navigate("MemberDetailsScreen", { memberId: item.uid, prevScreen: "SearchScreen" })
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
			<View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 10, marginTop: 12 }}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
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
					placeholder="İsim veya telefon ile ara..."
					placeholderTextColor={darkMode ? "#666" : "#999"}
					value={query}
					onChangeText={setQuery}
					autoFocus
					autoCapitalize="none"
				/>
			</View>
			<FlashList
				data={filtered}
				renderItem={renderItem}
				keyExtractor={(item: any, index: number) => item.uid ?? index.toString()}
				contentContainerStyle={styles.list}
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
			borderRadius: 12,
			fontSize: 15,
			height: 55,
			color: darkMode ? "#fff" : "#000",
		},
		list: {
			paddingHorizontal: 16,
		},
		item: {
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
			color: darkMode ? "#aaa" : "#666",
			marginTop: 2,
		},
		backButtonContainer: {
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: theme.cardBackground,
			borderRadius: 12,
		},
	})
}
