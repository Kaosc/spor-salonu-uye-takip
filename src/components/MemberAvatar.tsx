import React from "react"
import { Image } from "expo-image"

import { moderateScale } from "../utils/responsive"

export default function MemberAvatar({ gender, size }: { gender?: Gender, size?: number }) {
	return (
		<Image
			source={gender === "MALE" ? require("../assets/male.png") : require("../assets/female.png")}
			style={{
				width: moderateScale(size || 65),
				height: moderateScale(size || 65),
			}}
		/>
	)
}
