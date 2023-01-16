import { StyleSheet, Text, SafeAreaView, ScrollView } from "react-native";
import { React, useState } from "react";
import { View } from "react-native";
import * as Icon from "react-native-feather";

const Messages = () => {
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          height: 46,
          borderBottomColor: "#F1F2F2",
          borderBottomWidth: 1,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Messages</Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <View style={styles.searchContainer}>
          <Icon.Search width={15} height={15} stroke="#A7A7A7" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher"
            placeholderTextColor="#A7A7A7"
            autoCapitalize="none"
            value={search}
            onChangeText={(text) => {
              setSearch(text), getSearchData(text);
            }}
          />
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 30,
              height: 30,
              display: search == "" ? "none" : "flex",
            }}
            activeOpacity={1}
            onPress={() => setSearch("")}
          >
            <Icon.X width={15} height={15} stroke="#A7A7A7" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Messages;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
  },
  searchContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F2F2",
    marginTop: 10,
    marginHorizontal: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    marginStart: 10,
    fontSize: 16,
    height: 40,
  },
});
