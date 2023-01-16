import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../AuthProvider";
import * as Icon from "react-native-feather";
import TakePicture from "../Screens/TakePicture";
import TakePictureProfile from "../Screens/TakePictureProfile";
import EditProfile from "../Screens/EditProfile";
import Feed from "../Screens/Feed";
import Search from "../Screens/Search";
import NewPost from "../Screens/NewPost";
import Messages from "../Screens/Messages";
import Profile from "../Screens/Profile";
import Login from "../Screens/Login";
import Register from "../Screens/Register";
import ForgotPassword from "../Screens/ForgotPassword";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Image, Text, View } from "react-native";
import Settings from "../Screens/Settings";
import CommentPage from "../Screens/CommentPage";
import Gateaway from "../Screens/Gateaway";
import GeneralUserProfile from "../Screens/GeneralUserProfile";
import AccountStats from "../Screens/AccountStats";
import Conversation from "../Screens/Conversation";

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const HomeStack = ({ navigation, route }) => {
  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);
    const tabHiddenRoutes = ["Settings", "CommentPage"];
    if (tabHiddenRoutes.includes(routeName)) {
      navigation.setOptions({
        tabBarStyle: { position: "absolute", display: "none" },
      });
    } else {
      navigation.setOptions({ tabBarStyle: { display: "flex" } });
    }
  });

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Feed"
        component={Feed}
        options={{
          title: "Feed",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          title: "Modifier Profil",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="TakePictureProfile"
        component={TakePictureProfile}
        options={{
          title: "TakePictureProfile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CommentPage"
        component={CommentPage}
        options={{
          title: "Commentaires",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="NewPost"
        component={NewPost}
        options={{
          title: "Nouvelle publication",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="GeneralUserProfile"
        component={GeneralUserProfile}
        options={{
          title: "GeneraluserProfile",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="AccountStats"
        component={AccountStats}
        options={{
          title: "Account Stats",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

const SearchStack = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Search"
        component={Search}
        options={{
          title: "Recherche",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CommentPage"
        component={CommentPage}
        options={{
          title: "Commentaires",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="GeneralUserProfile"
        component={GeneralUserProfile}
        options={{
          title: "GeneraluserProfile",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="AccountStats"
        component={AccountStats}
        options={{
          title: "Account Stats",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

const GateawayStack = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Gateaway"
        component={Gateaway}
        options={{
          title: "Gateaway",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="NewPost"
        component={NewPost}
        options={{
          title: "Nouvelle Publication",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

const MessagesStack = ({ navigation, route }) => {
  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);
    const tabHiddenRoutes = ["Conversation"];
    if (tabHiddenRoutes.includes(routeName)) {
      navigation.setOptions({
        tabBarStyle: { position: "absolute", display: "none" },
      });
    } else {
      navigation.setOptions({ tabBarStyle: { display: "flex" } });
    }
  });

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={{
          title: "Messages",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CommentPage"
        component={CommentPage}
        options={{
          title: "Commentaires",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="GeneralUserProfile"
        component={GeneralUserProfile}
        options={{
          title: "GeneraluserProfile",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="AccountStats"
        component={AccountStats}
        options={{
          title: "Account Stats",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Conversation"
        component={Conversation}
        options={{
          title: "Conversation",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = ({ navigation, route }) => {
  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route);
    const tabHiddenRoutes = ["CommentPage", "TakePictureProfile"];
    if (tabHiddenRoutes.includes(routeName)) {
      navigation.setOptions({
        tabBarStyle: { position: "absolute", display: "none" },
      });
    } else {
      navigation.setOptions({ tabBarStyle: { display: "flex" } });
    }
  });

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          title: "Profil",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          title: "Modifier Profil",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      {/* <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          title: "Paramètres",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      /> */}
      <Stack.Screen
        name="TakePictureProfile"
        component={TakePictureProfile}
        options={{
          title: "TakePictureProfile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CommentPage"
        component={CommentPage}
        options={{
          title: "Commentaires",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="GeneralUserProfile"
        component={GeneralUserProfile}
        options={{
          title: "GeneraluserProfile",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="AccountStats"
        component={AccountStats}
        options={{
          title: "Account Stats",
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

const Router = () => {
  const { isLoggedin, setIsLoggedIn } = useContext(AuthContext);

  const [checking, setIsChecking] = useState(true);

  const getToken = async () => {
    const token = await AsyncStorage.getItem("@token");
    return token;
  };

  useEffect(() => {
    const checkIfUserIsLoggedIn = async () => {
      const item = await getToken();
      if (item !== null) {
        setIsLoggedIn(true);
      }
      setIsChecking(false);
    };
    checkIfUserIsLoggedIn();
  }, []);

  if (checking) {
    return <ActivityIndicator />;
  } else {
    return (
      <NavigationContainer>
        {isLoggedin ? (
          <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: "white" }}
            screenOptions={{
              tabBarShowLabel: false,
              headerShown: false,
              tabBarActiveTintColor: "#FF6600",
              tabBarInactiveTintColor: "#0C0C0C",
            }}
          >
            <Tab.Screen
              name="HomeStack"
              component={HomeStack}
              options={{
                title: "HomeStack",
                headerShown: false,
                tabBarLabelStyle: {
                  fontWeight: "bold",
                },
                tabBarIcon: (tabInfo) => {
                  return (
                    <Icon.Home
                      width={25}
                      height={25}
                      color={tabInfo.focused ? "#F7941D" : "#0C0C0C"}
                    />
                  );
                },
              }}
            />
            <Tab.Screen
              name="SearchStack"
              component={SearchStack}
              options={{
                title: "SearchStack",
                tabBarIcon: (tabInfo) => {
                  return (
                    <Icon.Search
                      width={25}
                      height={25}
                      color={tabInfo.focused ? "#F7941D" : "#0C0C0C"}
                    />
                  );
                },
              }}
            />
            <Tab.Screen
              name="GateawayStack"
              component={GateawayStack}
              options={{
                tabBarStyle: { display: "none" },
                title: "GateawayStack",
                tabBarIcon: (tabInfo) => {
                  return (
                    <View
                      style={{
                        position: "relative",
                        width: 40,
                        //bottom: 25,
                        height: 40,
                        backgroundColor: "white",
                        //borderColor: "#F7941D",
                        //borderWidth: 1,
                        //borderRadius: 35,
                      }}
                    >
                      <Image
                        style={{ width: 40, height: 40 }}
                        source={require("../assets/TalCS.png")}
                      />
                    </View>
                  );
                },
                headerShown: false,
              }}
            />
            <Tab.Screen
              name="MessagesStack"
              component={MessagesStack}
              options={{
                title: "MessagesStack",
                tabBarIcon: (tabInfo) => {
                  return (
                    <Icon.MessageCircle
                      width={25}
                      height={25}
                      color={tabInfo.focused ? "#F7941D" : "#0C0C0C"}
                    />
                  );
                },
              }}
            />
            <Tab.Screen
              name="ProfileStack"
              component={ProfileStack}
              options={{
                title: "ProfileStack",
                tabBarIcon: (tabInfo) => {
                  return (
                    <Icon.User
                      width={25}
                      height={25}
                      color={tabInfo.focused ? "#F7941D" : "#0C0C0C"}
                    />
                  );
                },
              }}
            />
          </Tab.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                title: "Connexion",
                headerShown: false,
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="Register"
              component={Register}
              options={{
                title: "Inscription",
                headerShown: false,
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="Forgot"
              component={ForgotPassword}
              options={{
                title: "Mot de passe oublié",
                headerShown: false,
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="TakePicture"
              component={TakePicture}
              options={{ title: "TakePicture", headerShown: false }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    );
  }
};

export default Router;
