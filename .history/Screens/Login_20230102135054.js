import { useContext, useState } from "react";
import {
  Image,
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as Icon from "react-native-feather";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { StatusBar } from "expo-status-bar";
import { AuthContext } from "../AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const goToRegister = () => {
    navigation.navigate("Register");
  };

  const goToForgotPassword = () => {
    navigation.navigate("Forgot");
  };

  const handleLogin = () => {
    if (email == "") {
      Alert.alert("Erreur", "Le champ email doit être rempli !", [
        {
          text: "OK",
          style: "default",
        },
      ]);
    } else if (password == "") {
      Alert.alert("Erreur", "Le champ mot de passe doit être rempli !", [
        {
          text: "OK",
          style: "default",
        },
      ]);
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredentials) => {
          const user = userCredentials.user;
          setIsLoggedIn(true);
          await AsyncStorage.setItem("@token", user.uid);
          //navigation.replace("Home", { username: user.email });
        })
        .catch((error) => {
          console.log(error.message);
          Alert.alert("Erreur", "Adresse email ou mot de passe incorrect !", [
            {
              text: "OK",
              style: "default",
            },
          ]);
        });
    }
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
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Connexion</Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <KeyboardAvoidingView style={styles.credentials} behavior="position">
          <Image style={styles.image} source={require("../assets/TalCS.png")} />
          <View>
            <View
              style={[
                styles.bigInputContainer,
                {
                  borderColor: email != "" ? "#F7941D" : "",
                  borderWidth: email != "" ? 1 : 0,
                },
              ]}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.textContainer}>Adresse email</Text>
                <TextInput
                  style={styles.profiletextInputEmail}
                  placeholder="Adresse email"
                  value={email}
                  onChangeText={(text) => setEmail(text.toLowerCase())}
                  placeholderTextColor="gray"
                />
              </View>
            </View>
            <View
              style={[
                styles.bigInputContainer,
                {
                  borderColor: password != "" ? "#F7941D" : "",
                  borderWidth: password != "" ? 1 : 0,
                },
              ]}
            >
              <View style={styles.inputContainer}>
                <Text style={styles.textContainer}>Mot de passe</Text>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    style={styles.profiletextInput}
                    placeholder="Mot de passe"
                    value={password}
                    secureTextEntry={secureTextEntry}
                    onChangeText={(text) => setPassword(text)}
                    placeholderTextColor="gray"
                  />
                  <TouchableOpacity
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  >
                    {secureTextEntry ? (
                      <Icon.Eye width={20} height={20} stroke="#A7A7A7" />
                    ) : (
                      <Icon.EyeOff width={20} height={20} stroke="#A7A7A7" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={goToForgotPassword}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Connexion</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <View style={styles.footer}>
          <Text style={styles.newText}>Pas encore membre? </Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.registerBtn}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "white",
  },
  credentials: {
    flex: 1,
  },
  image: {
    width: 150,
    height: 150,
    marginTop: 50,
    marginBottom: 100,
    alignSelf: "center",
  },
  bigInputContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F2F2",
    height: 60,
    marginTop: 10,
    marginBottom: 10,
    marginEnd: 20,
    marginStart: 20,
    borderRadius: 10,
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
  },
  profiletextInput: {
    width: "80%",
    marginStart: 15,
    textAlign: "center",
    height: 40,
    fontSize: 14,
    color: "#0C0C0C",
  },
  profiletextInputEmail: {
    width: "100%",
    textAlign: "center",
    height: 40,
    fontSize: 14,
    color: "#0C0C0C",
  },
  textContainer: {
    fontSize: 14,
    marginTop: 5,
    color: "#A7A7A7",
  },
  loginText: {
    color: "#0C0C0C",
    fontWeight: "700",
    fontSize: 25,
    alignSelf: "center",
    marginBottom: 70,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 100,
    marginEnd: 20,
  },
  forgotText: {
    fontWeight: "300",
    fontSize: 14,
    color: "#F7941D",
  },
  loginBtn: {
    marginStart: 20,
    marginEnd: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#F7941D",
  },
  loginBtnText: {
    fontWeight: "bold",
    fontSize: 18,
    alignSelf: "center",
    textAlign: "center",
    color: "white",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  newText: {
    color: "#0C0C0C",
    fontSize: 14,
  },
  registerBtn: {
    color: "#F7941D",
    fontWeight: "300",
    fontSize: 14,
  },
});
