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

export const calculateEndDateAsDays = (start: unknown, pkg: "MONTHLY" | "QUARTERLY" | "YEARLY"): number => {
	const startDate = (() => {
		if (!start) return new Date(NaN)
		if (typeof (start as any).toDate === "function") return (start as any).toDate()
		if (start instanceof Date) return start
		return new Date(NaN)
	})()

	if (isNaN(startDate.getTime())) return 0

	const end = new Date(startDate)
	switch (pkg) {
		case "MONTHLY":
			end.setMonth(end.getMonth() + 1)
			break
		case "QUARTERLY":
			end.setMonth(end.getMonth() + 3)
			break
		case "YEARLY":
			end.setMonth(end.getMonth() + 12)
			break
	}
	return Math.ceil((end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
}
