import { useForm, Controller } from "react-hook-form"
import { View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useMMKVObject } from "react-native-mmkv"
import { nanoid } from "@reduxjs/toolkit"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"

type FormValues = {
	firstName: string
	lastName: string
	phoneNumber: string
	email: string
	lockerNumber: string
	gender: string
	birthDate: string
	bloodType: string
	emergencyName: string
	emergencyPhone: string
}

export default function MemberFormScreen() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)
	const [members, setMembers] = useMMKVObject<Member[]>("members")

	const { control, handleSubmit } = useForm<FormValues>({
		defaultValues: {
			firstName: "",
			lastName: "",
			phoneNumber: "",
			email: "",
			lockerNumber: "",
			gender: "UNSPECIFIED",
			birthDate: "",
			bloodType: "",
			emergencyName: "",
			emergencyPhone: "",
		},
	})

	const onSubmit = (data: FormValues) => {
		const newMember: Member = {
			uid: nanoid(),
			firstName: data.firstName,
			lastName: data.lastName,
			phoneNumber: data.phoneNumber,
			email: data.email,
			lockerNumber: data.lockerNumber || "",
			gender: (data.gender as Gender) || "UNSPECIFIED",
			birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
			bloodType: data.bloodType || undefined,
			emergencyContact: {
				name: data.emergencyName || "",
				phone: data.emergencyPhone || "",
			},
			role: "MEMBER",
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: undefined,
		}

		const updatedMembers = members ? [...members, newMember] : [newMember]
		setMembers(updatedMembers)

		navigation.goBack()
	}

	return (
		<View style={styles.container}>
			<CustomHeader title="Yeni Üye" />
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.form}>
						<Controller
							control={control}
							name="firstName"
							rules={{ required: true }}
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>Ad</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="Ad"
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="lastName"
							rules={{ required: true }}
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>Soyad</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="Soyad"
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="phoneNumber"
							rules={{ required: true }}
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>Telefon</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="Telefon"
										keyboardType="phone-pad"
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="email"
							rules={{ required: true }}
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>E-posta</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="E-posta"
										keyboardType="email-address"
										autoCapitalize="none"
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="gender"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>Cinsiyet</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="UNSPECIFIED / MALE / FEMALE"
										placeholderTextColor={darkMode ? "#666" : "#999"}
										autoCapitalize="characters"
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="birthDate"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>Doğum Tarihi</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="YYYY-AA-GG"
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="bloodType"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>Kan Grubu</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="Örn: A Rh+"
										placeholderTextColor={darkMode ? "#666" : "#999"}
										autoCapitalize="characters"
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="lockerNumber"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>Dolap No</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="Dolap No (opsiyonel)"
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<ThemedText style={styles.sectionTitle}>Acil Durum Kişisi</ThemedText>

						<Controller
							control={control}
							name="emergencyName"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>Ad Soyad</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="Acil durum kişisi adı"
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="emergencyPhone"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>Telefon</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder="Acil durum telefonu"
										keyboardType="phone-pad"
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<TouchableOpacity
							style={styles.button}
							onPress={handleSubmit(onSubmit)}
						>
							<ThemedText style={styles.buttonText}>Kaydet</ThemedText>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		flex: {
			flex: 1,
		},
		scrollContent: {
			flexGrow: 1,
			padding: 20,
		},
		form: {
			flex: 1,
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: "700",
			marginTop: 8,
			marginBottom: 12,
		},
		field: {
			marginBottom: 16,
		},
		label: {
			fontSize: 14,
			fontWeight: "600",
			marginBottom: 6,
		},
		input: {
			borderWidth: 1,
			borderColor: darkMode ? "#333" : "#ccc",
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 16,
			color: darkMode ? "#e9e9e9" : "#000",
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
		},
		button: {
			backgroundColor: "#007AFF",
			borderRadius: 8,
			paddingVertical: 14,
			alignItems: "center",
			marginTop: 12,
		},
		buttonText: {
			color: "#fff",
			fontSize: 16,
			fontWeight: "600",
		},
	})
