import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default function MemberListScreen() {
  return (
    <View style={styles.container}>
      <Text>MemberListScreen</Text>
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