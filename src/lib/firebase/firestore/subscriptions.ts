import {
	getFirestore,
	addDoc,
	collection,
	query,
	where,
	getDocs,
	getDoc,
	updateDoc,
	doc,
	orderBy,
} from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"

const db = getFirestore()

export const addSubscription = async (subscription: Subscription) => {
	try {
		const subRef = collection(db, COLLECTIONS.SUBSCRIPTIONS)
		await addDoc(subRef, subscription)

		console.info(`[FIRESTORE] Subscription added with ID: ${subRef.id}`)
		return !!subRef.id
	} catch (e) {
		console.error("[FIRESTORE] addSubscription:", e)
		throw e
	}
}

export const cancelSubscription = async (subscriptionId: string) => {
	try {
		const subRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, subscriptionId)
		const subDoc = await getDoc(subRef)

		if (!subDoc.exists()) {
			throw new Error(`Subscription with ID ${subscriptionId} not found`)
		}

		await updateDoc(subRef, { status: "CANCELLED" })

		console.info(`[FIRESTORE] Subscription with ID ${subscriptionId} has been cancelled.`)
		return true
	} catch (e) {
		console.error("[FIRESTORE] cancelSubscription:", e)
		throw e
	}
}

export const pauseSubscription = async (subscriptionId: string) => {
	try {
		const subRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, subscriptionId)
		const subDoc = await getDoc(subRef)

		if (!subDoc.exists()) {
			throw new Error(`Subscription with ID ${subscriptionId} not found`)
		}

		await updateDoc(subRef, { status: "PAUSED", pausedAt: new Date() })
		console.info(`[FIRESTORE] Subscription with ID ${subscriptionId} has been paused.`)
		return true
	} catch (e) {
		console.error("[FIRESTORE] pauseSubscription:", e)
		throw e
	}
}

export const resumeSubscription = async (subscriptionId: string) => {
	try {
		const subRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, subscriptionId)
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

		// Let say user paused the sub after 10 day of the 1 month sub. and start the sub after 30 days. So in this case maximuum pause duration should be 20 days (30 - 10 = 20 days). So we need to check if the paused duration is more than the remaining duration of the subscription. If it is, we should set the end date to the current date + remaining duration of the subscription.
		const maximumPauseDurationMs = endDate.getTime() - pausedAt.getTime()
		let newEndDate: Date

		// If the paused duration is more than the maximum pause duration, we set the new end date to now + remaining duration of the subscription. Otherwise, we set the new end date to end date + paused duration.
		if (pausedDurationMs > maximumPauseDurationMs) {
			const remainingDurationMs = endDate.getTime() - pausedAt.getTime()
			newEndDate = new Date(now.getTime() + remainingDurationMs)
		} else {
			// If the paused duration is less than or equal to the maximum pause duration, we set the new end date to end date + paused duration.
			newEndDate = new Date(endDate.getTime() + pausedDurationMs)
		}

		await updateDoc(subRef, {
			status: "ACTIVE",
			endDate: newEndDate,
			pausedAt: null,
		})

		console.info(`[FIRESTORE] Subscription with ID ${subscriptionId} has been resumed. New end date: ${newEndDate.toISOString()}`)
		return true
	} catch (e) {
		console.error("[FIRESTORE] resumeSubscription:", e)
		throw e
	}
}

export const getAllSubscriptions = async (): Promise<any[]> => {
	try {
		const subRef = collection(db, COLLECTIONS.SUBSCRIPTIONS)
		const q = query(subRef, orderBy("startDate", "desc"))
		const snapshot = await getDocs(q)

		const subscriptions: any[] = []
		snapshot.forEach((doc) => {
			subscriptions.push({ id: doc.id, ...doc.data() })
		})

		console.info(`[FIRESTORE] Retrieved ${subscriptions.length} subscriptions.`)
		return subscriptions
	} catch (e) {
		console.error("[FIRESTORE] getAllSubscriptions:", e)
		return []
	}
}

export const getSubscriptionsByMemberId = async (memberUid: string): Promise<Subscription[]> => {
	try {
		const subRef = collection(db, COLLECTIONS.SUBSCRIPTIONS)
		const q = query(subRef, where("memberUid", "==", memberUid))
		const subscriptionDocs = await getDocs(q)

		const subscriptions: Subscription[] = []
		subscriptionDocs.forEach((doc) => {
			const data = doc.data() as Subscription
			subscriptions.push({ ...data, id: doc.id })
		})

		console.info(`[FIRESTORE] Retrieved ${subscriptions.length} subscriptions for member UID: ${memberUid}.`)
		return subscriptions
	} catch (e) {
		console.error("[FIRESTORE] getSubscriptionsByMemberId:", e)
		return []
	}
}
