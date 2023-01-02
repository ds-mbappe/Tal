import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import * as Icon from "react-native-feather";
import { StatusBar } from "expo-status-bar";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { AutoFocus, Camera, CameraType, FlashMode } from "expo-camera";
import { useRef } from "react";
import { auth, storage, firestore } from "../firebase";
import {
  query,
  where,
  collection,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const TakePictureProfile = ({ navigation }) => {
  let profile = "";

  let cameraRef = useRef();

  const [type, setType] = useState(CameraType.back);

  const [focus, setFocus] = useState(AutoFocus.on);

  const [flash, setFlash] = useState(FlashMode.off);

  const [previewVisible, setPreviewVisible] = useState(false);

  const [capturedImage, setCapturedImage] = useState("");

  const [permission, requestPermission] = Camera.useCameraPermissions();

  const [isUploading, setIsUploading] = useState(false);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          Permission d'accéder à la caméra necessaire
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Accorder Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlash = () => {
    setFlash((current) =>
      current === FlashMode.off ? FlashMode.torch : FlashMode.off
    );
  };

  const takePicture = async () => {
    let options = {
      quality: 0.1,
      base64: true,
      exif: false,
    };
    let photo = await cameraRef.current.takePictureAsync(options);
    setPreviewVisible(true);
    setCapturedImage(photo);
  };

  const retakePicture = () => {
    setCapturedImage("");
    setPreviewVisible(false);
  };

  const uploadImageAsync = async (image) => {
    const profilePictureRef = ref(
      storage,
      "profilePictures/" + auth.currentUser.uid + "/" + auth.currentUser.uid
    );
    // Upload Image to the right directory
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
      const userDocRef = doc(firestore, "users", auth.currentUser.uid);
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

  // const savePictureAndContinue = async () => {
  //   try {
  //     const userDocRef = doc(firestore, "users", auth.currentUser.uid);
  //     await updateDoc(userDocRef, {
  //       profilePicture: capturedImage.uri,
  //     });
  //     const postDataDocRef = collection(firestore, "posts");
  //     const postDataQuery = query(
  //       postDataDocRef,
  //       where("postOwnerId", "==", auth.currentUser.uid)
  //     );
  //     const querySnapshot = await getDocs(postDataQuery);
  //     querySnapshot.forEach(async (post) => {
  //       await updateDoc(doc(firestore, "posts", post.data().id), {
  //         postOwnerProfilePicture: capturedImage.uri,
  //       });
  //     });
  //     navigation.navigate("Profile");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const cancelTakePicture = () => {
    navigation.navigate("EditProfile");
  };

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
    <View style={styles.container}>
      {previewVisible && capturedImage ? (
        <View
          style={{
            backgroundColor: "black",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              height: "80%",
            }}
          >
            <ImageBackground
              source={{
                uri: "data:image/jpg;base64," + capturedImage.base64,
              }}
              resizeMode="contain"
              style={{
                width: "100%",
                height: "95%",
              }}
            />
          </View>
          <View
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity style={{ margin: 20 }} onPress={retakePicture}>
              <Text style={{ color: "white", fontSize: 20 }}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ margin: 20 }}
              onPress={() => uploadImageAsync(capturedImage.uri)}
            >
              <Text style={{ color: "#F7941D", fontSize: 20 }}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.buttonContainerTop}>
            {type === CameraType.back ? (
              <View
                style={{
                  marginTop: "20%",
                }}
              >
                <TouchableOpacity
                  style={{ marginBottom: 20 }}
                  onPress={toggleFlash}
                >
                  {flash === FlashMode.off ? (
                    <Icon.ZapOff
                      width={25}
                      height={25}
                      stroke="yellow"
                      fill="yellow"
                    />
                  ) : (
                    <Icon.Zap
                      width={25}
                      height={25}
                      stroke="yellow"
                      fill="yellow"
                    />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginTop: "32%" }}></View>
            )}
          </View>
          <Camera
            style={styles.camera}
            type={type}
            autoFocus={focus}
            flashMode={flash}
            ref={cameraRef}
          ></Camera>
          <View style={styles.buttonContainerBottom}>
            <TouchableOpacity onPress={cancelTakePicture}>
              <Text style={{ color: "#F7941D", fontSize: 18 }}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginStart: -30 }}
              onPress={takePicture}
            >
              <CircularProgressBase
                rotation={0}
                value={0}
                maxValue={100}
                radius={45}
                clockwise={true}
                inActiveStrokeWidth={5}
                inActiveStrokeColor="white"
              >
                <View>
                  <View style={styles.TakePictureButton}></View>
                </View>
              </CircularProgressBase>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonFlipCamera}
              onPress={toggleCameraType}
            >
              <Icon.RefreshCw width={25} height={25} stroke="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <StatusBar style="light" />
    </View>
  );
};

export default TakePictureProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    height: "60%",
  },
  buttonContainerTop: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  buttonContainerBottom: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  buttonFlipCamera: {
    width: 25,
  },
  TakePictureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
