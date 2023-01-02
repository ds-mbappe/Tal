import { StyleSheet, View } from "react-native";
import { React, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

const Gateaway = ({ navigation }) => {
  useFocusEffect(
    useCallback(() => {
      navigation.replace("NewPost");
    }, [])
  );

  return <View style={styles.container}></View>;
};

export default Gateaway;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
