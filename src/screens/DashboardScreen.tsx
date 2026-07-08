import { View,  StyleSheet } from "react-native"
import ThemedText from "../components/ui/ThemedText"

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <ThemedText>DashboardScreen</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})