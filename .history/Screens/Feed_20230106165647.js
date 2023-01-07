import {
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Share,
} from "react-native";
import { auth, firestore } from "../firebase";
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
import { StatusBar } from "expo-status-bar";
import * as Icon from "react-native-feather";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { React, useRef, useState, useCallback } from "react";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import Modal from "react-native-modal";

const Feed = ({ route, navigation }) => {
  const reference = useRef(null);

  const [refreshing, setRefreshing] = useState(false);

  const [posts, setPosts] = useState([]);

  const [modalVisibility, setModalVisibility] = useState(false);

  const [featuredImage, setFeaturedImage] = useState("");

  const PostItem = ({ item }) => {
    return (
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
              <Text style={styles.postUserDate}>
                {getElapsedTime(item.postPublishedTime)}
              </Text>
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
              <TouchableOpacity
                style={{
                  borderColor: "#F1F2F2",
                  borderWidth: 1,
                  marginStart: 55,
                  marginEnd: 20,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
                activeOpacity={1}
                onPress={() => toggleModalAndSetImage(item)}
              >
                <Image
                  style={styles.postImage}
                  source={{
                    uri: item,
                  }}
                />
              </TouchableOpacity>
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
                item.postDislikes.includes(auth.currentUser.uid) ? true : false
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
              <Icon.Repeat style={{}} width={20} height={20} stroke="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, color: "black" }}>
              {" " + item.postRetalcs.length}
            </Text>
          </View>
          <View style={styles.postButton}>
            <TouchableOpacity onPress={() => sharePost(item.id)}>
              <Icon.Share style={{}} width={20} height={20} stroke="black" />
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          onBackdropPress={toggleModal}
          isVisible={modalVisibility}
          backdropOpacity={1}
        >
          <View
            style={{
              flex: 1,
              width: "100%",
              position: "absolute",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <View>
              <Image
                style={{ aspectRatio: 1, width: "100%", flex: 1 }}
                source={{ uri: featuredImage }}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const EmptyListElement = ({ item }) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
      <View
        style={{
          flex: 1,
          marginTop: "45%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Text>Aucune publication pour le moment !</Text>
      </View>
    );
  };

  const toggleModal = () => {
    setModalVisibility(!modalVisibility);
  };

  const toggleModalAndSetImage = (imageUrl) => {
    toggleModal();
    setFeaturedImage(imageUrl);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getPostData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  });

  const getElapsedTime = (time) => {
    const postDate = new Date(time);
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();

    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }

    let formattedDate = mm + "/" + dd + "/" + yyyy;

    let diff = today.getTime() - postDate.getTime();

    let secondsElapsed = Math.floor(diff) / 1000;

    if (secondsElapsed > 0 && secondsElapsed < 60) {
      return "Il y'a " + secondsElapsed.valueOf() + " secondes";
    } else if (secondsElapsed >= 60 && secondsElapsed < 3600) {
      return "Il y'a " + secondsElapsed / 60 + " minutes";
    } else if (secondsElapsed >= 3600 && secondsElapsed < 86400) {
      return "Il y'a " + secondsElapsed / 3600 + " heures";
    } else {
      return "default";
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

  const goToGeneralUserProfile = (userId) => {
    if (userId == auth.currentUser.uid) {
      navigation.navigate("ProfileStack", { screen: "Profile" });
    } else {
      navigation.push("GeneralUserProfile", { userId: userId });
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
            getPostData();
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            await updateDoc(postDocRef, {
              postLikes: arrayUnion(auth.currentUser.uid),
            });
            getPostData();
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
            getPostData();
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            await updateDoc(postDocRef, {
              postDislikes: arrayUnion(auth.currentUser.uid),
            });
            getPostData();
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

  const getPostData = async () => {
    try {
      let posts = [];
      const postDataDocRef = collection(firestore, "posts");
      const postDataQuery = query(
        postDataDocRef,
        orderBy("postPublishedTime", "desc")
      );
      const querySnapshot = await getDocs(postDataQuery);
      querySnapshot.forEach((post) => {
        posts.push(post.data());
      });
      setPosts(posts);
    } catch (error) {
      console.log(error);
    }
  };

  useScrollToTop(reference);

  useFocusEffect(
    useCallback(() => {
      getPostData();
    }, [])
  );

  // useEffect(() => {
  //   getPostData();
  // }, []);

  if (posts.length == 0) {
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
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Feed</Text>
      </View>
      <FlatList
        contentContainerStyle={{}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ref={reference}
        data={posts}
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
        ListEmptyComponent={EmptyListElement}
        renderItem={PostItem}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default Feed;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
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
  postMoreContainer: {},
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
    aspectRatio: 1,
    width: "150%",
    flex: 1,
  },
  postButtons: {
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
  searchContainer: {
    borderColor: "#0C0C0C",
    borderWidth: 1,
    flexDirection: "column",
    borderRadius: 50,
  },
  searchInput: {
    paddingTop: 10,
    paddingStart: 15,
    paddingBottom: 10,
  },
});
