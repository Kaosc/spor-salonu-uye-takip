import {
	AntDesign,
	EvilIcons,
	Feather,
	FontAwesome5,
	FontAwesome6,
	Fontisto,
	Foundation,
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
	SimpleLineIcons,
} from "@expo/vector-icons"

// Extract icon name types from each icon library
export type MaterialCommunityIconNames = React.ComponentProps<typeof MaterialCommunityIcons>["name"]
export type AntDesignIconNames = React.ComponentProps<typeof AntDesign>["name"]
export type FeatherIconNames = React.ComponentProps<typeof Feather>["name"]
export type FontAwesome5IconNames = React.ComponentProps<typeof FontAwesome5>["name"]
export type FontAwesome6IconNames = React.ComponentProps<typeof FontAwesome6>["name"]
export type IoniconsIconNames = React.ComponentProps<typeof Ionicons>["name"]
export type MaterialIconNames = React.ComponentProps<typeof MaterialIcons>["name"]

// Custom icon mappings for non-MaterialCommunity icons
export const iconComponents = {
	"search-sharp": Ionicons,
	"close-circle-sharp": Ionicons,
	questioncircleo: AntDesign,
	leaderboard: MaterialIcons,
	plus: FontAwesome5,
	award: FontAwesome6,
	trophy: FontAwesome5,
	"touch-app": MaterialIcons,
	"support-agent": MaterialIcons,
	"x-twitter": FontAwesome6,
	"angles-right": FontAwesome6,
	graph: SimpleLineIcons,
	"external-link": EvilIcons,
	"face-angry": FontAwesome6,
	"nav-icon-list-a": Fontisto,
	"logo-apple-appstore": Ionicons,
	pause: Fontisto,
	play: Fontisto,
	stop: Fontisto,
	donate: FontAwesome5,
	"male": Fontisto,
	"female": Fontisto,
} as const

export type CustomIconNames = keyof typeof iconComponents
export type AllIconNames = CustomIconNames | MaterialCommunityIconNames
