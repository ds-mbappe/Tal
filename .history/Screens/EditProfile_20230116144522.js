import {
  View,
  Image,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, React, useRef, useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { auth, firestore, storage } from "../firebase";
import { LinearProgress } from "@rneui/themed";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import {
  query,
  where,
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as Icon from "react-native-feather";
import Modal from "react-native-modal";

const EditProfile = ({ route, navigation }) => {
  let profile = "";

  const userID = auth.currentUser.uid;

  const maxBioChar = 250;

  const reference = useRef(null);

  const [refreshing, setRefreshing] = useState(false);

  const [modalVisibility, setModalVisibility] = useState(false);

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [talcsign, setTalcsign] = useState("");

  const [isTalcsignEditable, setIsTalcsignEditable] = useState(true);

  const [bio, setBio] = useState("");

  const [oldUserData, setUserData] = useState({});

  const [bioCharCount, setBioCharCount] = useState(0);

  const [profilePicture, setProfilePicture] = useState(
    oldUserData.profilePicture
  );

  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.1,
      allowsMultipleSelection: false,
    });
    if (!result.canceled) {
      toggleModal();
      uploadImageAsync(result.assets[0].uri);
    } else if (result.canceled) {
      toggleModal();
    }
  };

  const uploadImageAsync = async (image) => {
    const profilePictureRef = ref(
      storage,
      "profilePictures/" + userID + "/" + userID
    );
    // Upload picture to Firebase Storage
    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", image, true);
        xhr.send(null);
      });
      await uploadBytes(profilePictureRef, blob, {
        contentType: "image/jpeg",
      }).then(async () => {
        await getDownloadURL(profilePictureRef)
          .then(async (url) => {
            profile = url;
            setIsUploading(true);
            // We're done with the blob, close and release it
            blob.close();
          })
          .catch((e) => {
            console.log(e);
          });
      });
    } catch (error) {
      console.log(error);
    }
    // Set new profile picture Url
    try {
      const userDocRef = doc(firestore, "users", userID);
      await updateDoc(userDocRef, {
        profilePicture: profile,
      });
    } catch (error) {
      console.log(error);
    }
    // Update all user posts with the new profile Url
    try {
      const postDataDocRef = collection(firestore, "posts");
      const postDataQuery = query(
        postDataDocRef,
        where("postOwnerId", "==", auth.currentUser.uid)
      );
      const postQuerySnapshot = await getDocs(postDataQuery);
      postQuerySnapshot.forEach(async (post) => {
        await updateDoc(doc(firestore, "posts", post.data().id), {
          postOwnerProfilePicture: profile,
        });
      });
    } catch (error) {
      console.log(error);
    }
    // Update all user comments with the new profile Url
    try {
      const commentDataDocRef = collection(firestore, "comments");
      const commentDataQuery = query(
        commentDataDocRef,
        where("commentOwnerId", "==", auth.currentUser.uid)
      );
      const commentQuerySnapshot = await getDocs(commentDataQuery);
      commentQuerySnapshot.forEach(async (comment) => {
        await updateDoc(doc(firestore, "comments", comment.data().id), {
          commentOwnerProfilePicture: profile,
        });
      });
    } catch (error) {
      console.log(error);
    }
    navigation.navigate("Profile");
    setIsUploading(false);
  };

  const toggleModal = () => {
    setModalVisibility(!modalVisibility);
  };

  const deleteProfilePicture = async () => {
    toggleModal();
    navigation.goBack();
    const userDocRef = doc(firestore, "users", userID);
    await updateDoc(userDocRef, {
      profilePicture:
        "https://e7.pngegg.com/pngimages/518/64/png-clipart-person-icon-computer-icons-user-profile-symbol-person-miscellaneous-monochrome-thumbnail.png",
    });
  };

  const updateUserInfo = async () => {
    try {
      if (
        !(profilePicture && (firstName || lastName || talcsign || bio) == "")
      ) {
        let talcSignList = [];
        try {
          const usersRef = collection(firestore, "users");
          const talcsignInDocumentQuerry = query(usersRef);
          const querySnapshot = await getDocs(talcsignInDocumentQuerry);
          querySnapshot.forEach((doc) => {
            talcSignList.push(doc.data().talcsign);
          });
        } catch (error) {
          console.log(error);
        }
        if (talcSignList.includes(talcsign)) {
          alert("Ce talcign est déjà pris, choisissez-en un autre");
        } else {
          const userDocRef = doc(firestore, "users", userID);
          await updateDoc(userDocRef, {
            firstName: firstName == "" ? oldUserData.firstName : firstName,
            lastName: lastName == "" ? oldUserData.lastName : lastName,
            talcsign: talcsign == "" ? oldUserData.talcsign : talcsign,
            profilePicture:
              profilePicture ==
              "https://e7.pngegg.com/pngimages/518/64/png-clipart-person-icon-computer-icons-user-profile-symbol-person-miscellaneous-monochrome-thumbnail.png"
                ? oldUserData.profilePicture
                : profilePicture,
            bio: bio == "" ? oldUserData.bio : bio,
          });
          console.log("Updated user data successfully !");
          navigation.navigate("Profile");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const goToCamerapage = () => {
    toggleModal();
    navigation.navigate("TakePictureProfile");
  };

  const getData = async () => {
    try {
      const connectedUserDocRef = doc(firestore, "users", auth.currentUser.uid);
      const connectedUserDocSnapshot = await getDoc(connectedUserDocRef);
      if (connectedUserDocSnapshot.exists()) {
        setUserData(connectedUserDocSnapshot.data());
      } else {
        console.log("Document does not exist!");
      }
    } catch (error) {
      console.log("Error");
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  });

  // useFocusEffect(
  //   useCallback(() => {
  //   }, [])
  // );

  useEffect(() => {
    getData();
  }, []);

  if (isUploading == true) {
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
        <View style={{ width: 25, height: 25, marginEnd: 10 }}></View>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <KeyboardAvoidingView behavior="position" style={styles.credentials}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginStart: 10,
              marginEnd: 20,
              marginBottom: 50,
            }}
          >
            <View style={{ marginTop: 10, marginBottom: 10 }}>
              <CircularProgressBase
                rotation={180}
                value={0}
                maxValue={100}
                radius={60}
                clockwise={true}
                inActiveStrokeOpacity={0}
                inActiveStrokeWidth={6}
                activeStrokeWidth={6}
                activeStrokeColor="#0096FF"
              >
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={styles.profileImage}
                    source={{
                      uri: oldUserData.profilePicture
                        ? oldUserData.profilePicture
                        : profilePicture,
                    }}
                  />
                  <TouchableOpacity
                    onPress={toggleModal}
                    style={{
                      position: "absolute",
                      bottom: -20,
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      borderColor: "white",
                      borderWidth: 2,
                      backgroundColor: "#F7941D",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon.Edit2 width={20} height={20} stroke="white" />
                  </TouchableOpacity>
                </View>
              </CircularProgressBase>
            </View>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ marginBottom: 20 }}>
                <LinearProgress
                  style={{
                    width: 210,
                    height: 6,
                    borderRadius: 5,
                  }}
                  variant="determinate"
                  color="#000000"
                  value={0.85}
                />
                <Text style={{ marginTop: 5 }}>PV: 30000 / 100000</Text>
              </View>
              <View style={{ marginBottom: 10 }}>
                <LinearProgress
                  style={{
                    width: 210,
                    height: 6,
                    borderRadius: 5,
                  }}
                  variant="determinate"
                  color="#F7941D"
                  value={0.73}
                />
                <Text style={{ marginTop: 5 }}>XP: 250000 / 300000</Text>
              </View>
              <Text style={{ width: 210 }}>
                Une fois le nombre de PV maximum atteint, tous les PV obtenus
                seront convertis en XP
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.bigInputContainer,
              {
                borderColor: firstName != "" ? "#F7941D" : "#F1F2F2",
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.textContainer}>Prénom</Text>
              <TextInput
                style={styles.profiletextInputEmail}
                placeholder={
                  oldUserData.firstName ? oldUserData.firstName : "Prénom"
                }
                value={firstName}
                onChangeText={(text) => setFirstName(text)}
                placeholderTextColor="gray"
              />
            </View>
          </View>
          <View
            style={[
              styles.bigInputContainer,
              {
                borderColor: lastName != "" ? "#F7941D" : "#F1F2F2",
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.textContainer}>Nom</Text>
              <TextInput
                style={styles.profiletextInputEmail}
                placeholder={
                  oldUserData.lastName ? oldUserData.lastName : "Nom"
                }
                value={lastName}
                onChangeText={(text) => setLastName(text)}
                placeholderTextColor="gray"
              />
            </View>
          </View>
          <View
            style={[
              styles.bigInputContainer,
              {
                borderColor: talcsign != "" ? "#F7941D" : "#F1F2F2",
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.textContainer}>TalCSign</Text>
              <TextInput
                style={styles.profiletextInputEmail}
                placeholder={
                  oldUserData.talcsign ? oldUserData.talcsign : "@talcsign"
                }
                value={talcsign}
                editable={isTalcsignEditable}
                onChangeText={(text) => setTalcsign(text)}
                placeholderTextColor="gray"
              />
            </View>
          </View>
          <View
            style={[
              styles.bigInputContainer,
              {
                borderColor: bio != "" ? "#F7941D" : "#F1F2F2",
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.textContainer}>Bio</Text>
              <TextInput
                style={styles.profiletextInputEmail}
                placeholder={oldUserData.bio ? oldUserData.bio : "Bio"}
                multiline={true}
                maxLength={maxBioChar}
                value={bio}
                onChangeText={(text) => {
                  setBio(text), setBioCharCount(text.length);
                }}
                placeholderTextColor="gray"
              />
              <Text
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: 0,
                  alignSelf: "flex-end",
                  fontWeight: "bold",
                  color: bioCharCount == maxBioChar ? "#E94E1B" : "#F7941D",
                }}
              >
                {bioCharCount}/{maxBioChar}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.finishBtnContainer}
            onPress={updateUserInfo}
          >
            <Text style={styles.finishBtnText}>Terminer</Text>
          </TouchableOpacity>
          <Modal onBackdropPress={toggleModal} isVisible={modalVisibility}>
            <View
              style={{
                width: "100%",
                position: "absolute",
                bottom: 0,
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <TouchableOpacity
                  onPress={goToCamerapage}
                  activeOpacity={0.75}
                  style={styles.modalButtonContainer}
                >
                  <Text style={styles.modalButtonText}>Prendre une photo</Text>
                </TouchableOpacity>
                <View
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: "#f1f2f2",
                  }}
                ></View>
                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={0.75}
                  style={styles.modalButtonContainer}
                >
                  <Text style={styles.modalButtonText}>
                    Importer depuis la galerie
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: "#f1f2f2",
                  }}
                ></View>
                <TouchableOpacity
                  onPress={deleteProfilePicture}
                  activeOpacity={0.75}
                  style={styles.modalButtonContainer}
                >
                  <Text style={styles.modalButtonText}>Supprimer la photo</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.modalHideButton}
                  onPress={() => setModalVisibility(!modalVisibility)}
                >
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    alignSelf: "center",
  },
  changeBtn: {
    width: "100%",
    alignSelf: "center",
    marginBottom: 100,
  },
  changeText: {
    color: "#FF6600",
    fontSize: 18,
    alignSelf: "center",
  },
  credentials: {
    flex: 1,
    justifyContent: "center",
  },
  bigInputContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F2F2",
    borderWidth: 1,
    height: 60,
    marginTop: 10,
    marginBottom: 10,
    marginEnd: 20,
    marginStart: 20,
    borderRadius: 10,
  },
  bioInputContainer: {
    flexDirection: "row",
    borderColor: "#F7941D",
    borderWidth: 1,
    marginTop: 15,
    marginEnd: 20,
    marginBottom: 15,
    marginStart: 20,
    padding: 10,
    borderRadius: 10,
  },
  profiletextInput: {
    width: "100%",
    height: 40,
    fontSize: 14,
    textAlign: "center",
    color: "#0C0C0C",
  },
  profiletextInputEmail: {
    width: "100%",
    textAlign: "center",
    height: 40,
    fontSize: 14,
    color: "#0C0C0C",
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
  },
  textContainer: {
    fontSize: 14,
    marginTop: 5,
    color: "#A7A7A7",
  },
  finishBtnContainer: {
    marginTop: 50,
    marginStart: 20,
    marginEnd: 20,
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#F7941D",
  },
  finishBtnText: {
    width: 100,
    fontWeight: "bold",
    fontSize: 18,
    alignSelf: "center",
    textAlign: "center",
    color: "white",
  },
  modalButtonContainer: {
    backgroundColor: "white",
    padding: 20,
  },
  modalHideButton: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 20,
    borderRadius: 14,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#0C0C0C",
    textAlign: "center",
  },
});
