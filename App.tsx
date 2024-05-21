import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import {checkAndCreateTable} from './src/helpers/Database';
const App = () => {
  setTimeout(() => checkAndCreateTable(), 1000);
  return <RootNavigator />;
};
export default App;
