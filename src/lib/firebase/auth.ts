import {
	createUserWithEmailAndPassword,
	getAuth,
	sendEmailVerification,
	signInWithEmailAndPassword,
	signOut,
} from "@react-native-firebase/auth"
import { getFirestore, doc, getDoc, collection, query, where, getDocs, writeBatch } from "@react-native-firebase/firestore"
import { t } from "i18next"

const auth = getAuth()
const db = getFirestore()

export const staffLogin = async (email: string, password: string) => {
	const userCredential = await signInWithEmailAndPassword(auth, email, password)
	const uid = userCredential.user.uid

	const staffRef = doc(db, "users", uid)
	const staffDoc = await getDoc(staffRef)

	if (!staffDoc.exists()) {
		await signOut(auth)
		throw new Error(t("staffRecordNotFound"))
	}

	const data = staffDoc.data()
	return { uid, email, role: data?.role as UserRole }
}

export const memberLogin = async (email: string, password: string) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password)
		const uid = userCredential.user.uid

		// 1. Email must be verified
		if (!userCredential.user.emailVerified) {
			await signOut(auth)
			throw new Error(t("emailNotVerified"))
		}

		// 2. Check if a member doc exists with this email (query directly to get doc ID)
		const membersRef = collection(db, "members")
		const memberQuery = query(membersRef, where("email", "==", email))
		const memberSnapshot = await getDocs(memberQuery)

		if (!memberSnapshot.empty) {
			const oldDoc = memberSnapshot.docs[0]
			const oldDocId = oldDoc.id
			const oldData = oldDoc.data()

			// Scenario A: Staff created this record — uid missing or doesn't match
			if (!oldData.uid || oldData.uid !== uid) {
				const batch = writeBatch(db)

				// Create new member doc with the new Auth UID, copying all old data
				const newMemberRef = doc(db, "members", uid)
				batch.set(newMemberRef, { ...oldData, uid, isActive: true })

				// Reassign all subscriptions from oldDocId to new uid
				const subsRef = collection(db, "subscriptions")
				const subsQuery = query(subsRef, where("memberUid", "==", oldDocId))
				const subsSnapshot = await getDocs(subsQuery)

				// Update each subscription's memberUid to the new uid
				subsSnapshot.forEach((subDoc) => {
					batch.update(subDoc.ref, { memberUid: uid })
				})

				// Delete the old member document
				const oldMemberRef = doc(db, "members", oldDocId)
				batch.delete(oldMemberRef)

				await batch.commit()
			}

			// Scenario B: Regular returning member — uid matches
			return { uid, email, role: "MEMBER" as UserRole }
		}

		// Scenario C: Brand new organic user — no member doc exists
		return { isNewMember: true, uid, email, role: "MEMBER" as UserRole } as any
	} catch (e: any) {
		console.error("[AUTH] memberLogin:", e?.message || e)
		throw e
	}
}

export const registerMember = async (email: string, password: string) => {
	let uid: string | null = null

	try {
		const credential = await createUserWithEmailAndPassword(auth, email, password)
		await sendEmailVerification(credential.user)
		await signOut(auth)
		toast.show(t("registerSuccess"), { duration: 10000, type: "success" })
		uid = credential.user.uid
	} catch (error: any) {
		console.error("[AUTH] registerMember:", error?.message || error)
		const alert = (m: string) => toast.show(m, { duration: 6000, type: "danger" })

		switch (error.code) {
			case "auth/email-already-in-use":
				alert(t("emailAlreadyInUse"))
				break
			case "auth/invalid-email":
				alert(t("invalidEmail"))
				break
			case "auth/weak-password":
				alert(t("weakPassword"))
				break
			default:
				alert(t("registrationError"))
				break
		}
	}

	return uid
}

export const logoutUser = async (): Promise<void> => {
	try {
		await signOut(auth)
	} catch (e: any) {
		console.error("[AUTH] logoutUser:", e?.message || e)
		throw e
	}
}
