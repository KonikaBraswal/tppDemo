/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// import React from 'react';
// import type {PropsWithChildren} from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from 'react-native';
// import {SafeAreaProvider} from 'react-native-safe-area-context';
// import {PaperProvider} from 'react-native-paper';

// import {Colors} from 'react-native/Libraries/NewAppScreen';
// import {NavigationContainer} from '@react-navigation/native';
// import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
// import AppDrawer from './src/components/AppDrawer';
// import BottomTab from './src/components/BottomTab';
// import ConsentScreen from './src/screens/ConsentScreen';
// import SelectBank from './src/components/SelectBank';
// import AccountListScreen from './src/screens/AccountListScreen';
// import TransactionListScreen from './src/screens/TransactionListScreen';

// const Stack = createNativeStackNavigator();
// const Tab = createMaterialBottomTabNavigator();

// function App(): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     flex: 1,
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   return (
//     <PaperProvider>
//       <SafeAreaProvider>
//         <SafeAreaView style={backgroundStyle}>
//           <StatusBar
//             barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//             backgroundColor={backgroundStyle.backgroundColor}
//           />
//           <NavigationContainer>
//             <Stack.Navigator
//               screenOptions={{
//                 headerStyle: {
//                   backgroundColor: '#5a287d',
//                 },
//                 headerTintColor: '#fff',
//                 headerTitleStyle: {
//                   fontWeight: 'bold',
//                   fontSize: 22,
//                 },
//                 headerTitleAlign: 'center',
//               }}>
//               <Stack.Screen
//                 name="Home"
//                 component={AppDrawer}
//                 options={{headerShown: false}}
//               />
//               <Stack.Screen name="Consent" component={ConsentScreen} />
//               <Stack.Screen name="AddBank" component={SelectBank} />
//               <Stack.Screen name="Accounts" component={AccountListScreen} />
//               <Stack.Screen
//                 name="Transactions"
//                 component={TransactionListScreen}
//               />
//             </Stack.Navigator>
//           </NavigationContainer>
//         </SafeAreaView>
//       </SafeAreaProvider>
//     </PaperProvider>
//   );
// }

// export default App;

// App.tsx -------------------------------------KONIKA---------------------------------
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import ApiFactory from './ApiFactory/ApiFactory';
import AccountInfo from './ApiFactory/AccountInfo';

const App: React.FC = () => {
  const apiFactory = new ApiFactory();
  const permissions: string[] = [
    'ReadAccountsDetail',
    'ReadBalances',
    'ReadTransactionsCredits',
    'ReadTransactionsDebits',
    'ReadTransactionsDetail',
  ];

  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [accountData, setAccountData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = async () => {
    try {
      setLoading(true);
      setError(null);

      const sandboxApiClient = apiFactory.createApiClient('sandbox');
      const data = await sandboxApiClient.retrieveAccessToken(permissions);
      console.log('Sandbox API 1 Data:', data);

      // Show modal to get user input
      setModalVisible(true);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to retrieve access token.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const sandboxApiClient = apiFactory.createApiClient('sandbox');
      const start = userInput.indexOf('=') + 1;
      const end = userInput.indexOf('&');
      const authToken = userInput.slice(start, end);

      console.log(authToken);
      const account = await sandboxApiClient.exchangeAccessToken(authToken);

      console.log('Balance:', account);
      setAccountData(account); // Store account data in state
      setModalVisible(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to exchange access token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Fetch Balance</Text>
      <TouchableOpacity onPress={handleButtonClick}>
        <View
          style={{
            backgroundColor: 'blue',
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
          }}>
          <Text style={{color: 'white'}}>Click me</Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View
            style={{backgroundColor: 'white', padding: 20, borderRadius: 10}}>
            <Text>Enter auth code</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 10,
              }}
              onChangeText={text => setUserInput(text)}
              value={userInput}
            />
            <Button title="Submit" onPress={handleSubmit} />
          </View>
        </View>
      </Modal>

      {loading && <ActivityIndicator size="large" color="blue" />}
      {error && <Text style={{color: 'red'}}>{error}</Text>}

      {/* Use the AccountInfo component to display account data */}
      <AccountInfo accountData={accountData} />
    </View>
  );
};

export default App;
