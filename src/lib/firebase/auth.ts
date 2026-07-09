import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "@react-native-firebase/auth"
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "@react-native-firebase/firestore"
import { nanoid } from "@reduxjs/toolkit"
import { t } from "i18next"

const auth = getAuth()
const db = getFirestore()

export const loginWithEmail = async (email: string, password: string) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password)
		const uid = userCredential.user.uid

		// Check if the user is a staff member
		const staffRef = doc(db, "users", uid)
		const staffDoc = await getDoc(staffRef)
		if (staffDoc.exists()) {
			const data = staffDoc.data()
			return { uid, email, role: data?.role as UserRole }
		}

		// Check if the user is a member
		const membersRef = collection(db, "members")
		const q = query(membersRef, where("email", "==", email))
		const memberDocs = await getDocs(q)
		if (!memberDocs.empty) return { uid, email, role: "MEMBER" as UserRole }

		throw new Error("Kullanıcı veritabanında bulunamadı.")
	} catch (e: any) {
		console.error("[AUTH] loginWithEmail:", e?.message || e)
		throw e
	}
}

export const registerMember = async (email: string) => {
	let uid: string | null = null

	try {
		const tempPassword = nanoid(12)
		const credential = await createUserWithEmailAndPassword(auth, email, tempPassword)
		uid = credential.user.uid
	} catch (error: any) {
		console.error("[AUTH] registerMember:", error?.message || error)
		const alert = (m: string) => toast.show(m, { duration: 6000, type: "danger" })

		switch (error.code) {
			case "auth/email-already-in-use":
				alert(t("emailAlreadyInUse"))
				break
			case "auth/invalid-email":
				alert(t("invalidEmail"))
				break
			case "auth/weak-password":
				alert(t("weakPassword"))
				break
			default:
				alert(t("registrationError"))
				break
		}
	}

	return uid

	// // 2. Acaba personel bu adamı daha önceden e-postasıyla Sanal olarak kaydetmiş miydi?
	// const membersRef = collection(db, "members")
	// const q = query(membersRef, where("email", "==", email))
	// const snapshot = await getDocs(q)

	// if (!snapshot.empty) {
	// 	// Personel önceden kaydetmiş! O zaman o eski dökümanı silip,
	// 	// verilerini Auth UID'si ile yeni bir dökümana taşıyabiliriz.
	// 	// (Veya mevcut dökümanı güncelleriz)
	// } else {
	// 	// Yepyeni bir müşteri, personelin haberi yok.
	// 	// Veritabanına UID'sini belge adı (doc id) yaparak ekle
	// 	await setDoc(doc(db, "members", uid), {
	// 		email,
	// 		role: "MEMBER",
	// 		isActive: true,
	// 		createdAt: serverTimestamp(),
	// 	})
	// }
}

export const logoutUser = async (): Promise<void> => {
	try {
		await signOut(auth)
	} catch (e: any) {
		console.error("[AUTH] logoutUser:", e?.message || e)
		throw e
	}
}
