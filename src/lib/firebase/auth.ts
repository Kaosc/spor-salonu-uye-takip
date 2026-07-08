import { getAuth, signInWithEmailAndPassword, signOut } from "@react-native-firebase/auth"
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "@react-native-firebase/firestore"

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

export const logoutUser = async (): Promise<void> => {
	try {
		await signOut(auth)
	} catch (e: any) {
		console.error("[AUTH] logoutUser:", e?.message || e)
		throw e
	}
}
