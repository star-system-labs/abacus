import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

function errorCB(err) {
  console.log('SQL Error: ' + err);
}

function successCB() {
  console.log('SQL executed fine');
}

function openCB() {
  console.log('Database OPENED');
}
const db = SQLite.openDatabase(
  'test.db',
  '1.0',
  'Abacus_Database',
  200000,
  openCB,
  errorCB,
); // returns Database object

function checkAndCreateTable() {
  console.log('checkAndCreateTable');
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS addresses (addresses TEXT, balance TEXT, name VARCHAR(30))',
      null,
      function (txObj, resultSet) {
        console.log('Create', resultSet);
        // tx.executeSql(
        //   'ALTER TABLE addresses ADD COLUMN name VARCHAR(30)',
        //   null,
        //   function (txObj, resultSet) {
        //     // console.log("Alter", resultSet)
        //   },
        //   function (txObj, error) {
        //     console.log('Error ', error);
        //   },
        // );
      },
    );
  });
}

async function fetchData(type, callback) {
  let cAdd = await AsyncStorage.getItem('currentAddress');
  db.transaction(tx => {
    // sending 4 arguments in executeSql
    tx.executeSql(
      'SELECT * FROM addresses',
      null,
      async function (txObj, results) {
        const _array = results.rows.raw();
        let i = 1;
        let idx = 0;
        let nameList = _array.map(a => {
          console.log(a);
          if (a.name) {
            return a.name;
          }
        });
        for (let a of _array) {
          if (!a.name) {
            do {
              _array[idx].name = 'LDWallet' + i;
              i++;
            } while (nameList.indexOf(_array[idx].name) > -1);
            await updateName(a.addresses, _array[idx].name);
          }
          idx++;
        }
        if (cAdd && type === 'cache') {
          console.log("cAdd && type === 'cache'");
          let currentData = {
            addresses: cAdd,
            name: '',
          };
          _array.forEach(a => {
            if (a.addresses === cAdd) {
              currentData.name = a.name;
            }
          });
          callback({data: [currentData], cAdd}, null);
          return;
        }
        callback({data: _array, cAdd}, null);
      },
      function (txObj, error) {
        console.log('Error ', error);
        callback(null, error);
      },
    ); // end executeSQL
  }); // end transaction
  // db.transaction(tx => {
  //   tx.executeSql('SELECT * FROM addresses', [], (tx, results) => {
  //     console.log('Query completed');

  //     // Get rows with Web SQL Database spec compliance.

  //     var len = results.rows.length;
  //     console.log(results.rows);
  //     for (let i = 0; i < len; i++) {
  //       let row = results.rows.item(i);
  //       console.log(`Employee name: ${row.name}, Dept Name: ${row.deptName}`);
  //     }

  //     // Alternatively, you can use the non-standard raw method.

  //     /*
  //         let rows = results.rows.raw(); // shallow copy of rows Array

  //         rows.map(row => console.log(`Employee name: ${row.name}, Dept Name: ${row.deptName}`));
  //       */
  //   });
  // });
}

async function addAddress(address, name, callback) {
  const asyncStorageKeys = await AsyncStorage.getAllKeys();
  let currentChain = await AsyncStorage.getItem('currentChain');
  if (asyncStorageKeys.length > 0) {
    await AsyncStorage.clear();
    if (currentChain) {
      await AsyncStorage.setItem('currentChain', currentChain);
    }
  }
  console.log(address);
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM addresses where addresses=?',
      [address],
      function (txObj, {rows: {_array}}) {
        console.log(_array, txObj);
        if (!_array || !_array.length) {
          tx.executeSql(
            'INSERT INTO addresses (addresses, name, balance) values (?, ?, ?)',
            [address, name, 0],
            function (txObj, resultSet) {
              console.log('insert');
              console.log(resultSet, txObj);
              callback(resultSet, null);
              // this.setState({
              //   data: this.state.data.concat(
              //     {id: resultSet.insertId, text: 'gibberish', count: 0})
              // })
            },
            function (txObj, error) {
              console.log('Error', error);
              callback(null, error);
            },
          );
        } else {
          callback(null, 'Address already exist');
        }
      },
      function (txObj, error) {
        console.log('Error ', error);
        callback(null, error);
      },
    );
  });
}

async function deleteAddress(address, callback) {
  const asyncStorageKeys = await AsyncStorage.getAllKeys();
  let currentChain = await AsyncStorage.getItem('currentChain');
  if (asyncStorageKeys.length > 0) {
    await AsyncStorage.clear();
    if (currentChain) {
      await AsyncStorage.setItem('currentChain', currentChain);
    }
  }
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM addresses WHERE addresses = ? ',
      [address],
      (txObj, resultSet) => {
        if (resultSet.rowsAffected > 0) {
          callback(true);
        }
      },
      function (txObj, error) {
        console.log('Error ', error);
        callback(false);
      },
    );
  });
}

async function updateAddress(address, balance) {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE addresses SET balance = ? WHERE addresses = ?',
      [balance, address],
      (txObj, resultSet) => {
        if (resultSet.rowsAffected > 0) {
          let newList = this.state.data.map(data => {
            if (data.id === id) return {...data, count: data.count + 1};
            else return data;
          });
          this.setState({data: newList});
        }
      },
    );
  });
}

async function updateName(address, name) {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE addresses SET name = ? WHERE addresses = ?',
      [name, address],
      (txObj, resultSet) => {
        return;
      },
    );
  });
}

export {
  fetchData,
  checkAndCreateTable,
  addAddress,
  deleteAddress,
  updateAddress,
};
