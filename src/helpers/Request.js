// const fetch = require('fetch');

export async function fetchData({url, apikey, params}) {
  let headers = {'Content-Type': 'application/json'};
  if (apikey) {
    headers['X-API-KEY'] = apikey;
  }
  const opts = {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  };
  try {
    let response = await fetch(url, opts);
    let data = await response.json();
    return data.data;
  } catch (error) {
    console.log(error);
    console.log('ERROR from BitQuery', error);
    return 0;
  }
}

export async function fetchAPIData({url, params, type}) {
  const opts = {
    method: 'GET',
  };
  try {
    let response = await fetch(url);
    if (type === 'html') {
      return await response.text();
    }
    return await response.json();
  } catch (e) {
    return null;
  }
}
