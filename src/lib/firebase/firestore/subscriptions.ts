import { getFirestore, addDoc, collection, query, where, getDocs, getDoc, updateDoc, doc } from "@react-native-firebase/firestore"

const db = getFirestore()

const COLLECTION = "subscriptions"

export const addSubscription = async (subscription: Subscription) => {
	try {
		const subRef = collection(db, COLLECTION)
		await addDoc(subRef, subscription)
		return !!subRef.id
	} catch (e) {
		console.error("[FIRESTORE] addSubscription:", e)
		throw e
	}
}

export const cancelSubscription = async (subscriptionId: string) => {
	try {
		const subRef = doc(db, COLLECTION, subscriptionId)
		const subDoc = await getDoc(subRef)

		if (!subDoc.exists()) {
			throw new Error(`Subscription with ID ${subscriptionId} not found`)
		}

		await updateDoc(subRef, { status: "CANCELLED" })
		return true
	} catch (e) {
		console.error("[FIRESTORE] cancelSubscription:", e)
		throw e
	}
}

export const pauseSubscription = async (subscriptionId: string) => {
	try {
		const subRef = doc(db, COLLECTION, subscriptionId)
		const subDoc = await getDoc(subRef)

		if (!subDoc.exists()) {
			throw new Error(`Subscription with ID ${subscriptionId} not found`)
		}

		// Dondurma anını kaydediyoruz
		await updateDoc(subRef, { status: "PAUSED", pausedAt: new Date() })
		return true
	} catch (e) {
		console.error("[FIRESTORE] pauseSubscription:", e)
		throw e
	}
}

export const resumeSubscription = async (subscriptionId: string) => {
	try {
		const subRef = doc(db, COLLECTION, subscriptionId)
		const subDoc = await getDoc(subRef)

		if (!subDoc.exists()) {
			throw new Error(`Subscription with ID ${subscriptionId} not found`)
		}

		const subscriptionData = subDoc.data()

		// Incase the pausedAt or endDate is a Firestore Timestamp, we need to convert it to a JavaScript Date object
		const pausedAt = subscriptionData.pausedAt?.toDate ? subscriptionData.pausedAt.toDate() : new Date(subscriptionData.pausedAt)
		const endDate = subscriptionData.endDate?.toDate ? subscriptionData.endDate.toDate() : new Date(subscriptionData.endDate)

		// Calculate the total paused duration in milliseconds
		const now = new Date()
		const pausedDurationMs = now.getTime() - pausedAt.getTime()

		// Calculate the new end date by adding the paused duration to the original end date
		const newEndDate = new Date(endDate.getTime() + pausedDurationMs)

		await updateDoc(subRef, {
			status: "ACTIVE",
			endDate: newEndDate,
			pausedAt: null,
		})

		return true
	} catch (e) {
		console.error("[FIRESTORE] resumeSubscription:", e)
		throw e
	}
}

export const getAllSubscriptions = async (): Promise<any[]> => {
	try {
		const subRef = collection(db, COLLECTION)
		const snapshot = await getDocs(subRef)

		const subscriptions: any[] = []
		snapshot.forEach((doc) => {
			subscriptions.push({ id: doc.id, ...doc.data() })
		})

		return subscriptions
	} catch (e) {
		console.error("[FIRESTORE] getAllSubscriptions:", e)
		return []
	}
}

export const getSubscriptionsByMemberId = async (memberUid: string): Promise<Subscription[]> => {
	try {
		const subRef = collection(db, COLLECTION)
		const q = query(subRef, where("memberUid", "==", memberUid))
		const subscriptionDocs = await getDocs(q)

		const subscriptions: Subscription[] = []
		subscriptionDocs.forEach((doc) => {
			const data = doc.data() as Subscription
			subscriptions.push({ ...data, id: doc.id })
		})

		return subscriptions
	} catch (e) {
		console.error("[FIRESTORE] getSubscriptionsByMemberId:", e)
		return []
	}
}
