import { forwardRef, useMemo } from "react"
import { TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet"
import { useSelector } from "react-redux"

import ThemedText from "./ThemedText"
import ThemedIcon from "./ThemedIcon"

import { AllIconNames } from "../../types/icon"

interface BottomSheetListItem {
	text: string
	onPress: () => void
	icon?: AllIconNames
}

interface ThemedBottomSheetProps {
	items: BottomSheetListItem[]
	snapPoints?: string[]
}

const ThemedBottomSheet = forwardRef<BottomSheet, ThemedBottomSheetProps>(({ items, snapPoints }, ref) => {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	const points = useMemo(() => snapPoints || ["50%"], [snapPoints])

	return (
		<BottomSheet
			ref={ref}
			snapPoints={points}
			enablePanDownToClose
			index={-1}
			backgroundStyle={styles.sheet}
			handleIndicatorStyle={styles.indicator}
		>
			<BottomSheetView style={styles.content}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					{items.map((item, index) => (
						<TouchableOpacity
							key={index}
							style={styles.item}
							onPress={item.onPress}
							activeOpacity={0.6}
						>
							{item.icon && (
								<ThemedIcon
									name={item.icon}
									size={22}
									style={styles.icon}
								/>
							)}
							<ThemedText style={styles.itemText}>{item.text}</ThemedText>
						</TouchableOpacity>
					))}
				</ScrollView>
			</BottomSheetView>
		</BottomSheet>
	)
})

ThemedBottomSheet.displayName = "ThemedBottomSheet"

export default ThemedBottomSheet

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		sheet: {
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
		},
		indicator: {
			backgroundColor: darkMode ? "#555" : "#ccc",
		},
		content: {
			flex: 1,
		},
		scrollContent: {
			paddingHorizontal: 16,
			paddingBottom: 24,
		},
		item: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 14,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: darkMode ? "#333" : "#e0e0e0",
		},
		icon: {
			marginRight: 14,
		},
		itemText: {
			fontSize: 16,
		},
	})