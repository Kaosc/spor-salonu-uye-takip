/**
 * Converts a timestamp to a date string in the format "YYYY-MM-DD". If the timestamp is invalid or cannot be converted, it returns an empty string.
 * @param timestamp  
 * @returns
 */
export const safeTimestampToDateString = (timestamp: unknown): string => {
	try {
		if (!timestamp) return ""

		// Firestore Timestamp has toDate() method
		if (typeof (timestamp as any).toDate === "function") {
			const date = (timestamp as any).toDate()
			return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0]
		}

		// Already a Date object
		if (timestamp instanceof Date) {
			return isNaN(timestamp.getTime()) ? "" : timestamp.toISOString().split("T")[0]
		}

		return ""
	} catch {
		return ""
	}
}

/**
 * Converts a timestamp to a date-time string in the format "YYYY-MM-DD HH:MM:SS". If the timestamp is invalid or cannot be converted, it returns an empty string.
 * @param timestamp
 * @returns
 */
export const safeTimestampToDateTimeString = (timestamp: unknown): string => {
	try {
		if (!timestamp) return ""
		// Firestore Timestamp has toDate() method
		if (typeof (timestamp as any).toDate === "function") {
			const date = (timestamp as any).toDate()
			return isNaN(date.getTime()) ? "" : date.toISOString().replace("T", " ").split(".")[0]
		}
		// Already a Date object
		if (timestamp instanceof Date) {
			const dateTimeString = isNaN(timestamp.getTime()) ? "" : timestamp.toISOString().replace("T", " ").split(".")[0]
			return new Date(dateTimeString).toLocaleString("tr-TR")
		}
		return ""
	} catch {
		return ""
	}
}

export const calculateEndDateAsDays = (end: Date | FirebaseTimestamp, pausedAt?: Date | FirebaseTimestamp): number => {
	// Get the difference between todays date and the end date in milliseconds and return the difference in days
	const endDate = end instanceof Date ? end : end.toDate()
	const pausedDate = pausedAt instanceof Date ? pausedAt : pausedAt?.toDate()
	const today = new Date()

	let diffInMs = 0

	if (pausedDate) {
		// Paused duration is the difference between today and the paused date in milliseconds
		const pausedDurationMs = today.getTime() - pausedDate.getTime()
		// Maximum pause duration is the difference between the end date and the paused date
		const maximumPauseDurationMs = endDate.getTime() - pausedDate.getTime()
		// If the paused duration is more than the maximum pause duration, we set the new end date to now + remaining duration of the subscription. Otherwise, we set the new end date to end date + paused duration.
		if (pausedDurationMs > maximumPauseDurationMs) {
			diffInMs = maximumPauseDurationMs
		} else {
			// If the paused duration is less than or equal to the maximum pause duration, we set the new end date to end date + paused duration.
			diffInMs = endDate.getTime() - today.getTime() + pausedDurationMs
		}
	} else {
		diffInMs = endDate.getTime() - today.getTime()
	}

	return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
}

export function toDate(value: any): Date | null {
	if (!value) return null
	if (typeof value.toDate === "function") return value.toDate()
	if (value instanceof Date) return value
	return null
}

export function isThisMonth(value: any): boolean {
	const date = toDate(value)
	if (!date) return false
	const now = new Date()
	return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

export function daysUntil(date: Date): number {
	const now = new Date()
	const diff = date.getTime() - now.getTime()
	return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function daysSince(date: Date): number {
	const now = new Date()
	const diff = now.getTime() - date.getTime()
	return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const formatToYYYYMMDD = (firebaseTimestamp: any) => {
	if (!firebaseTimestamp) return null
	const date = firebaseTimestamp.toDate ? firebaseTimestamp.toDate() : new Date(firebaseTimestamp)
	return date.toISOString().split("T")[0]
}
