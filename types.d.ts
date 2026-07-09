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
	uid: string
	role: UserRole
	email: string
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
	lockerNumber: string
	gender: Gender
	birthDate: string
	bloodType: string
	emergencyName: string
	emergencyPhone: string
}

type UserRole = "ADMIN" | "STAFF" | "MEMBER"
type Gender = "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED"
type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED"
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
	lockerNumber?: string
	gender: Gender
	birthDate?: Date
	bloodType?: string
	emergencyContact?: {
		name: string
		phone: string
	}
	isActive: boolean
	createdAt: Date
	updatedAt: Date
	createdBy?: string
}

interface Subscription {
	id: string
	memberUid: string // Firebase Auth UID (Cames from Auth when the member registers)
	packageType: string // e.g. "Monthly", "Quarterly", "Yearly" will be added later
	startDate: Date
	endDate: Date
	price: number
	paymentMethod: PaymentMethod
	status: SubscriptionStatus
	createdAt: Date
	createdBy: string
	notes?: string
}
