//////////////////////////////////////////////////////
////////////////////// TOAST /////////////////////////
//////////////////////////////////////////////////////

type ToastType = import("react-native-toast-notifications").ToastType

declare global {
	const toast: ToastType
}

declare var toast: ToastType

//////////////////////////////////////////////////////
////////////////////// GENERAL ///////////////////////
//////////////////////////////////////////////////////

type RootState = {
	settings: Settings
	config: Config
	auth: Auth
}

type Auth = {
	isAuthenticated: boolean
	uid: string | undefined
	role: UserRole | undefined
	email: string | undefined
	isLoading: boolean
}

type Settings = {
	lang: "tr" | "en"
	darkMode: boolean
}

type Config = {
	isConnected: boolean
}

type ConsentValues = {
	analytics_storage: boolean
	ad_storage: boolean
	ad_user_data: boolean
	ad_personalization_signals: boolean
}

///////////////////////////////////////////////////
////////////////////// DATA ///////////////////////
///////////////////////////////////////////////////

type FormValues = {
	firstName: string
	lastName: string
	phoneNumber: string
	email: string
	address: string
	lockerNumber: number
	gender: Gender
	birthDate: string
	bloodType: string
	weight: number
	height: number
	emergencyName: string
	emergencyPhone: string
}

type UserRole = "ADMIN" | "STAFF" | "MEMBER"
type Gender = "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED"
type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAUSED"
type PaymentMethod = "CASH" | "CREDIT_CARD" | "TRANSFER"

interface StaffUser {
	uid: string // Firebase Auth UID
	email: string
	firstName: string
	lastName: string
	role: "ADMIN" | "STAFF"
	isActive: boolean
	createdAt: Date
	lastLoginAt?: Date
}

interface Member {
	uid: string // Firebase Auth UID (Cames from Auth when the member registers)
	email: string
	role: "MEMBER"
	firstName: string
	lastName: string
	phoneNumber: string
	address?: string
	lockerNumber?: number
	totalCheckIns?: number | FieldValue
	gender: Gender
	birthDate?: Date
	bloodType?: string
	weight?: number // Kilo as KG
	height?: number // Boy as CM
	emergencyContact?: {
		name: string
		phone: string
	}
	isActive: boolean
	createdAt?: Date | import("@react-native-firebase/firestore").FieldValue
	updatedAt?: Date | import("@react-native-firebase/firestore").FieldValue
	createdBy?: string
}

interface MemberCard extends Member {
	subscriptionStatus: SubscriptionStatus | "NONE" // ACTIVE, EXPIRED, CANCELLED, PAUSED, NONE
}

type PackageType = "MONTHLY" | "QUARTERLY" | "YEARLY"

interface Subscription {
	id?: string
	memberUid: string // Firebase Auth UID (Cames from Auth when the member registers)
	packageType: PackageType
	startDate: Date | FirebaseTimestamp
	endDate: Date | FirebaseTimestamp
	price: number
	paymentMethod: PaymentMethod
	status: SubscriptionStatus
	pausedAt?: Date | FirebaseTimestamp
	createdBy: string
	updatedBy?: string
	createdAt: Date | import("@react-native-firebase/firestore").FieldValue
	updatedAt?: Date | import("@react-native-firebase/firestore").FieldValue
	notes?: string
}

interface CheckIn {
	memberUid: string
	checkInTime: Date | FieldValue
	lastCheckedInBy: string
}

type FieldValue = import("@react-native-firebase/firestore").FieldValue
type FirebaseTimestamp = import("@react-native-firebase/firestore").Timestamp
