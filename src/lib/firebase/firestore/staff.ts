import { getFirestore, doc, setDoc } from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"

const db = getFirestore()

export const addStaff = async (staffData: StaffUser): Promise<boolean> => {
	try {
		await setDoc(doc(db, COLLECTIONS.USERS, staffData.uid), staffData)
		return true
	} catch (error: any) {
		console.error("[Firestore] addStaff error:", error?.message || error)
		return false
	}
}