import React, { memo } from "react"
import { Image } from "expo-image"

import { moderateScale } from "../utils/responsive"

function MemberAvatar({ gender, size }: { gender?: Gender; size?: number }) {
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

export default memo(MemberAvatar)
