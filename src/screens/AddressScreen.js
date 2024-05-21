/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
import {
  ListItem,
  Avatar,
  Text,
  Header,
  Icon,
  Input,
  Button,
} from 'react-native-elements';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Container, Content, NativeBaseProvider} from 'native-base';
import coinAddressValidator from 'coin-address-validator';
import Swipeout from 'react-native-swipeout';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

let colors = require('../configs/colors.json');
import {addAddress, fetchData, deleteAddress} from '../helpers/Database';
import RadioButton from '../helpers/RadioButton';

const AddressScreen = ({navigation}) => {
  const [copiedText, setCopiedText] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [isValidName, setIsValidName] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [currentAddress, setCurrentAddress] = useState(null);
  const walletNameRef = useRef(null);
  const [text, setText] = useState('');

  useEffect(() => {
    // write your code here, it's like componentWillMount
    fetchData('db', function (res, err) {
      makeData(res).then();
    });
  }, []);

  async function makeData(result) {
    let res = result.data;
    if (res.length) {
      if (!result.cAdd) {
        await AsyncStorage.setItem('currentAddress', res[0].addresses);
        setCurrentAddress(res[0].addresses);
      } else {
        setCurrentAddress(result.cAdd);
      }
      setAddressList(res);
    }
  }

  const pasteContent = async () => {
    const text = await Clipboard.getString();
    setIsValidAddress(coinAddressValidator.validate(text, 'eth', 'prod'));
    setCopiedText(text);
  };

  async function submitAddress(address, name) {
    if (isValidAddress) {
      // && isValidName) {
      setCopiedText(null);
      setShowAddInput(false);
      await addAddress(address, name, async function (res, err) {
        await fetchData('db', async function (res, err) {
          await makeData(res).then();
        });
      });
    }
  }

  async function submitDeleteAddress(address) {
    await deleteAddress(address, async function (res) {
      let newList = addressList.filter(data => {
        return data.addresses !== address;
      });
      setAddressList(newList);
      setCurrentAddress(null);
      await fetchData('db', async function (res, err) {
        await makeData(res).then();
      });
    });
  }

  function _renderInput() {
    if (showAddInput) {
      return (
        <ListItem
          Component={TouchableHighlight}
          containerStyle={{backgroundColor: '#E6F4ED'}}
          pad={20}>
          <ListItem.Content>
            <ListItem.Title>
              {/*<Input*/}
              {/*  containerStyle={{*/}
              {/*    width: Dimensions.get('window').width * 0.9*/}
              {/*  }}*/}
              {/*  autoFocus={true}*/}
              {/*  value={walletName}*/}
              {/*  onChangeText={(text) => {*/}
              {/*    walletNameRef.current.focus()*/}
              {/*    setIsValidName(text.length > 0 && text.length <= 10)*/}
              {/*    setWalletName(text)*/}
              {/*  }}*/}
              {/*  disabledInputStyle={{background: "#ddd"}}*/}
              {/*  errorMessage={isValidName ? "" : "Please enter Wallet name (max 10 characters)"}*/}
              {/*  errorStyle={{color: colors.cardTitle}}*/}
              {/*  leftIcon={<Icon name="wallet" type="material-community" size={20}/>}*/}
              {/*  leftIconContainerStyle={{}}*/}
              {/*  rightIconContainerStyle={{}}*/}
              {/*  placeholder="Enter Wallet name"*/}
              {/*  ref={walletNameRef}*/}
              {/*/>*/}
              <Input
                containerStyle={{
                  width: Dimensions.get('window').width * 0.9,
                }}
                value={copiedText}
                onChangeText={text => {
                  setIsValidAddress(
                    coinAddressValidator.validate(text, 'eth', 'prod'),
                  );
                  setCopiedText(text);
                }}
                disabledInputStyle={{background: '#fff'}}
                errorMessage={
                  isValidAddress ? '' : 'Please enter valid address'
                }
                errorStyle={{color: colors.header}}
                leftIcon={
                  <Icon name="wallet" type="material-community" size={20} />
                }
                leftIconContainerStyle={{}}
                rightIcon={
                  <Icon
                    name="content-paste"
                    size={20}
                    onPress={() => pasteContent()}
                  />
                }
                rightIconContainerStyle={{}}
                placeholder="Enter Address"
              />
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Button
                  accessibilityLabel="Add"
                  buttonStyle={{
                    width: 80,
                    backgroundColor: colors.specialValue,
                  }}
                  containerStyle={{margin: 5}}
                  linearGradientProps={null}
                  icon={<Icon name="add" size={20} color={colors.cardText} />}
                  iconContainerStyle={{background: '#000'}}
                  loadingProps={{animating: true}}
                  onPress={() => submitAddress(copiedText, walletName)}
                  title="Add"
                  titleProps={{}}
                  titleStyle={{
                    marginHorizontal: 2,
                    fontSize: 16,
                    color: colors.cardText,
                  }}
                />
                <Button
                  accessibilityLabel="Cancel"
                  buttonStyle={{width: 80, backgroundColor: colors.cardText}}
                  containerStyle={{margin: 5}}
                  linearGradientProps={null}
                  icon={
                    <Icon
                      name="window-close"
                      type="material-community"
                      size={15}
                      color="#FFF"
                    />
                  }
                  iconContainerStyle={{background: colors.cardText}}
                  loadingProps={{animating: true}}
                  loadingStyle={{}}
                  onPress={() => setShowAddInput(false)}
                  title="Cancel"
                  titleProps={{}}
                  titleStyle={{marginHorizontal: 2, fontSize: 16}}
                />
              </View>
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      );
    } else if (addressList) {
      return (
        <ListItem
          Component={TouchableHighlight}
          containerStyle={{backgroundColor: '#E6F4ED'}}
          onPress={() => setShowAddInput(true)}
          pad={20}>
          <Avatar
            icon={{
              name: 'add',
              type: 'material',
              color: colors.cardText,
              size: 30,
            }}
          />
          <ListItem.Content>
            <ListItem.Title>
              <Text>Add new Address</Text>
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      );
    } else {
      return null;
    }
  }

  return (
    <NativeBaseProvider style={styles.container}>
      <Header
        containerStyle={styles.header}
        ViewComponent={LinearGradient}
        linearGradientProps={{
          colors: colors.headerGradient,
          start: {x: 0, y: 0},
          end: {x: 1, y: 0},
        }}
        leftComponent={{
          icon: 'keyboard-backspace',
          color: colors.cardTitle,
          size: 40,
          onPress: () => {
            navigation.navigate('Home');
            // navigation.state.params.onNav();
          },
        }}
        // rightComponent={{
        //   icon: 'add', color: '#fff', size: 40,
        //   onPress: () => navigation.toggleDrawer()
        // }}
      />
      <SafeAreaView style={styles.SafeAreaViewContainer}>
        <StatusBar
          backgroundColor={colors.statusBar}
          barStyle="light-content"
        />
        {addressList.map((adr, index) => {
          return (
            <Swipeout
              key={index.toString() + 'sw'}
              right={[
                {
                  text: 'Delete',
                  backgroundColor: colors.cardText,
                  underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
                  onPress: () => {
                    submitDeleteAddress(adr.addresses);
                  },
                },
              ]}
              autoClose="true"
              backgroundColor="transparent">
              <ListItem
                key={index.toString() + 'li'}
                Component={TouchableHighlight}
                containerStyle={{backgroundColor: '#E6F4ED'}}
                disabledStyle={{opacity: 0.5}}
                onPress={async () => {
                  await AsyncStorage.setItem('currentAddress', adr.addresses);
                  setCurrentAddress(adr.addresses);
                }}
                pad={20}>
                <Avatar
                  key={index.toString() + 'av'}
                  icon={{
                    name: 'currency-usd',
                    type: 'material-community',
                  }}
                  containerStyle={{
                    backgroundColor: colors.cardText,
                    borderRadius: 50,
                  }}
                />
                <ListItem.Content key={index.toString() + 'lic'}>
                  <ListItem.Title
                    numberOfLines={1}
                    key={index.toString() + 'lit'}
                    style={{marginRight: 50}}>
                    <Text>{adr.addresses}</Text>
                  </ListItem.Title>
                  <ListItem.Subtitle>
                    <Text style={{color: colors.cardText}}>{adr.name}</Text>
                  </ListItem.Subtitle>
                  <TouchableOpacity
                    key={index.toString() + 'top'}
                    style={styles.radioCircle}
                    onPress={() => {
                      setCurrentAddress(adr.addresses);
                    }}>
                    {currentAddress === adr.addresses && (
                      <View style={styles.selectedRb} />
                    )}
                  </TouchableOpacity>
                </ListItem.Content>
              </ListItem>
            </Swipeout>
          );
        })}

        {_renderInput()}
      </SafeAreaView>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  container1: {
    flex: 1,
    padding: 20,
  },
  header: {
    textAlign: 'left',
  },
  radioText: {
    marginRight: 35,
    fontSize: 18,
  },
  radioCircle: {
    height: 30,
    width: 30,
    borderRadius: 100,
    marginRight: 10,
    borderWidth: 2,
    borderColor: colors.cardText,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  selectedRb: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: colors.cardText,
  },
  SafeAreaViewContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default AddressScreen;
