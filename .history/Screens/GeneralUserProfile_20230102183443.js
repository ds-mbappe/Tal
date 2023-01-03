import { useEffect, React, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  Image,
  View,
  Animated,
  FlatList,
  TouchableOpacity,
  Share,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { auth, firestore } from "../firebase";
import * as Icon from "react-native-feather";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import {
  where,
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  orderBy,
  arrayUnion,
  query,
  arrayRemove,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GeneralUserProfile = ({ route, navigation }) => {
  const { userId } = route.params;

  const Header_Max_Height = 330;

  const Header_Min_Height = 0;

  const scrollOffsetY = useRef(new Animated.Value(0)).current;

  const [index, setIndex] = useState(0);

  const [userData, setUserData] = useState({});

  const [currentUserData, setCurrentUserData] = useState([]);

  const [followersCount, setFollowersCount] = useState(0);

  const [followingCount, setFollowingCount] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);

  const [selectedUserPosts, setSelectedUserPosts] = useState([]);

  const emptyListElement = () => {
    return (
      <View
        style={{
          flex: 1,
          marginTop: "40%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Text>Aucune publication pour le moment !</Text>
      </View>
    );
  };

  const FirstRoute = () => {
    const reference = useRef(null);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
      setRefreshing(true);
      getData();
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    });

    return (
      <FlatList
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ref={reference}
        data={selectedUserPosts}
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
        ListEmptyComponent={emptyListElement}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              flexDirection: "column",
              textAlign: "justify",
            }}
          >
            <View style={styles.postUserInfo}>
              <TouchableOpacity
                style={styles.postUserInfoLeft}
                onPress={() => goToGeneralUserProfile(item.postOwnerId)}
              >
                <View style={styles.postPhotoContainer}>
                  <Image
                    style={styles.postUserPhoto}
                    source={{ uri: item.postOwnerProfilePicture }}
                  />
                </View>
                <View style={styles.postUserNameContainer}>
                  <Text style={styles.postUserName}>
                    {item.postOwnerFirstName + " " + item.postOwnerLastName}
                  </Text>
                  <Text style={styles.postUserDate}>Il y'a 15 minutes</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.postMoreContainer}>
                <TouchableOpacity>
                  <Icon.MoreVertical
                    style={{}}
                    width={20}
                    height={20}
                    stroke="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.postText}>{item.postActualText}</Text>
            {item.postImages.length > 0 ? (
              <FlatList
                contentContainerStyle={{}}
                horizontal={true}
                data={item.postImages}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Image
                    style={styles.postImage}
                    source={{
                      uri: item,
                    }}
                  />
                )}
              />
            ) : (
              <></>
            )}
            <View style={styles.postButtons}>
              <View style={styles.postButton}>
                <TouchableOpacity
                  onPress={() => likePost(item.id)}
                  disabled={
                    item.postDislikes.includes(auth.currentUser.uid)
                      ? true
                      : false
                  }
                >
                  {!item.postLikes.includes(auth.currentUser.uid) ? (
                    <MaterialCommunityIcons
                      name="heart-outline"
                      size={20}
                      color="black"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="heart"
                      size={20}
                      color="#F7941D"
                    />
                  )}
                </TouchableOpacity>
                <Text style={{ fontSize: 18, color: "black" }}>
                  {" " + item.postLikes.length}
                </Text>
              </View>
              <View style={styles.postButton}>
                <TouchableOpacity
                  onPress={() => dislikePost(item.id)}
                  disabled={
                    item.postLikes.includes(auth.currentUser.uid) ? true : false
                  }
                >
                  {!item.postDislikes.includes(auth.currentUser.uid) ? (
                    <MaterialCommunityIcons
                      name="heart-broken-outline"
                      size={20}
                      color="black"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="heart-broken"
                      size={20}
                      color="#F7941D"
                    />
                  )}
                </TouchableOpacity>
                <Text style={{ fontSize: 18, color: "black" }}>
                  {" " + item.postDislikes.length}
                </Text>
              </View>
              <View style={styles.postButton}>
                <TouchableOpacity
                  onPress={() => {
                    goToCommentariesPage(item.id);
                  }}
                >
                  <FontAwesome name="comment-o" size={20} color="black" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, color: "black" }}>
                  {" " + item.postCommentsNumber}
                </Text>
              </View>
              <View style={styles.postButton}>
                <TouchableOpacity>
                  <Icon.Repeat
                    style={{}}
                    width={20}
                    height={20}
                    stroke="black"
                  />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, color: "black" }}>
                  {" " + item.postRetalcs.length}
                </Text>
              </View>
              <View style={styles.postButton}>
                <TouchableOpacity onPress={() => sharePost(item.id)}>
                  <Icon.Share
                    style={{}}
                    width={20}
                    height={20}
                    stroke="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    );
  };

  const renderScene = SceneMap({
    first: FirstRoute,
  });

  const [routes] = useState([{ key: "first", title: "Posts" }]);

  const animateHeaderOpacity = scrollOffsetY.interpolate({
    inputRange: [0, Header_Max_Height - Header_Min_Height],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const animateHeaderHeight = scrollOffsetY.interpolate({
    inputRange: [0, Header_Max_Height - Header_Min_Height],
    outputRange: [Header_Max_Height, Header_Min_Height],
    extrapolate: "clamp",
  });

  const followOrUnfollowUser = async (userId) => {
    if (isFollowing == false) {
      // If isFollowing is false then Follow the user
      try {
        await updateDoc(doc(firestore, "users", userId), {
          followers: arrayUnion({
            id: auth.currentUser.uid,
            firstName: currentUserData.firstName,
            lastName: currentUserData.lastName,
            profilePicture: currentUserData.profilePicture,
            talcsign: currentUserData.talcsign,
          }),
        }).then(async () => {
          setIsFollowing(true);
          const selectedUserDocRef = doc(firestore, "users", userId);
          const selectedUserDocSnapshot = await getDoc(selectedUserDocRef);
          if (selectedUserDocSnapshot.exists()) {
            setUserData(selectedUserDocSnapshot.data());
            setFollowersCount(selectedUserDocSnapshot.data().followers.length);
            setFollowingCount(selectedUserDocSnapshot.data().following.length);
          } else {
            console.log("Document does not exist!");
          }
        });
        await updateDoc(doc(firestore, "users", auth.currentUser.uid), {
          following: arrayUnion({
            id: userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePicture: userData.profilePicture,
            talcsign: userData.talcsign,
          }),
        });
        //console.log("You started following: ", userId);
      } catch (error) {
        console.log(error);
      }
    } else {
      // If isFollowing is true then Unfollow the user
      try {
        await updateDoc(doc(firestore, "users", userId), {
          followers: arrayRemove({
            id: auth.currentUser.uid,
            firstName: currentUserData.firstName,
            lastName: currentUserData.lastName,
            profilePicture: currentUserData.profilePicture,
            talcsign: currentUserData.talcsign,
          }),
        }).then(async () => {
          setIsFollowing(false);
          const selectedUserDocRef = doc(firestore, "users", userId);
          const selectedUserDocSnapshot = await getDoc(selectedUserDocRef);
          if (selectedUserDocSnapshot.exists()) {
            setUserData(selectedUserDocSnapshot.data());
            setFollowersCount(selectedUserDocSnapshot.data().followers.length);
            setFollowingCount(selectedUserDocSnapshot.data().following.length);
          } else {
            console.log("Document does not exist!");
          }
        });
        await updateDoc(doc(firestore, "users", auth.currentUser.uid), {
          following: arrayRemove({
            id: userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePicture: userData.profilePicture,
            talcsign: userData.talcsign,
          }),
        });
        //console.log("You stopped following: ", userId);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const messageUser = (userId) => {
    //console.log("Now Messaging: ", userId);
  };

  const navigateToFollowers = () => {
    navigation.push("AccountStats", { tabName: "Followers", userId: userId });
  };

  const navigateToFollowing = () => {
    navigation.push("AccountStats", { tabName: "Following", userId: userId });
  };

  const goToGeneralUserProfile = (userId) => {
    if (userId == auth.currentUser.uid) {
      navigation.navigate("Profile");
    } else {
      navigation.push("GeneralUserProfile", { userId: userId });
    }
  };

  const getData = async () => {
    // Check if the profile that is shown is followed by the current user
    try {
      const userDocRef = doc(firestore, "users", auth.currentUser.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        userDocSnapshot.data().following.forEach((element) => {
          if (element.id == userId) {
            setIsFollowing(true);
          }
        });
        // if (userDocSnapshot.data().following.includes(userId)) {
        //   setFollowing(true);
        // }
      } else {
        console.log("Document does not exist!");
      }
    } catch (error) {
      console.log(error);
    }
    // Get all posts of the selected user from Firestore and store them
    try {
      let posts = [];
      const postDataDocRef = collection(firestore, "posts");
      const postDataQuery = query(
        postDataDocRef,
        where("postOwnerId", "==", userId),
        orderBy("postPublishedTime", "desc")
      );
      const querySnapshot = await getDocs(postDataQuery);
      querySnapshot.forEach((post) => {
        posts.push(post.data());
      });
      setSelectedUserPosts(posts);
    } catch (error) {
      console.log(error);
    }
    // Get selected user data
    try {
      const selectedUserDocRef = doc(firestore, "users", userId);
      const selectedUserDocSnapshot = await getDoc(selectedUserDocRef);
      if (selectedUserDocSnapshot.exists()) {
        setUserData(selectedUserDocSnapshot.data());
        setFollowersCount(selectedUserDocSnapshot.data().followers.length);
        setFollowingCount(selectedUserDocSnapshot.data().following.length);
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

  const likePost = async (postId) => {
    try {
      const postDocRef = doc(firestore, "posts", postId);
      const postDocSnapshot = await getDoc(postDocRef);
      if (postDocSnapshot.exists()) {
        if (postDocSnapshot.data().postLikes.includes(auth.currentUser.uid)) {
          try {
            await updateDoc(postDocRef, {
              postLikes: arrayRemove(auth.currentUser.uid),
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            await updateDoc(postDocRef, {
              postLikes: arrayUnion(auth.currentUser.uid),
            });
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        console.log("The document does not exist !");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dislikePost = async (postId) => {
    try {
      const postDocRef = doc(firestore, "posts", postId);
      const postDocSnapshot = await getDoc(postDocRef);
      if (postDocSnapshot.exists()) {
        if (
          postDocSnapshot.data().postDislikes.includes(auth.currentUser.uid)
        ) {
          try {
            await updateDoc(postDocRef, {
              postDislikes: arrayRemove(auth.currentUser.uid),
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            await updateDoc(postDocRef, {
              postDislikes: arrayUnion(auth.currentUser.uid),
            });
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        console.log("The document does not exist !");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const goToCommentariesPage = async (postId) => {
    // Get all comments from Firestore and store them
    try {
      let comments = [];
      const commentDataDocRef = collection(firestore, "comments");
      const commentDataQuery = query(
        commentDataDocRef,
        where("commentRelatedPostId", "==", postId),
        orderBy("commentPublishedTime", "desc")
      );
      await getDocs(commentDataQuery).then(async (querySnapshot) => {
        querySnapshot.forEach((post) => {
          comments.push(post.data());
        });
        await AsyncStorage.setItem("@postId", postId).then(() => {
          navigation.navigate("CommentPage", { postComments: comments });
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const sharePost = async (postId) => {
    try {
      const result = await Share.share({
        message: postId,
      });
      // if (result.action === Share.sharedAction) {
      //   if (result.activityType) {
      //   } else {
      //   }
      // } else if (result.action === Share.dismissedAction) {
      // }
    } catch (error) {
      console.log(error);
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     getData();
  //   }, [])
  // );

  useEffect(() => {
    getData();
  }, []);

  if (Object.keys(userData).length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Animated.View
          style={{
            alignItems: "center",
            backgroundColor: "white",
            left: 0,
            right: 0,
            height: animateHeaderHeight,
            opacity: animateHeaderOpacity,
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
            <View style={{ width: 25, height: 25, marginEnd: 10 }}></View>
          </View>
          <View style={styles.userBio}>
            <View style={styles.userBioTop}>
              <View
                style={[
                  styles.userStat,
                  userId == auth.currentUser.uid
                    ? { justifyContent: "center" }
                    : { justifyContent: "space-between" },
                ]}
              >
                <TouchableOpacity
                  onPress={navigateToFollowers}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Text style={styles.statValue}>{followersCount}</Text>
                  <Text>Abonnés</Text>
                </TouchableOpacity>
                {userId == auth.currentUser.uid ? (
                  <></>
                ) : (
                  <TouchableOpacity
                    onPress={() => followOrUnfollowUser(userId)}
                  >
                    {isFollowing == false ? (
                      <Icon.UserPlus width={25} height={25} stroke="black" />
                    ) : (
                      <Icon.UserMinus width={25} height={25} stroke="black" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ width: "31.5%", marginBottom: 5 }}>
                <CircularProgressBase
                  rotation={180}
                  value={45}
                  maxValue={100}
                  radius={60}
                  clockwise={true}
                  inActiveStrokeOpacity={0}
                  inActiveStrokeWidth={6}
                  activeStrokeWidth={6}
                  activeStrokeColor="#F7941D"
                >
                  <CircularProgressBase
                    rotation={180}
                    value={25}
                    maxValue={100}
                    radius={60}
                    clockwise={false}
                    inActiveStrokeOpacity={0}
                    inActiveStrokeWidth={6}
                    activeStrokeWidth={6}
                    activeStrokeColor="#000000"
                    children={
                      <View>
                        <View style={styles.photoContainer}>
                          <Image
                            style={styles.image}
                            // source={{ uri: "https://placeimg.com/640/480/any" }}
                            source={{ uri: userData.profilePicture }}
                          />
                        </View>
                        <TouchableOpacity
                          style={{
                            position: "absolute",
                            left: 35,
                            bottom: -20,
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            borderColor: "white",
                            borderWidth: 2,
                            backgroundColor: "#E94E1B",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontSize: 20,
                              fontWeight: "bold",
                            }}
                          >
                            S
                          </Text>
                        </TouchableOpacity>
                      </View>
                    }
                  />
                </CircularProgressBase>
              </View>
              <View
                style={[
                  styles.userStat,
                  userId == auth.currentUser.uid
                    ? { justifyContent: "center" }
                    : { justifyContent: "space-between" },
                ]}
              >
                <TouchableOpacity
                  onPress={navigateToFollowing}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.statValue}>{followingCount}</Text>
                  <Text>Abonnements</Text>
                </TouchableOpacity>
                {userId == auth.currentUser.uid ? (
                  <></>
                ) : (
                  <TouchableOpacity onPress={() => messageUser(userId)}>
                    <Icon.MessageCircle width={25} height={25} stroke="black" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.userBioBottom}>
              <Text style={styles.talText}>{userData.talcsign}</Text>
              <Text style={styles.bioText}>{userData.bio}</Text>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
      <View
        style={{
          flexGrow: 1,
          backgroundColor: "white",
        }}
      >
        <TabView
          renderTabBar={(props) => {
            return (
              <TabBar
                {...props}
                renderLabel={({ route, focused, color }) => (
                  <Text
                    style={
                      focused
                        ? {
                            width: "100%",
                            color: "#0C0C0C",
                            margin: 5,
                            fontWeight: "bold",
                          }
                        : { color: "#0C0C0C", margin: 5 }
                    }
                  >
                    {route.title}
                  </Text>
                )}
                indicatorStyle={{ backgroundColor: "#FF6600" }}
                style={{ backgroundColor: "white" }}
              />
            );
          }}
          style={{ flexGrow: 1, height: "100%" }}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
        />
      </View>
    </View>
  );
};

export default GeneralUserProfile;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
  },
  userClass: {
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    // borderColor: "red",
    // borderWidth: 1,
  },
  talText: {
    width: "100%",
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  bioText: {
    fontSize: 14,
    color: "#0C0C0C",
    alignSelf: "center",
    textAlign: "center",
    marginTop: 10,
    // borderColor: "red",
    // borderWidth: 1,
  },
  userBio: {
    width: "100%",
    flexDirection: "column",
    padding: 20,
    alignItems: "center",
  },
  userBioTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    // borderWidth: 1,
    // borderColor: "red",
  },
  userBioBottom: {
    width: "100%",
    flexDirection: "column",
  },
  photoContainer: {
    width: 100,
    // borderColor: "red",
    // borderWidth: 1,
    flexDirection: "column",
  },
  detailContainer: {
    flexDirection: "row",
    margin: 10,
    alignItems: "center",
  },
  userStats: {
    padding: 10,
    width: "100%",
    // borderWidth: 1,
    // borderColor: "red",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  userStat: {
    width: "25%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 15,
    // borderWidth: 1,
    // borderColor: "red",
  },
  followBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7941D",
    borderRadius: 10,
    width: 100,
    height: 40,
  },
  followBtntext: {
    fontWeight: "bold",
    color: "white",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    // borderWidth: 1,
    // borderColor: "red",
  },
  postUserInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postUserInfoLeft: {
    flexDirection: "row",
  },
  postPhotoContainer: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
  postUserPhoto: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
  },
  postUserNameContainer: {
    flexDirection: "column",
    // borderColor: "red",
    // borderWidth: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0C0C0C",
  },
  postUserDate: {
    fontSize: 14,
    color: "gray",
  },
  postMoreContainer: {
    // borderColor: "red",
    // borderWidth: 1,
  },
  postText: {
    fontSize: 18,
    color: "#0C0C0C",
    marginTop: 10,
    marginStart: 55,
    marginBottom: 10,
  },
  postImageContainer: {
    flexGrow: 1,
  },
  postImage: {
    marginStart: 55,
    marginEnd: 20,
    borderRadius: 10,
    width: 252,
    height: 252,
    borderColor: "#F1F2F2",
    borderWidth: 1,
  },
  postButtons: {
    // borderColor: "red",
    // borderWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
  },
  postButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
