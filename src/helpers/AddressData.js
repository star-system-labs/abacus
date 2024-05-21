import config from '../configs/config';
import {ethers} from 'ethers';

export const abis = {
  eth: {
    ppepe: require('../abi/eth-ppepe.json'),
    pepe: require('../abi/eth-pepe.json'),
    shib: require('../abi/eth-shib.json'),
  },
};

export function getMyContract(chain, token, provider) {
  return new ethers.Contract(
    config[chain.toUpperCase()][token],
    abis[chain.toLowerCase()][token],
    provider,
  );
}

export async function getBalance({address, provider, contract, noFormat}) {
  try {
    if (address) {
      const balance = contract
        ? await contract.balanceOf(address)
        : await provider.getBalance(address);
      console.log(`balance: ${balance}`);
      if (noFormat) {
        return balance;
      } else {
        return parseFloat(ethers.formatEther(balance)).toFixed(3);
      }
    } else {
      return 0;
    }
  } catch (e) {
    console.log(e);
    return 0;
  }
}

export async function formatBalance({web3, contract, chain, balance}) {
  let sbalance, BN;
  if (chain) {
    let web3Data = await getweb3Data(chain);
    web3 = web3Data.web3;
    contract = web3Data.contract;
  }
  balance = toCustomFixed(balance);
  BN = web3.utils.BN;
  sbalance = web3.utils.fromWei(balance, 'shannon');
  if (sbalance !== '0') {
    let decimals = await contract.methods.decimals().call();
    let decimalPart = sbalance.split('.')[1];
    return (
      (new BN(balance) / Math.pow(10, decimals))
        .toLocaleString()
        .split('.')[0] + (decimalPart ? '.' + decimalPart : '')
    );
  } else {
    return 0;
  }
}

export async function getweb3Data(chain) {
  let provider;
  if (chain === 'ETH') {
    provider = new ethers.InfuraProvider('mainnet'); // or 'mainnet' for mainnet
  } else {
    provider = new ethers.InfuraProvider('rinkeby'); // or 'mainnet' for mainnet
  }
  return provider;
}
