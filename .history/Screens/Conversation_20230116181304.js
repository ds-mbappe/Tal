import {
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef } from "react";
import * as Icon from "react-native-feather";
import { data } from "../data";
import { Image } from "react-native";

const Conversation = ({ route, navigation }) => {
  const { userId } = route.params;

  const reference = useRef(null);

  const chatItem = ({ item }) => {
    return (
      <View
        style={{
          padding: 5,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
          backgroundColor: "#F7941D",
        }}
      >
        <Text style={{ fontSize: 16, color: "white" }}>
          {"This is a test message."}
        </Text>
        <Text style={{ fontSize: 14, color: "#A7A7A7" }}>{item.date}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{userId}</Text>
        <Image
          style={{ width: 40, height: 40, borderRadius: 20, marginEnd: 10 }}
          source={{ uri: "https://placeimg.com/480/480/any" }}
        />
      </View>
      <KeyboardAvoidingView
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "white",
        }}
      >
        <FlatList
          contentContainerStyle={{}}
          showsVerticalScrollIndicator={false}
          ref={reference}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={chatItem}
        />
      </KeyboardAvoidingView>
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
