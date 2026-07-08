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

const db = getFirestore()

const COLLECTIONS = {
	MEMBERS: "members",
	SUBSCRIPTIONS: "subscriptions",
	USERS: "users",
}

export const addMember = async (memberData: Omit<Member, "uid">): Promise<string> => {
	try {
		const membersRef = collection(db, COLLECTIONS.MEMBERS)
		const docRef = await addDoc(membersRef, {
			...memberData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		})
		return docRef.id
	} catch (e) {
		console.error("[FIRESTORE] addMember:", e)
		throw e
	}
}

export const updateMember = async (memberId: string, updateData: Partial<Member>): Promise<void> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
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
			return { uid: docSnap.id, ...docSnap.data() } as Member
		}
		return null
	} catch (e) {
		console.error("[FIRESTORE] getMemberById:", e)
		throw e
	}
}
