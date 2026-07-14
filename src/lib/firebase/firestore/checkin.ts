import { getAuth } from "@react-native-firebase/auth"
import { collection, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"

const auth = getAuth()
const db = getFirestore()

export const getCheckInByMemberUid = async (memberUid: string): Promise<CheckIn | null> => {
	try {
		const checkInRef = doc(db, COLLECTIONS.CHECKINS, memberUid)
		const docSnap = await getDoc(checkInRef)
		if (docSnap.exists()) {
			return docSnap.data() as CheckIn
		}
		return null
	} catch (e) {
		console.error("[FIRESTORE] getCheckInByMemberUid:", e)
		throw e
	}
}

export const getAllCheckIns = async (): Promise<CheckIn[]> => {
	try {
		const checkInsCollection = collection(db, COLLECTIONS.CHECKINS)
		const querySnapshot = await getDocs(checkInsCollection)
		const checkIns: CheckIn[] = []

		querySnapshot.forEach((doc) => {
			const checkInData = doc.data() as CheckIn
			checkIns.push(checkInData)
		})

		return checkIns
	} catch (e) {
		console.error("[FIRESTORE] getAllCheckIns:", e)
		throw e
	}
}

export const checkInMember = async (memberUid: string): Promise<boolean> => {
	try {
		const checkInRef = doc(collection(db, COLLECTIONS.CHECKINS))
		const checkInData: CheckIn = {
			memberUid: memberUid,
			checkInTime: serverTimestamp(),
			lastCheckedInBy: auth.currentUser?.email || "unknown",
		}

		await setDoc(checkInRef, checkInData)
		return true
	} catch (e) {
		console.error("[FIRESTORE] checkInMember:", e)
		return false
	}
}
