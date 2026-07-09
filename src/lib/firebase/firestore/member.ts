import {
	getFirestore,
	collection,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	getDocs,
	getDoc,
	serverTimestamp,
} from "@react-native-firebase/firestore"
import { registerMember } from "../auth"

const db = getFirestore()

const COLLECTION = "members"

export const addMember = async (memberData: Member): Promise<boolean> => {
	try {
		// Register Member
		const uid = await registerMember(memberData.email)

		if (!uid) return false

		// Add member data
		const membersRef = collection(db, COLLECTION)
		const docRef = await addDoc(membersRef, {
			...memberData,
			uid,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		})
		return !!docRef.id
	} catch (e) {
		console.error("[FIRESTORE] addMember:", e)
		throw e
	}
}

export const updateMember = async (memberId: string, updateData: Partial<Member>): Promise<void> => {
	try {
		const memberRef = doc(db, COLLECTION, memberId)
		await updateDoc(memberRef, {
			...updateData,
			updatedAt: serverTimestamp(),
		})
	} catch (e) {
		console.error("[FIRESTORE] updateMember:", e)
		throw e
	}
}

export const deleteMember = async (memberId: string): Promise<void> => {
	try {
		const memberRef = doc(db, COLLECTION, memberId)
		await deleteDoc(memberRef)
	} catch (e) {
		console.error("[FIRESTORE] deleteMember:", e)
		throw e
	}
}

export const getAllMembers = async (): Promise<Member[]> => {
	try {
		const membersRef = collection(db, COLLECTION)
		const snapshot = await getDocs(membersRef)

		return snapshot.docs.map((docSnap) => ({
			uid: docSnap.id,
			...docSnap.data(),
		})) as Member[]
	} catch (e) {
		console.error("[FIRESTORE] getAllMembers:", e)
		throw e
	}
}

export const getMemberById = async (memberId: string): Promise<Member | null> => {
	try {
		const memberRef = doc(db, COLLECTION, memberId)
		const docSnap = await getDoc(memberRef)

		if (docSnap.exists()) {
			return { uid: docSnap.id, ...docSnap.data() } as Member
		}
		return null
	} catch (e) {
		console.error("[FIRESTORE] getMemberById:", e)
		throw e
	}
}
