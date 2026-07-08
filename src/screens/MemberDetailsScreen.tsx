import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useMMKVObject } from "react-native-mmkv"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"
import ThemedIcon from "../components/ui/ThemedIcon"

export default function MemberDetailsScreen() {
	const navigation = useNavigation<any>()
	const route = useRoute<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)

	const styles = createStyles(darkMode)

	const [members] = useMMKVObject<Member[]>("members")
	const member = members?.find((m) => m.uid === route.params?.memberId)

	const editButton = (
		<TouchableOpacity onPress={() => navigation.navigate("MemberFormScreen", { memberId: member?.uid })}>
			<ThemedIcon
				name="pen"
				size={24}
				color={darkMode ? "#fff" : "#000"}
			/>
		</TouchableOpacity>
	)

	if (!member) {
		return (
			<View style={styles.container}>
				<CustomHeader title="Üye Detay" />
				<View style={styles.card}>
					<ThemedText style={styles.label}>Üye bulunamadı</ThemedText>
				</View>
				<TouchableOpacity
					style={styles.button}
					onPress={() => navigation.goBack()}
				>
					<ThemedText style={styles.buttonText}>Geri Dön</ThemedText>
				</TouchableOpacity>
			</View>
		)
	}

	const formatDate = (d: any) => (d ? new Date(d).toLocaleDateString("tr-TR") : "-")

	return (
		<View style={styles.container}>
			<CustomHeader
				title="Üye Detay"
				rightComponent={editButton}
			/>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.card}>
					<ThemedIcon
						name="account-circle"
						size={80}
						color={darkMode ? "#fff" : "#000"}
						style={{ alignSelf: "center", marginBottom: 20 }}
					/>

					<ThemedText style={styles.title}>
						{member.firstName} {member.lastName}
					</ThemedText>

					<View style={styles.row}>
						<ThemedText style={styles.label}>Telefon</ThemedText>
						<ThemedText style={styles.value}>{member.phoneNumber || "-"}</ThemedText>
					</View>

					<View style={styles.row}>
						<ThemedText style={styles.label}>E-posta</ThemedText>
						<ThemedText style={styles.value}>{member.email || "-"}</ThemedText>
					</View>

					<View style={styles.row}>
						<ThemedText style={styles.label}>Cinsiyet</ThemedText>
						<ThemedText style={styles.value}>{member.gender || "-"}</ThemedText>
					</View>

					<View style={styles.row}>
						<ThemedText style={styles.label}>Doğum Tarihi</ThemedText>
						<ThemedText style={styles.value}>{formatDate(member.birthDate)}</ThemedText>
					</View>

					<View style={styles.row}>
						<ThemedText style={styles.label}>Kan Grubu</ThemedText>
						<ThemedText style={styles.value}>{member.bloodType || "-"}</ThemedText>
					</View>

					<View style={styles.row}>
						<ThemedText style={styles.label}>Dolap No</ThemedText>
						<ThemedText style={styles.value}>{member.lockerNumber || "-"}</ThemedText>
					</View>

					<View style={styles.row}>
						<ThemedText style={styles.label}>Aktif</ThemedText>
						<ThemedText style={styles.value}>{member.isActive ? "Evet" : "Hayır"}</ThemedText>
					</View>

					<View style={styles.row}>
						<ThemedText style={styles.label}>Kayıt Tarihi</ThemedText>
						<ThemedText style={styles.value}>{formatDate(member.createdAt)}</ThemedText>
					</View>

					<View style={styles.row}>
						<ThemedText style={styles.label}>Güncelleme</ThemedText>
						<ThemedText style={styles.value}>{formatDate(member.updatedAt)}</ThemedText>
					</View>

					<View style={styles.row}>
						<ThemedText style={styles.label}>Kaydeden</ThemedText>
						<ThemedText style={styles.value}>{member.createdBy || "-"}</ThemedText>
					</View>

					<ThemedText style={styles.sectionTitle}>Acil Durum Kişisi</ThemedText>
					<View style={styles.row}>
						<ThemedText style={styles.label}>Ad Soyad</ThemedText>
						<ThemedText style={styles.value}>{member.emergencyContact?.name || "-"}</ThemedText>
					</View>
					<View style={styles.row}>
						<ThemedText style={styles.label}>Telefon</ThemedText>
						<ThemedText style={styles.value}>{member.emergencyContact?.phone || "-"}</ThemedText>
					</View>
				</View>
			</ScrollView>
		</View>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#f5f5f5",
		},
		scrollContent: {
			padding: 20,
			flexGrow: 1,
		},
		card: {
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
			borderRadius: 12,
			padding: 20,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 4,
			elevation: 3,
		},
		title: {
			fontSize: 22,
			fontWeight: "700",
			marginBottom: 20,
			textAlign: "center",
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: "700",
			marginTop: 16,
			marginBottom: 8,
		},
		row: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: darkMode ? "#333" : "#eee",
		},
		label: {
			fontSize: 15,
			color: darkMode ? "#aaa" : "#666",
			fontWeight: "500",
		},
		value: {
			fontSize: 15,
			fontWeight: "600",
		},
		button: {
			backgroundColor: "#007AFF",
			borderRadius: 8,
			fontWeight: "600",
		},
		buttonText: {
			color: "#fff",
			fontSize: 16,
			fontWeight: "600",
			textAlign: "center",
			paddingVertical: 14,
		},
		editButtonText: {
			color: "#007AFF",
			fontSize: 16,
			fontWeight: "600",
		},
	})
