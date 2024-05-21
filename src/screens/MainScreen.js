/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeBaseProvider} from 'native-base';
import {Card, Header, Text, Icon, ButtonGroup} from 'react-native-elements';
import {TextStroke} from '../helpers/TextStroke';
import LinearGradient from 'react-native-linear-gradient';

let colors = require('../configs/colors.json');
import {fetchData} from '../helpers/Database';
import {getBalance, getweb3Data, getMyContract} from '../helpers/AddressData';
import {
  getMC,
  getTokenPrice,
  getTotalSupply,
  getUniswapRouterContract,
} from '../helpers/TokenData';
import {ethers} from 'ethers';

const data = {
  labels: [],
  datasets: [
    {
      data: [],
    },
  ],
};

const timeFilters = {
  Recent: 'recent',
  '1 day': 1,
  '1 week': 7,
  '2 weeks': 14,
  '1 month': 30,
  All: 'history',
};

const MainScreen = ({navigation}) => {
  const [addressList, setAddressList] = useState([]);
  const [balance, setBalance] = useState({
    ppepe: 0,
    pepe: 0,
    shib: 0,
  });
  const [currentChain, setCurrentChain] = useState('ETH');
  const [tokenVolume24h, setTokenVolume24h] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [marketCap, setMarketCap] = useState(0);
  const [gwei, setGwei] = useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [holders, setHolders] = React.useState(null);
  const [rank, setRank] = React.useState(1);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [walletName, setWalletName] = React.useState(null);
  async () => await AsyncStorage.setItem('currentChain', 'ETH');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getData(null, null).then((res, err) => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    console.log(currentChain);
    getData(currentChain, Object.values(timeFilters)[selectedIndex]).then(
      (res, err) => {},
    );
    const interval = setInterval(() => {
      getData(currentChain, Object.values(timeFilters)[selectedIndex]).then(
        (res, err) => {},
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  async function onNavigate() {
    await getData('', '');
  }

  async function getData(chain, type) {
    console.log('getdata');
    if (!chain) {
      chain = await AsyncStorage.getItem('currentChain');
      console.log(chain);
      if (!chain) {
        await AsyncStorage.setItem('currentChain', currentChain);
        chain = currentChain;
      }
    }
    if (!type) {
      let typeIdx = await AsyncStorage.getItem('selectedIdx');
      if (!typeIdx) {
        await AsyncStorage.setItem('selectedIdx', selectedIndex.toString());
        typeIdx = selectedIndex;
      }
      type = Object.values(timeFilters)[typeIdx];
    }

    await fetchData('cache', async function (result, err) {
      let res = result.data;
      console.log(chain, type, res[0].addresses);
      setWalletName(res[0] ? res[0].name : 'Dashboard');
      setAddressList(res);
      let provider;
      try {
        provider = await getweb3Data(chain);
      } catch (e) {
        console.log(e);
      }

      let [ppepeBalance, pepeBalance, shibBalance] = await Promise.all([
        getBalance({
          address: res[0] ? res[0].addresses : null,
          provider,
          contract: getMyContract(chain, 'ppepe', provider),
        }),
        getBalance({
          address: res[0] ? res[0].addresses : null,
          provider,
          contract: getMyContract(chain, 'pepe', provider),
        }),
        getBalance({
          address: res[0] ? res[0].addresses : null,
          provider,
          contract: getMyContract(chain, 'shib', provider),
        }),
      ]);
      let contract = await getUniswapRouterContract(provider);
      let price = await getTokenPrice(chain, 'ppepe', contract);
      let totalSupply = await getTotalSupply(
        getMyContract(chain, 'ppepe', provider),
      );
      console.log(Number(totalSupply));
      console.log(parseFloat(price));
      setMarketCap(
        new Intl.NumberFormat('en-US', {notation: 'compact'}).format(
          ethers.formatEther(totalSupply) * parseFloat(price),
        ),
      );

      let allbalance = 0;
      console.log(allbalance);
      setBalance({ppepe: ppepeBalance, pepe: pepeBalance, shib: shibBalance});
      setTokenPrice(price);
      setRank(null);

      if (allbalance) {
        setTotalValue(0);
      } else {
        setTotalValue(0);
      }
    });
  }

  // async function updateChart(cIdx, chain) {
  //   setSelectedIndex(cIdx);
  //   await AsyncStorage.setItem('selectedIdx', cIdx.toString());
  //   await getData(chain, Object.values(timeFilters)[cIdx]);
  // }

  async function toggleChain(chain, cIdx) {
    setCurrentChain(chain);
    await AsyncStorage.setItem('currentChain', chain);
    getData(chain, Object.values(timeFilters)[cIdx]).then((res, err) => {});
  }

  return (
    <NativeBaseProvider>
      <Header
        containerStyle={styles.header}
        ViewComponent={LinearGradient}
        linearGradientProps={{
          colors: colors.headerGradient,
          start: {x: 0, y: 0},
          end: {x: 1, y: 0},
        }}
        leftComponent={<MyComponent />}
        rightComponent={{
          icon: 'menu',
          color: '#fff',
          size: 40,
          style: {marginTop: 6},
          onPress: () => navigation.toggleDrawer(),
        }}
      />
      <View style={styles.SafeAreaViewContainer}>
        <StatusBar
          backgroundColor={colors.statusBar}
          barStyle="light-content"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              paddingTop: 10,
              paddingHorizontal: 30,
            }}>
            {rank ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Icon
                  name="medal-outline"
                  type="material-community"
                  size={20}
                />
                <Text
                  style={{
                    color: colors.cardText,
                    fontSize: 16,
                    paddingHorizontal: 2,
                    fontWeight: 'bold',
                  }}>
                  Rank: {rank}
                </Text>
              </View>
            ) : null}
            <View style={{flexGrow: 1}} />
            <View style={{display: 'flex', flexDirection: 'row'}}>
              <Text
                onPress={() => toggleChain('ETH', selectedIndex)}
                style={[
                  styles.chainText,
                  currentChain === 'ETH' ? styles.selectedChain : '',
                ]}>
                ETH
              </Text>
              <Text>&nbsp;|&nbsp;</Text>
              <Text
                onPress={() => toggleChain('BSC', selectedIndex)}
                style={[
                  styles.chainText,
                  currentChain === 'BSC' ? styles.selectedChain : '',
                ]}>
                BSC
              </Text>
            </View>
          </View>
          <Card containerStyle={styles.card}>
            <View style={styles.cardView}>
              <LinearGradient
                colors={colors.headerGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <View style={styles.multiCardTitleView}>
                  <Text
                    style={{
                      ...styles.multiCardTitleText,
                      color: colors.cardTitle,
                      paddingTop: 0,
                    }}>
                    {walletName}
                  </Text>
                  <View style={{flexGrow: 1}} />
                  {holders ? (
                    <View style={{display: 'flex', flexDirection: 'column'}}>
                      <Text
                        style={{
                          color: colors.start,
                          marginRight: 25,
                        }}>
                        Holders
                      </Text>
                      <Text
                        style={{
                          textAlign: 'right',
                          color: colors.start,
                          marginRight: 25,
                          fontSize: 22,
                          fontWeight: 'bold',
                        }}>
                        {holders}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </LinearGradient>
            </View>
            <LinearGradient
              colors={colors.cardGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <View style={styles.cardBodyView}>
                <Text style={styles.name}>PPEPE balance</Text>
                <Text style={styles.value} numberOfLines={1}>
                  {balance.ppepe}
                </Text>
                <Text style={styles.name}>PEPE balance</Text>
                <Text style={styles.value} numberOfLines={1}>
                  {balance.pepe}
                </Text>
                <Text style={styles.name}>SHIB balance</Text>
                <Text style={styles.value} numberOfLines={1}>
                  {balance.shib}
                </Text>
                {/* <Text style={styles.name}>Total Rewards</Text>
                <TextStroke stroke={0.5} color={colors.cardText}>
                  <Text style={styles.specialValue} numberOfLines={1}>
                    {rewards}
                  </Text>
                </TextStroke> */}
                {/* <Text style={styles.name}>Total Value</Text>
                <TextStroke stroke={0.5} color={colors.cardText}>
                  <Text style={styles.specialValue}>${totalValue}</Text>
                </TextStroke> */}
                {/* <Text style={styles.name}>Tokens Burnt</Text>
                <Text style={styles.value} numberOfLines={1}>
                  {burnBalance}
                </Text> */}
              </View>
            </LinearGradient>
          </Card>

          <Card containerStyle={styles.card}>
            <View style={styles.cardView}>
              <LinearGradient
                colors={colors.headerGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <View style={styles.multiCardTitleView}>
                  <Text style={{...styles.multiCardTitleText, paddingTop: 0}}>
                    Market Data
                  </Text>
                  <View style={{flexGrow: 1}} />
                  <View style={{display: 'flex', flexDirection: 'column'}}>
                    <Text
                      style={{
                        color: colors.start,
                        marginRight: 25,
                      }}>
                      Average Gwei
                    </Text>
                    <Text
                      style={{
                        textAlign: 'right',
                        color: colors.start,
                        marginRight: 25,
                        fontSize: 22,
                        fontWeight: 'bold',
                      }}>
                      {gwei}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
            <LinearGradient
              colors={colors.cardGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <View style={{...styles.cardBodyView, marginBottom: 25}}>
                <Text style={styles.name}>Market Cap</Text>
                <Text style={styles.value}>${marketCap}</Text>
                <Text style={styles.name}>24h Volume</Text>
                <Text style={styles.value}>${tokenVolume24h}</Text>
                <Text style={styles.name}>Current Price</Text>
                <TextStroke stroke={0.5} color={colors.cardTitle}>
                  <Text style={styles.specialValue}>${tokenPrice}</Text>
                </TextStroke>
              </View>
            </LinearGradient>
          </Card>
        </ScrollView>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.touchableOpacityStyle}>
        <Icon
          color={colors.cardText}
          raised
          reverse
          containerStyle={{}}
          disabledStyle={{}}
          iconProps={{}}
          iconStyle={{}}
          name="wallet"
          onLongPress={() => console.log('onLongPress()')}
          onPress={() => navigation.navigate('Address', {onNav: onNavigate})}
          size={25}
          type="material-community"
        />
      </TouchableOpacity>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    // height: Dimensions.get('window').height * 2
  },
  container1: {
    flex: 1,
    padding: 20,
  },
  header: {
    textAlign: 'left',
  },
  card: {
    padding: 0,
    borderWidth: 0,
    borderRadius: 20,
  },
  cardTitle: {
    paddingTop: 10,
    marginLeft: 15,
    textAlign: 'left',
    fontSize: 24,
    fontWeight: 'normal',
  },
  multiCardTitleView: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
  },
  multiCardTitleText: {
    marginTop: 6,
    marginLeft: 15,
    textAlign: 'left',
    fontSize: 24,
    fontWeight: 'normal',
  },
  cardView: {
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardBodyView: {
    position: 'relative',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 20,
  },
  name: {
    marginTop: 5,
    marginBottom: 3,
    color: colors.cardText,
  },
  value: {
    fontSize: 21,
    fontWeight: 'bold',
    color: colors.cardText,
  },
  specialValue: {
    fontSize: 21,
    fontWeight: 'bold',
    color: colors.specialValue,
  },
  touchableOpacityStyle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
  },
  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
  },
  chartView: {
    marginTop: 20,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  chainText: {
    padding: 2,
    fontSize: 13,
  },
  selectedChain: {
    backgroundColor: colors.cardText,
    color: 'white',
  },
  SafeAreaViewContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

function MyComponent(props) {
  return (
    <View style={{display: 'flex', flexDirection: 'row'}}>
      <Image
        source={require('../../assets/abacus_logo.jpeg')}
        accessibilityLabel={'Logo'}
        style={{
          height: 45,
          width: 45,
          marginRight: 10,
          marginTop: 6,
        }}
      />
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 6,
          width: '150%',
        }}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 20,
            color: colors.cardTitle,
          }}>
          Abacus
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: colors.cardTitle,
            fontWeight: '300',
          }}>
          Track
        </Text>
      </View>
    </View>
  );
}

export default MainScreen;
