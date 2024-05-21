// import {ApolloClient, HttpLink, InMemoryCache} from "@apollo/client/core";
import fetch from "cross-fetch";

export async function wrapperFunction (func){
  return await func.apply(this, Array.prototype.slice.call(arguments, 1));
}

export async function dispatch(fn, args) {
  fn = (typeof fn == "function") ? fn : window[fn];  // Allow fn to be a function object or the name of a global function
  return await fn.apply(this, args || []);  // args is optional, use an empty array by default
}

// export const client = (uri) => new ApolloClient({
//   link: new HttpLink({
//     fetch,
//     uri
//   }),
//   cache: new InMemoryCache(),
// });

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function getArrayMax(array) {
  return Math.max.apply(null, array);
}

function getArrayMin(array) {
  return Math.min.apply(null, array);
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export async function formatChartYLabels(chartData) {
  let maxx = getArrayMax(chartData.datasets[0].data)
  let minn = getArrayMin(chartData.datasets[0].data)
  let diffv = (maxx - minn) / 4.0
  let newA = [minn]
  newA.push(minn + diffv)
  newA.push(minn + 2 * diffv)
  newA.push(minn + 3 * diffv)
  newA.push(maxx)

  if (maxx < 0.000001) {
    let zeroct = 0
    let nonZero = false
    maxx.toFixed(15).substring(3,).split("").map(m => {
      if (m === "0" && !nonZero) {
        zeroct++
      } else {
        nonZero = true
      }
    })
    newA = newA.map(na => na.toFixed(15).substring(0, 3) + "..." + na.toFixed(15).substring(2 + zeroct, 7 + zeroct))
  } else if (maxx > 1) {
    newA = newA.map(na => na.toFixed(2))
  } else {
    newA = newA.map(na => na.toFixed(5))
  }
  return newA
}

export async function formatChartXLabels(labels) {
  let newLabels = []
  if(labels.length) {
    let ct = Math.ceil(labels.length/10)
    labels.map((l, i) => {
      if(i%ct === 0 && labels.length - i > ct/2) {
        newLabels.push(l)
      } else {
        newLabels.push("")
      }
    })
  }
  newLabels[labels.length-1] = labels[labels.length-1]
  return newLabels
}
