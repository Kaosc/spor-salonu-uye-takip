import {
	getFirestore,
	collection,
	updateDoc,
	deleteDoc,
	doc,
	getDocs,
	getDoc,
	serverTimestamp,
	setDoc,
	query,
	where,
	increment,
} from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"

const db = getFirestore()

export const addMember = async (memberData: Member): Promise<boolean> => {
	try {
		const docRef = doc(db, COLLECTIONS.MEMBERS, memberData.uid)
		const member: Member = {
			...memberData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		}
		await setDoc(docRef, member)

		return !!docRef.id
	} catch (e) {
		console.error("[FIRESTORE] addMember:", e)
		throw e
	}
}

export const updateMember = async (updatedMemberData: Member): Promise<boolean> => {
	try {
		const memberId = updatedMemberData.uid
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)

		await updateDoc(memberRef, {
			...updatedMemberData,
			updatedAt: serverTimestamp(),
		})

		return true
	} catch (e) {
		console.error("[FIRESTORE] updateMember:", e)
		return false
	}
}

export const deleteMember = async (memberId: string): Promise<void> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		await deleteDoc(memberRef)
	} catch (e) {
		console.error("[FIRESTORE] deleteMember:", e)
		throw e
	}
}

export const getAllMembers = async (): Promise<Member[]> => {
	try {
		const membersRef = collection(db, COLLECTIONS.MEMBERS)
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
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		const docSnap = await getDoc(memberRef)

		if (docSnap.exists()) {
			return { ...docSnap.data() } as Member
		}

		return null
	} catch (e) {
		console.error("[FIRESTORE] getMemberById:", e)
		throw e
	}
}

export const getMemberByEmail = async (email: string): Promise<Member | null> => {
	try {
		const membersRef = collection(db, COLLECTIONS.MEMBERS)
		const q = query(membersRef, where("email", "==", email))
		const snapshot = await getDocs(q)

		if (!snapshot.empty) {
			const docSnap = snapshot.docs[0]
			return { ...docSnap.data() } as Member
		}

		return null
	} catch (e) {
		console.error("[FIRESTORE] getMemberByEmail:", e)
		throw e
	}
}

export const inactivateMember = async (memberId: string): Promise<boolean> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		await updateDoc(memberRef, {
			isActive: false,
			updatedAt: serverTimestamp(),
		})
		return true
	} catch (e) {
		console.error("[FIRESTORE] inactivateMember:", e)
		return false
	}
}

export const activateMember = async (memberId: string): Promise<boolean> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		await updateDoc(memberRef, {
			isActive: true,
			updatedAt: serverTimestamp(),
		})
		return true
	} catch (e) {
		console.error("[FIRESTORE] activateMember:", e)
		return false
	}
}

export const incrementMemberCheckInCount = async (memberId: string): Promise<boolean> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		await updateDoc(memberRef, {
			totalCheckIns: increment(1),
			updatedAt: serverTimestamp(),
		})
		return true
	} catch (e) {
		console.error("[FIRESTORE] incrementMemberCheckInCount:", e)
		return false
	}
}
