import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { React, useCallback, useRef, useState } from "react";
import { View } from "react-native";
import * as Icon from "react-native-feather";
import { auth, firestore } from "../firebase";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { data } from "../data";

const Messages = () => {
  const [search, setSearch] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [usersList, setUsersList] = useState([]);

  const [conversations, setConversations] = useState([]);

  const reference = useRef(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  });

  const searchRenderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.renderItem}
        activeOpacity={1}
        onPress={() => console.log(item.id)}
      >
        <View style={styles.renderItemLeft}>
          <Image
            style={styles.profilePicture}
            source={{ uri: item.profilePicture }}
          />
          <View style={styles.details}>
            <Text style={styles.name} numberOfLines={1}>
              {item.firstName + " " + item.lastName}
            </Text>
            <Text style={styles.talcsign}>{item.talcsign}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const conversationItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.renderItem}
        activeOpacity={1}
        onPress={() => console.log(item.id)}
      >
        <Image style={styles.profilePicture} source={{ uri: item.image }} />
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.talcsign} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getSearchData = async (text) => {
    // Get all users from firestore and store them
    let strlength = text.length;
    let strFrontCode = text.slice(0, strlength - 1);
    let strEndCode = text.slice(strlength - 1, strlength);
    let endcode =
      strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);
    try {
      let users = [];
      const usersDataDocRef = collection(firestore, "users");
      const usersDataQuery = query(
        usersDataDocRef,
        where("firstName", ">=", text),
        where("firstName", "<", endcode),
        orderBy("firstName", "asc")
      );
      const querySnapshot = await getDocs(usersDataQuery);
      querySnapshot.forEach((user) => {
        users.push(user.data());
      });
      //console.log(users);
      setUsersList(users);
    } catch (error) {
      console.log(error);
    }
  };

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
      <View style={styles.searchContainer}>
        <Icon.Search width={15} height={15} stroke="#A7A7A7" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une discussion ou créer une nouvelle"
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
      <View
        style={[
          {
            flex: 1,
            backgroundColor: "white",
            marginTop: 145,
            width: "100%",
            position: "absolute",
            zIndex: 5,
            borderColor: "red",
            borderWidth: 1,
          },
          { display: search === "" ? "none" : "flex" },
        ]}
      >
        {search !== "" ? (
          <FlatList
            contentContainerStyle={{}}
            showsVerticalScrollIndicator={false}
            ref={reference}
            data={usersList}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => {
              return (
                <View
                  style={{
                    width: "100%",
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F2F2",
                  }}
                ></View>
              );
            }}
            renderItem={searchRenderItem}
          />
        ) : (
          <></>
        )}
      </View>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <FlatList
          contentContainerStyle={{}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ref={reference}
          data={data}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => {
            return (
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "#F1F2F2",
                }}
              ></View>
            );
          }}
          renderItem={conversationItem}
        />
      </View>
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
  renderItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    height: 70,
    padding: 10,
  },
  renderItemLeft: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  details: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderColor: "red",
    borderWidth: 1,
  },
  name: {
    maxWidth: 150,
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  talcsign: {
    fontSize: 14,
    color: "#A7A7A7",
  },
});
