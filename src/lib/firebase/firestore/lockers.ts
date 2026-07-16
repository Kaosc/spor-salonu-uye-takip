import {
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from "@react-native-firebase/firestore"
import { t } from "i18next"
import { COLLECTIONS } from "../enums"

const db = getFirestore()

export const getAllLockers = async (): Promise<Locker[]> => {
	try {
		const lockersCollection = collection(db, COLLECTIONS.LOCKERS)
		const q = query(lockersCollection, orderBy("id", "asc"))
		const querySnapshot = await getDocs(q)
		const lockers: Locker[] = []

		querySnapshot.forEach((doc) => {
			const lockerData = doc.data() as Locker
			lockers.push(lockerData)
		})

		return lockers
	} catch (e) {
		console.error("[FIRESTORE] getAllLockers:", e)
		return []
	}
}

export const getLockerByUserUid = async (uid: string): Promise<Locker | null> => {
	try {
		const lockersRef = collection(db, COLLECTIONS.LOCKERS)
		const q = query(lockersRef, where("occupiedByUid", "==", uid))
		const snapshot = await getDocs(q)

		if (!snapshot.empty) {
			const lockerDoc = snapshot.docs[0]
			return lockerDoc.data() as Locker
		}

		return null
	} catch (e) {
		console.error("[FIRESTORE] getLockerByUserUid: ", e)
		throw e
	}
}

export const assignLockerToUser = async (uid: string, lockerId: string) => {
	try {
		const lockerRef = doc(db, COLLECTIONS.LOCKERS, lockerId)
		const lockerSnap = await getDoc(lockerRef)

		if (!lockerSnap.exists()) {
			throw new Error(t("noLockerFound"))
		}

		const lockerData = lockerSnap.data()

		if (lockerData.isOccupied) {
			throw new Error(t("locker_already_occupied"))
		}

		try {
			await updateDoc(lockerRef, {
				id: lockerId,
				isOccupied: true,
				occupiedByUid: uid,
				occupiedAt: serverTimestamp(),
			})
		} catch (e) {
			console.error("[FIRESTORE] assignLockerToUser: ", e)
			throw new Error(t("locker_assignment_error"))
		}

		return {
			id: lockerId,
			isOccupied: true,
			occupiedByUid: uid,
		}
	} catch (e) {
		console.error("[FIRESTORE] assignLockerToUser: ", e)
		throw e
	}
}

export const removeLockerFromUser = async (lockerId: string) => {
	try {
		const lockerRef = doc(db, COLLECTIONS.LOCKERS, lockerId)
		const lockerSnap = await getDoc(lockerRef)

		if (!lockerSnap.exists()) {
			throw new Error(t("noLockerFound"))
		}

		const lockerData = lockerSnap.data()

		if (!lockerData.isOccupied) {
			throw new Error(t("locker_not_occupied"))
		}

		await updateDoc(lockerRef, {
			id: lockerId,
			isOccupied: false,
			occupiedByUid: null,
			occupiedAt: null,
		})

		return true
	} catch (e) {
		console.error("[FIRESTORE] removeLockerFromUser: ", e)
		throw e
	}
}

export const addLocker = async () => {
	try {
		let totalLockers = 0
		let newLockerId = "1"

		try {
			totalLockers = (await getAllLockers()).length
			newLockerId = (totalLockers + 1).toString()
		} catch (error) {
			console.error("[FIRESTORE] addLocker: Error fetching total lockers:", error)
		}

		await setDoc(doc(db, COLLECTIONS.LOCKERS, newLockerId), {
			id: newLockerId,
			isOccupied: false,
			occupiedByUid: null,
			occupiedAt: null,
		})

		return true
	} catch (e) {
		console.error("[FIRESTORE] addLocker: ", e)
		throw e
	}
}
