import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore"

const db = getFirestore()

const COLLECTION = "users"

export const getStaffUserById = async (uid: string): Promise<StaffUser | null> => {
	try {
		const docRef = doc(db, COLLECTION, uid)
		const docSnap = await getDoc(docRef)

		if (docSnap.exists()) {
			const data = docSnap.data() as StaffUser
			return data
		}

		return null
	} catch (e) {
		console.error("[FIRESTORE] getStaffUserById:", e)
		throw e
	}
}
