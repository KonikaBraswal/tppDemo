import React from 'react';
import {View, FlatList} from 'react-native';
//import axios from 'axios';
import AccountCard from '../components/AccountCard';

const AccountListScreen = ({route}) => {
  // const [accounts, setAccounts] = useState([]);

  // useEffect(() => {
  //   async function fetchData() {
  //     axios
  //       .get('http://192.168.1.7:3000/Data')
  //       .then(response => setAccounts(response.data.Account))
  //       .catch(error => console.error('Error fetching account data:', error));
  //   }
  //   fetchData();
  // }, []);
  const {accountData} = route.params;

  return (
    <View style={{padding: 10, marginVertical: 8}}>
      <FlatList
        data={accountData.Account}
        keyExtractor={item => item.AccountId}
        renderItem={({item}) => <AccountCard account={item} />}
      />
    </View>
  );
};

export default AccountListScreen;
// json-server --watch ./src/assets/data/accounts.json
