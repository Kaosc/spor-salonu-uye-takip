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
			return isNaN(timestamp.getTime()) ? "" : timestamp.toISOString().replace("T", " ").split(".")[0]
		}
		return ""
	} catch {
		return ""
	}
}
