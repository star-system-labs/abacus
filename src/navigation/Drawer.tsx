import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

//screens import
import MainScreen from '../screens/MainScreen';
import AddressScreen from '../screens/AddressScreen';

const DrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator screenOptions={{headerShown: false}}>
      {/* Drawer Screens here */}
      <Drawer.Screen name="Home" component={MainScreen} />
      <Drawer.Screen name="Address" component={AddressScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
