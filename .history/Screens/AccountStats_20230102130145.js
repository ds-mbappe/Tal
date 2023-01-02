import { useEffect, React, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  Image,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { auth, firestore } from "../firebase";
import * as Icon from "react-native-feather";
import { doc, updateDoc, getDoc, arrayRemove } from "firebase/firestore";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const AccountStats = ({ route, navigation }) => {
  const { tabName, userId } = route.params;

  const Tab = createMaterialTopTabNavigator();

  const [followersList, setFollowersList] = useState([]);

  const [followingList, setFollowingList] = useState([]);

  const [currentUserData, setCurrentUserData] = useState([]);

  const [selectedUserTalcsign, setSelectedUserTalcsign] = useState("");

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.renderItem}
        activeOpacity={1}
        onPress={() => navigateToClickedUserProfile(item.id)}
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
        {userId == auth.currentUser.uid ? (
          <TouchableOpacity
            style={[
              styles.renderItemRight,
              tabName == "Followers" ? { width: 100 } : { width: 125 },
            ]}
            onPress={
              tabName == "Followers"
                ? () => console.log("Remove follower")
                : () => unfollowUser(item)
            }
          >
            {tabName == "Followers" ? (
              <Text style={styles.buttonText}>Supprimer</Text>
            ) : (
              <Text style={styles.buttonText}>Se désabonner</Text>
            )}
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </TouchableOpacity>
    );
  };

  const unfollowUser = async (item) => {
    // Remove the unfollowed user entry on both sides
    try {
      await updateDoc(doc(firestore, "users", item.id), {
        followers: arrayRemove({
          id: auth.currentUser.uid,
          firstName: currentUserData.firstName,
          lastName: currentUserData.lastName,
          profilePicture: currentUserData.profilePicture,
          talcsign: currentUserData.talcsign,
        }),
      }).then(() => {
        getData();
      });
      await updateDoc(doc(firestore, "users", auth.currentUser.uid), {
        following: arrayRemove({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
          profilePicture: item.profilePicture,
          talcsign: item.talcsign,
        }),
      });
      console.log(
        "You stopped following:",
        item.firstName + " " + item.lastName
      );
    } catch (error) {
      console.log(error);
    }
  };

  const FollowersRoute = () => {
    const HeaderFollowersFlatlist = () => {
      const [followersSearchText, setFollowersSearchText] = useState("");

      return (
        <View style={styles.searchContainer}>
          <Icon.Search width={15} height={15} stroke="#A7A7A7" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher"
            placeholderTextColor="#A7A7A7"
            autoCapitalize="none"
            value={followersSearchText}
            onChangeText={(text) => setFollowersSearchText(text)}
          />
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 30,
              height: 30,
              display: followersSearchText == "" ? "none" : "flex",
            }}
            activeOpacity={1}
            onPress={() => setFollowersSearchText("")}
          >
            <Icon.X width={15} height={15} stroke="#A7A7A7" />
          </TouchableOpacity>
        </View>
      );
    };

    const emptyFollowersListElement = () => {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: "75%",
            backgroundColor: "white",
          }}
        >
          <Text>Vous n'avez aucun abonné pour le moment !</Text>
        </View>
      );
    };

    const [refreshing, setRefreshing] = useState(false);

    const reference = useRef(null);

    const onRefresh = useCallback(() => {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    });

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <FlatList
          contentContainerStyle={{ backgroundColor: "white" }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ref={reference}
          data={followersList}
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
          ListHeaderComponent={HeaderFollowersFlatlist}
          ListEmptyComponent={emptyFollowersListElement}
          renderItem={renderItem}
        />
      </View>
    );
  };

  const FollowingRoute = () => {
    const HeaderFollowingFlatlist = () => {
      const [followingSearchText, setFollowingSearchText] = useState("");

      return (
        <View style={styles.searchContainer}>
          <Icon.Search width={15} height={15} stroke="#A7A7A7" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher"
            placeholderTextColor="#A7A7A7"
            autoCapitalize="none"
            value={followingSearchText}
            onChangeText={(text) => setFollowingSearchText(text)}
          />
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 30,
              height: 30,
              display: followingSearchText == "" ? "none" : "flex",
            }}
            activeOpacity={1}
            onPress={() => setFollowingSearchText("")}
          >
            <Icon.X width={15} height={15} stroke="#A7A7A7" />
          </TouchableOpacity>
        </View>
      );
    };

    const emptyFollowingListElement = () => {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: "75%",
            backgroundColor: "white",
          }}
        >
          <Text>Vous ne suivez personne pour le moment !</Text>
        </View>
      );
    };

    const [refreshing, setRefreshing] = useState(false);

    const reference = useRef(null);

    const onRefresh = useCallback(() => {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    });

    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <FlatList
          contentContainerStyle={{ backgroundColor: "white" }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ref={reference}
          data={followingList}
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
          ListHeaderComponent={HeaderFollowingFlatlist}
          ListEmptyComponent={emptyFollowingListElement}
          renderItem={renderItem}
        />
      </View>
    );
  };

  const navigateToClickedUserProfile = (id) => {
    if (id == auth.currentUser.uid) {
      navigation.navigate("ProfileStack", { screen: "Profile" });
    } else {
      navigation.push("GeneralUserProfile", { userId: id });
    }
  };

  const getData = async () => {
    // Get selected user data
    try {
      const selectedUserDocRef = doc(firestore, "users", userId);
      const selectedUserDocSnapshot = await getDoc(selectedUserDocRef);
      if (selectedUserDocSnapshot.exists()) {
        setSelectedUserTalcsign(selectedUserDocSnapshot.data().talcsign);
        setFollowersList(selectedUserDocSnapshot.data().followers);
        setFollowingList(selectedUserDocSnapshot.data().following);
      } else {
        console.log("Document does not exist!");
      }
    } catch (error) {
      console.log(error);
    }
    // Get current user data
    try {
      const currentUserDocRef = doc(firestore, "users", auth.currentUser.uid);
      const currentUserDocSnapshot = await getDoc(currentUserDocRef);
      if (currentUserDocSnapshot.exists()) {
        setCurrentUserData(currentUserDocSnapshot.data());
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
    <View style={styles.container}>
      <SafeAreaView>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 46,
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
            {selectedUserTalcsign}
          </Text>
          <View style={{ width: 25, height: 25, marginEnd: 10 }}></View>
        </View>
      </SafeAreaView>
      <View
        style={{
          flexGrow: 1,
          backgroundColor: "white",
        }}
      >
        <Tab.Navigator
          screenOptions={{
            tabBarShowLabel: true,
            headerShown: false,
            tabBarActiveTintColor: "black",
            tabBarInactiveTintColor: "#A7A7A7",
            tabBarLabelStyle: {
              fontWeight: "bold",
            },
            tabBarIndicatorStyle: {
              backgroundColor: "#F7941D",
            },
          }}
          initialRouteName={tabName}
        >
          <Tab.Screen name="Followers" component={FollowersRoute} />
          <Tab.Screen name="Following" component={FollowingRoute} />
        </Tab.Navigator>
      </View>
    </View>
  );
};

export default AccountStats;

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
    alignItems: "center",
    width: "100%",
    height: 70,
    padding: 10,
  },
  renderItemLeft: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  details: {
    marginStart: 10,
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
  renderItemRight: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7941D",
    borderRadius: 10,
    height: 40,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
  },
});
