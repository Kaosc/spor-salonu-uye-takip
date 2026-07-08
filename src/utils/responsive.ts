import { Dimensions, PixelRatio } from "react-native"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const DESIGN_WIDTH = 400 
const DESIGN_HEIGHT = 815

/**
 * Scales a font size based on screen width
 * @param size - The base font size from your design
 * @returns Scaled font size for current device
 */
export const scaleFont = (size: number): number => {
	const scale = SCREEN_WIDTH / DESIGN_WIDTH
	const newSize = size * scale
	return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

/**
 * Scales a dimension (width/height) based on screen width
 * @param size - The base size from your design
 * @returns Scaled size for current device
 */
export const scale = (size: number): number => {
	const scaleRatio = SCREEN_WIDTH / DESIGN_WIDTH
	return Math.round(size * scaleRatio)
}

/**
 * Moderately scales a dimension - less aggressive for smaller screens
 * @param size - The base size from your design
 * @param factor - Scaling factor (0-1). Default 0.5. Lower = less scaling
 * @returns Scaled size for current device
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
	const scaleRatio = SCREEN_WIDTH / DESIGN_WIDTH
	return Math.round(size + (scaleRatio - 1) * size * factor)
}

/**
 * Scales font size moderately - better for small screens
 * @param size - The base font size from your design
 * @param factor - Scaling factor (0-1). Default 0.5
 * @returns Scaled font size for current device
 */
export const moderateFontScale = (size: number, factor: number = 0.5): number => {
	const scale = SCREEN_WIDTH / DESIGN_WIDTH
	const newSize = size + (scale - 1) * size * factor
	return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

/**
 * Gets a percentage of screen width
 * @param percentage - Percentage as a decimal (e.g., 0.12 for 12%)
 * @returns Calculated width
 */
export const widthPercentage = (percentage: number): number => {
	return SCREEN_WIDTH * percentage
}

/**
 * Gets a percentage of screen height
 * @param percentage - Percentage as a decimal (e.g., 0.12 for 12%)
 * @returns Calculated height
 */
export const heightPercentage = (percentage: number): number => {
	return SCREEN_HEIGHT * percentage
}

/**
 * Returns the smaller of width or height based scaling
 * Good for buttons that should work on both orientations
 * @param size - The base size from your design
 * @returns Scaled size based on smallest dimension
 */
export const scaleBySmallest = (size: number): number => {
	const widthScale = SCREEN_WIDTH / DESIGN_WIDTH
	const heightScale = SCREEN_HEIGHT / DESIGN_HEIGHT
	const minScale = Math.min(widthScale, heightScale)
	return Math.round(size * minScale)
}
