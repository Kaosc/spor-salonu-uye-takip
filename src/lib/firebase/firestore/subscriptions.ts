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
		throw e
	}
}
