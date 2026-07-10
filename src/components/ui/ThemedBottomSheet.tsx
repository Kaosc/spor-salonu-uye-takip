import { useCallback, useEffect, useMemo, useState } from "react"
import { TouchableOpacity, ScrollView, StyleSheet, BackHandler } from "react-native"
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from "@gorhom/bottom-sheet"
import { useSelector } from "react-redux"

import ThemedText from "./ThemedText"
import ThemedIcon from "./ThemedIcon"

import { AllIconNames } from "../../types/icon"
import { Theme } from "../../utils/theme"

interface BottomSheetListItem {
	text: string
	onPress: () => void
	icon?: AllIconNames
}

interface ThemedBottomSheetProps {
	items: BottomSheetListItem[]
	snapPoints?: string[]
	ref?: React.RefObject<BottomSheet | null>
}

export default function ThemedBottomSheet({ items, snapPoints, ref }: ThemedBottomSheetProps) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	const [isOpen, setIsOpen] = useState(false)
	const points = useMemo(() => snapPoints || ["50%"], [snapPoints])

	useEffect(() => {
		const backAction = () => {
			if (isOpen) {
				ref?.current?.close()
				return true
			}
			return false
		}

		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)

		return () => backHandler.remove()
	}, [isOpen])

	const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
		return (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				opacity={0.5}
				pressBehavior={"close"}
			/>
		)
	}, [])

	return (
		<BottomSheet
			ref={ref}
			snapPoints={points}
			enablePanDownToClose
			index={-1}
			onChange={(index) => setIsOpen(index !== -1)}
			backgroundStyle={styles.sheet}
			handleIndicatorStyle={styles.indicator}
			backdropComponent={renderBackdrop}
		>
			<BottomSheetView style={styles.content}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					{items.map((item, index) => (
						<TouchableOpacity
							key={index}
							style={[styles.item, index === items.length - 1 && { borderBottomWidth: 0 }]}
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
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		sheet: {
			backgroundColor: theme.cardBackground,
		},
		indicator: {
			backgroundColor: theme.text,
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
			borderBottomColor: darkMode ? "#757575" : "#bdbdbd",
		},
		icon: {
			marginRight: 14,
		},
		itemText: {
			fontSize: 17,
			fontWeight: "bold",
		},
		backdrop: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
		},
	})
}
