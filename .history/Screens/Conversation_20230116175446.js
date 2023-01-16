import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import * as Icon from "react-native-feather";

const Conversation = ({ route, navigation }) => {
  const { userId } = route.params;

  return (
    <SafeAreaView>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 46,
          borderBottomColor: "#F1F2F2",
          borderBottomWidth: 1,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon.ChevronLeft
            style={{ marginStart: 10 }}
            width={25}
            height={25}
            stroke="#F7941D"
          />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Paramètres</Text>
        <Image
          style={{ width: 40, height: 40, borderRadius: 20 }}
          source={{ uri: "https://placeimg.com/480/480/any" }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
  },
});
