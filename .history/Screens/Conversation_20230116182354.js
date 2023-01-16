import {
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import * as Icon from "react-native-feather";
import { data } from "../data";
import { Image } from "react-native";

const Conversation = ({ route, navigation }) => {
  const { userId } = route.params;

  const [message, setMessage] = useState("");

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
          flex: 1,
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "white",
            paddingStart: 10,
            paddingEnd: 10,
            paddingTop: 5,
            paddingBottom: 5,
            borderTopColor: "#F1F2F2",
            borderTopWidth: 1,
          }}
        >
          <Icon.Paperclip width={20} height={20} color="#A7A7A7" />
          <TextInput
            style={{
              flex: 1,
              height: 30,
              paddingHorizontal: 10,
              borderRadius: 30,
              borderColor: "#A7A7A7",
              borderWidth: 1,
            }}
            value={message}
            onChangeText={(text) => setMessage(text)}
            placeholder="Tapez un message"
          />
          <TouchableOpacity
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "#F7941D",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon.ArrowUp width={25} height={25} color="white" />
          </TouchableOpacity>
        </View>
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
