// import {fetchAPIData, fetchData} from "./Request";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../configs/config.json';
import Moment from 'moment';
import {delay, formatChartYLabels, formatChartXLabels} from './Utils';
import abi from '../abi/uniswap-router-v3.json';
import {ethers} from 'ethers';

export async function getHolders(chain) {
  let url = 'http://206.189.198.227:2000';
  // let resp = await fetchAPIData({
  //   url
  // })
  // return resp && resp.find(r => r.chain === chain).holders || null
  return null;
}

async function _getPrice(contract, path, decimal) {
  const amountIn = ethers.parseUnits('1', 18);
  const amounts = await contract.getAmountsOut(amountIn, path);
  const price = ethers.formatUnits(amounts[1].toString(), decimal);
  return price;
}

export async function getTokenPrice(chain, token, contract) {
  try {
    const [tokenPriceInETH, ETHPriceInUSD] = await Promise.all([
      _getPrice(
        contract,
        ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', config[chain][token]],
        18,
      ),
      _getPrice(
        contract,
        [
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        ],
        6,
      ),
    ]);
    return (ETHPriceInUSD / tokenPriceInETH).toFixed(15);
  } catch (e) {
    console.log('ERRRROORRRRRR');
    console.log(e);
  }
}

export async function getTotalSupply(contract) {
  console.log('mc');
  try {
    return await contract.totalSupply();
  } catch (e) {
    console.log(e);
  }
}

export function getUniswapRouterContract(provider) {
  return new ethers.Contract(
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    abi,
    provider,
  );
}

export async function getTotalData(chain, type) {
  let chartDataCache = JSON.parse(await AsyncStorage.getItem('totaldata'));
  let timeDiff = chartDataCache
    ? new Date().getTime() - chartDataCache.timestamp
    : undefined;
  if (
    timeDiff === undefined ||
    timeDiff / (1000 * 60) > chartDataCache.duration
  ) {
    console.log('Total Data from Fetching - ' + chain);
    // let data = await fetchData({
    //   url: "https://graphql.bitquery.io/",
    //   params: {
    //     "variables": {
    //       "from": Moment().subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ssZ"),
    //       "from2": Moment().subtract(2, 'days').format("YYYY-MM-DDTHH:mm:ssZ"),
    //       "till": Moment().format("YYYY-MM-DD"),
    //       "baseAddress": config.token.contractAddress
    //     },
    //     "query": `query ($from: ISO8601DateTime!, $from2: ISO8601DateTime!, $baseAddress: String!){
    //     bsc: ethereum(network: bsc) {
    //       price: dexTrades(
    //         baseCurrency: {is: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"}
    //         quoteCurrency: {is: "0x55d398326f99059ff775485246999027b3197955"}
    //       ) {
    //         quotePrice
    //       }
    //       tokenPrice: dexTrades(
    //        options: {desc: ["block.height","tradeIndex"], limit: 1}
    //         exchangeName: {in: ["Pancake", "Pancake v1", "Pancake v2"]}
    //         baseCurrency: {is: $baseAddress}
    //         quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
    //       ) {
    //         tradeIndex
    //         block {
    //           height
    //         }
    //         baseAmount
    //         quoteAmount(in: USD)
    //       }
    //       volume: dexTrades(
    //         baseCurrency: {is: $baseAddress}
    //         time: {since: $from}
    //       ) {
    //         count
    //         gasPrice
    //         tradeAmount(in: USD)
    //       }
    //       recent: dexTrades(
    //         options: {limit: 1000, asc: "timeInterval.minute"}
    //         date: {since: $from2}
    //         exchangeName: {in: ["Pancake", "Pancake v1", "Pancake v2"]}
    //         baseCurrency: {is: $baseAddress}
    //         quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
    //       ) {
    //         timeInterval {
    //           minute(count: 1)
    //         }
    //         quoteCurrency {
    //           symbol
    //         }
    //         baseAmount
    //         quoteAmount(in: USD)
    //         quotePrice
    //         close_price: maximum(of: block, get: quote_price)
    //       }
    //       history: dexTrades(
    //         options: {limit: 4000, asc: "timeInterval.minute"}
    //         date: {since: "2021-01-01"}
    //         exchangeName: {in: ["Pancake", "Pancake v1", "Pancake v2"]}
    //         baseCurrency: {is: $baseAddress}
    //         quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
    //       ) {
    //         timeInterval {
    //           minute(count: 70)
    //         }
    //         quoteCurrency {
    //           symbol
    //         }
    //         baseAmount
    //         quoteAmount(in: USD)
    //         quotePrice
    //         close_price: maximum(of: block, get: quote_price)
    //       }
    //     }

    //     eth: ethereum(network: ethereum) {
    //       price: dexTrades(
    //         options: {limit: 1, desc: "timeInterval.minute"}
    //         exchangeName: {is: "Uniswap"},
    //         baseCurrency: {is: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"},
    //         quoteCurrency: {is: "0xdac17f958d2ee523a2206206994597c13d831ec7"}) {
    //         timeInterval{
    //           minute
    //         }
    //         quotePrice
    //       }
    //       tokenPrice: dexTrades(
    //         options: {desc: ["block.height", "tradeIndex"], limit: 1}
    //         baseCurrency: {is: $baseAddress}
    //         quoteCurrency: {is: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"}
    //       ) {
    //         tradeIndex
    //         block {
    //           height
    //         }
    //         baseAmount
    //         quoteAmount(in: USD)
    //       }
    //       volume: dexTrades(
    //         baseCurrency: {is: $baseAddress}
    //         time: {since: $from}
    //       ) {
    //         count
    //         gasPrice
    //         tradeAmount(in: USD)
    //       }
    //       history: dexTrades(
    //         options: {limit: 4000, asc: "timeInterval.minute"}
    //         date: {since: "2021-01-01"}
    //         exchangeName: {is: "Uniswap"}
    //         baseCurrency: {is: $baseAddress}
    //         quoteCurrency: {is: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"}
    //       ) {
    //         timeInterval {
    //           minute(count: 70)
    //         }
    //         baseCurrency {
    //           symbol
    //         }
    //         quoteCurrency {
    //           symbol
    //         }
    //         baseAmount
    //         quoteAmount(in: USD)
    //         quotePrice
    //       }
    //       recent: dexTrades(
    //         options: {limit: 1000, asc: "timeInterval.minute"}
    //         date: {since: $from2}
    //         exchangeName: {is: "Uniswap"}
    //         baseCurrency: {is: $baseAddress}
    //         quoteCurrency: {is: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"}
    //       ) {
    //         timeInterval {
    //           minute(count: 1)
    //         }
    //         quoteCurrency {
    //           symbol
    //         }
    //         baseAmount
    //         quoteAmount(in: USD)
    //         quotePrice
    //         close_price: maximum(of: block, get: quote_price)
    //       }
    //     }
    //   }`
    //   }
    // })
    let data = null;

    if (data) {
      return await formatData(data, chain, type);
    } else {
      await delay(1000);
      return await getTotalData(chain);
    }
  } else {
    console.log('Total Data from Cache - ' + chain);
    let data = await AsyncStorage.getItem('totaldata');
    return await formatData(JSON.parse(data), chain, type);
  }
}

async function formatData(data, chain, type) {
  let completeData = {
    price: 0,
    volume: 0,
    gasPrice: 0,
    chartData: {},
  };
  let dateTime;
  if (type !== 'recent' && type !== 'history') {
    dateTime = Moment().subtract(type, 'days').format('YYYY-MM-DD HH:mm:ss');
    type = 'history';
  }
  completeData.price = (
    data[chain.toLowerCase()].tokenPrice[0].quoteAmount /
    data[chain.toLowerCase()].tokenPrice[0].baseAmount
  ).toFixed(15);
  completeData.volume = data[chain.toLowerCase()].volume[0].tradeAmount;
  completeData.gasPrice = (
    data[chain.toLowerCase()].volume[0].gasPrice /
    data[chain.toLowerCase()].volume[0].count
  ).toFixed();
  completeData.chartData = await cleanChartData(
    data[chain.toLowerCase()][type],
    data[chain.toLowerCase()].price[0].quotePrice,
    dateTime,
  );
  data['timestamp'] = new Date().getTime();
  data['duration'] = 5;
  await AsyncStorage.setItem('totaldata', JSON.stringify(data));
  return completeData;
}

async function cleanChartData(datapoints, price, dateTime) {
  let prevPrice;
  let removefirst = 0;
  if (dateTime) {
    datapoints = datapoints.filter(dp => dp.timeInterval.minute >= dateTime);
  }
  let chartData = {
    labels: datapoints.map(ph => {
      return Moment(ph.timeInterval.minute).format('D/M HH:mm');
    }),
    datasets: [
      {
        data: datapoints.map(ph => {
          if (ph.quotePrice === '0') {
            if (prevPrice) {
              return prevPrice;
            }
            removefirst = 1;
            return 0;
          }
          prevPrice = ph.quoteAmount / ph.baseAmount;
          return prevPrice;
        }),
      },
    ],
  };

  if (removefirst) {
    chartData.labels.shift();
    chartData.datasets[0].data.shift();
  }

  chartData.labels = await formatChartXLabels(chartData.labels);
  return {
    chart: chartData,
    labels: await formatChartYLabels(chartData),
  };
}
