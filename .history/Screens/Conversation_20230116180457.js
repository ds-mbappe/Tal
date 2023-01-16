import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import * as Icon from "react-native-feather";
import { data } from "../data";

const Conversation = ({ route, navigation }) => {
  const { userId } = route.params;

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
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Paramètres</Text>
        <Image
          style={{ width: 40, height: 40, borderRadius: 20 }}
          source={{ uri: "https://placeimg.com/480/480/any" }}
        />
      </View>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <FlatList
          contentContainerStyle={{}}
          showsVerticalScrollIndicator={false}
          ref={reference}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={chatItem}
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
