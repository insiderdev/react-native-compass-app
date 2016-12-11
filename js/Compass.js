/**
 * @flow
 */
'use strict';

import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  DeviceEventEmitter,
  Platform
} from 'react-native';

const {
  Magnetometer,
  SensorManager
} = require('NativeModules');

type DailyConfig =  {
  morning: any,
  afternoon: any,
  night: any
};

const gradientColors = {
  morning: ['#ADE8F3', '#67BED4'],
  afternoon: ['#FBE698', '#F4945E'],
  night: ['#727B8A', '#384254']
};

const fillColors = {
  morning: {
    mountains: '#C9F5FF',
    trees: '#78C4D7'
  }
};

class Compass extends React.Component {
  componentDidMount() {
    if (Platform.OS === 'android') {
      SensorManager.startMagnetometer(600000);
      DeviceEventEmitter.addListener('Magnetometer', function (data) {
        const alpha = 0.97;
        let mGeomagnetic = [0, 0, 0];

        mGeomagnetic[0] = alpha * mGeomagnetic[0] + (1 - alpha) * data.x;
        mGeomagnetic[1] = alpha * mGeomagnetic[1] + (1 - alpha) * data.y;
        mGeomagnetic[2] = alpha * mGeomagnetic[2] + (1 - alpha) * data.z;
      });
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      SensorManager.stopMagnetometer();
    }
  }

  _getDailyObject(config: DailyConfig): any {
    const currentHour = (new Date()).getHours();

    if (currentHour > 6 && currentHour < 12) {
      return config.morning;
    }

    if (currentHour > 12 && currentHour < 20) {
      return config.afternoon;
    }

    return config.night;
  }

  getCurrentGradientColors() {
    return this._getDailyObject(gradientColors);
  }

  getCurrentBottomImage() {
    return this._getDailyObject({
      morning: require('./img/bottom_morning.png'),
      afternoon: require('./img/bottom_afternoon.png'),
      night: require('./img/bottom_night.png')
    });
  }


  render() {
    return (
      <LinearGradient
        colors={this.getCurrentGradientColors()}
        style={styles.container}
      >
        <View style={{flex: 1}}>

        </View>

        <View style={{flex: 5, alignItems: 'center', justifyContent: 'flex-start'}}>
          <Image
            source={require('./img/table.png')}
            style={styles.table}
          >
            <Image
              source={require('./img/pointer.png')}
              style={styles.pointer}
            />
          </Image>
        </View>

        <Image
          source={this.getCurrentBottomImage()}
          style={styles.bottomImage}
          />
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  bottomImage: {
    position: 'absolute',
    bottom: 0,
  },
  table: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  pointer: {

  }
});

export default Compass;