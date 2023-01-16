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
import React, { useEffect, useRef, useState } from "react";
import * as Icon from "react-native-feather";
import { data } from "../data";
import { Image } from "react-native";
import { firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Conversation = ({ route, navigation }) => {
  const { userId, chatId } = route.params;

  const [message, setMessage] = useState("");

  const [inputHeight, setInputHeight] = useState(30);

  const [userData, setUserData] = useState([]);

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
          borderRadius: 5,
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

  const chatItemSeparator = () => {
    return (
      <View
        style={{
          width: "100%",
          height: 5,
        }}
      ></View>
    );
  };

  const getData = async () => {
    // Get current chat user data
    try {
      const selectedUserDocRef = doc(firestore, "users", userId);
      const selectedUserDocSnapshot = await getDoc(selectedUserDocRef);
      if (selectedUserDocSnapshot.exists()) {
        setUserData(selectedUserDocSnapshot.data());
      } else {
        console.log("Document does not exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          backgroundColor: "white",
          marginBottom: 46,
        }}
      >
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
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {userData.firstName + " " + userData.lastName}
          </Text>
          <Image
            style={{ width: 40, height: 40, borderRadius: 20, marginEnd: 10 }}
            source={{ uri: userData.profilePicture }}
          />
        </View>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={50}
          contentContainerStyle={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <FlatList
            contentContainerStyle={{}}
            showsVerticalScrollIndicator={false}
            ref={reference}
            data={data}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={chatItemSeparator}
            renderItem={chatItem}
          />
          <View
            style={{
              height: inputHeight,
              maxHeight: 150,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "white",
              paddingHorizontal: 10,
              paddingTop: 20,
              marginBottom: 20,
              borderTopColor: "#F1F2F2",
              borderTopWidth: 1,
            }}
          >
            <TouchableOpacity style={{ width: 20 }}>
              <Icon.Paperclip width={20} height={20} color="#A7A7A7" />
            </TouchableOpacity>
            <TextInput
              style={{
                flex: 1,
                height: inputHeight,
                maxHeight: 150,
                marginHorizontal: 10,
                paddingHorizontal: 10,
                paddingTop: 20,
                borderRadius: 10,
                borderColor: "#A7A7A7",
                borderWidth: 1,
              }}
              multiline={true}
              numberOfLines={5}
              onContentSizeChange={(e) =>
                setInputHeight(e.nativeEvent.contentSize.height)
              }
              value={message}
              onChangeText={(text) => setMessage(text)}
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
