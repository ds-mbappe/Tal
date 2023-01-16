import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import * as Icon from "react-native-feather";
import { StatusBar } from "expo-status-bar";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { AutoFocus, Camera, CameraType, FlashMode } from "expo-camera";
import { useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TakePicture = ({ navigation }) => {
  let cameraRef = useRef();

  const [type, setType] = useState(CameraType.back);
  const [focus, setFocus] = useState(AutoFocus.on);
  const [flash, setFlash] = useState(FlashMode.off);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");
  const [permission, requestPermission] = Camera.useCameraPermissions();

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
      quality: 1,
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

  const savePictureAndContinue = async () => {
    await AsyncStorage.setItem("@registerPP", capturedImage.uri);
    navigation.navigate("Register");
  };

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
              onPress={savePictureAndContinue}
            >
              <Text style={{ color: "#F7941D", fontSize: 20 }}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.buttonContainerTop}>
            {type === CameraType.back ? (
              <View style={{ marginTop: "32%" }}>
                <TouchableOpacity style={styles.button} onPress={toggleFlash}>
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: "white", fontSize: 20 }}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePicture}>
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
            <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
              <Icon.RefreshCw width={25} height={25} stroke="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <StatusBar style="light" />
    </View>
  );
};

export default TakePicture;

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
    marginStart: 15,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  button: {
    width: 25,
    marginEnd: 50,
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
