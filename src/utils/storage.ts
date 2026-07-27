import { createMMKV } from "react-native-mmkv"
import { DEFAULT_ANALYTICS_CHOICES } from "../lib/constants"

export const storage = createMMKV()

export const getConsentAnalyticsChoices = (): ConsentValues =>
	storage.contains("consentAnalytics") ? JSON.parse(storage.getString("consentAnalytics") || "null") : DEFAULT_ANALYTICS_CHOICES

export const storeConsentAnalyticsChoices = (consent: ConsentValues) => storage.set("consentAnalytics", JSON.stringify(consent))

export const storePremium = () => storage.set("premium", true)
export const getPremium = () => storage.getBoolean("premium") || false

export const storeAutoTheme = () => storage.set("autoTheme", true)
export const getIsThemeAuto = () => storage.getBoolean("autoTheme")

export const storeDontShowAgain = async (key: string) => storage.set(key, true)
export const getDontShowAgain = (key: string) => storage.contains(key)

export const storeSettings = async (settings: Settings) => storage.set("settings", JSON.stringify(settings))
export const getSettings = (): Settings => JSON.parse(storage.getString("settings") || "null")

export const getConsentAccepted = () => storage.getBoolean("consentAccepted") || false

export const setStaffCredentials = (email: string, password: string) => {
	storage.set("staffEmail", email)
	storage.set("staffPassword", password)
}

export const getStaffCredentials = (): { email: string; password: string } | null => {
	const email = storage.getString("staffEmail")
	const password = storage.getString("staffPassword")
	if (email && password) return { email, password }
	return null
}

export const clearStaffCredentials = () => {
	storage.remove("staffEmail")
	storage.remove("staffPassword")
}

export const storeRole = (role: UserRole) => {
	storage.set("role", role)
}

export const getRole = (): UserRole | null => {
	const role = storage.getString("role")
	if (!role) return null
	return role as UserRole
}

export const storeUserAuth = (auth: UserAuth) => {
	storage.set("auth", JSON.stringify(auth))
}

export const getUserAuth = (): UserAuth | null => {
	const authString = storage.getString("auth")
	if (!authString) return null

	try {
		const auth = JSON.parse(authString)
		return auth
	} catch (error) {
		console.error("Error parsing auth from storage:", error)
		return null
	}
}

export const clearUserAuth = () => {
	storage.remove("auth")
	storage.remove("role")
}

/////////////////////////////////// DELETE ////////////////////////////////

export const storageRemoveKey = (key: string) => storage.remove(key)
export const clearAllData = async () => storage.clearAll()
