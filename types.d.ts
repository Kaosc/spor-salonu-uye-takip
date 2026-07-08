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
	uid: string | null
	role: UserRole | null
	email: string | null
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

// ---------------------------------------------------------
// 1. ORTAK TİPLER (Enums & Unions)
// ---------------------------------------------------------
type UserRole = "ADMIN" | "STAFF" | "MEMBER"
type Gender = "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED"
type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED"
type PaymentMethod = "CASH" | "CREDIT_CARD" | "TRANSFER"

// ---------------------------------------------------------
// 2. USERS (Sistemi Kullanan Personel ve Adminler)
// Koleksiyon Adı: `users`
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// 3. MEMBERS (Sisteme Giriş Yapan Spor Salonu Müşterileri)
// Koleksiyon Adı: `members`
// ---------------------------------------------------------
interface Member {
	uid: string // Firebase Auth UID (Artık giriş yapacakları için ID'leri auth'tan gelecek)
	email: string // Üye giriş yaparken kullanacağı mail
	role: "MEMBER" // Redux'ta yönlendirme yaparken bu rolü okuyacağız
	firstName: string
	lastName: string
	phoneNumber: string
	lockerNumber?: string // YENİ: Hocanın istediği dolap numarası (Örn: "42", "A-15")
	gender?: Gender
	birthDate?: Date
	bloodType?: string
	emergencyContact?: {
		name: string
		phone: string
	}
	isActive: boolean // Üyelikten ayrılırsa false
	createdAt: Date
	updatedAt: Date
	createdBy?: string // Hangi personel kaydetti (Kendi kayıt olduysa boş kalabilir)
}

// ---------------------------------------------------------
// 4. SUBSCRIPTIONS (Abonelik Paketleri - Değişmedi)
// Koleksiyon Adı: `subscriptions`
// ---------------------------------------------------------
interface Subscription {
	id: string
	memberUid: string // Hangi üyeye ait olduğu (Member'ın UID'si ile eşleşecek)
	packageType: string // Örn: '1_MONTH', '3_MONTHS'
	startDate: Date
	endDate: Date
	price: number
	paymentMethod: PaymentMethod
	status: SubscriptionStatus
	createdAt: Date
	createdBy: string // Bu paketi onaylayan/satan personel
	notes?: string
}
