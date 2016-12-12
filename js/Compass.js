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
  Platform,
  NativeModules,
  Text,
  StatusBar
} from 'react-native';

type DailyConfig =  {
  morning: any,
  afternoon: any,
  night: any
};

type AzimuthEvent = {
  newAzimuth: Number
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
  currentAzimuth = 0;
  interval = null;

  constructor(props) {
    super(props);

    this.state = {
      azimuth: 0
    }
  }

  componentDidMount() {
    NativeModules.CompassAndroid.startTracking();

    DeviceEventEmitter.addListener('azimuthChanged', this.azimuthChanged.bind(this));

    /**
     * We need this magic because we receive too much 'azimuthChanged' events so RN can't render it.
     * Using interval we'll update our view each 1/10 second with current azimuth value.
     */
    this.interval = setInterval(() => {
      this.setState({
        azimuth: this.currentAzimuth
      });
    }, 100);
  }

  azimuthChanged(e: AzimuthEvent) {
    this.currentAzimuth = e.newAzimuth;
  }

  componentWillUnmount() {
    NativeModules.CompassAndroid.stopTracking();

    clearInterval(this.interval);
  }

  /**
   * Returns proper value for time of the day. If there's between 6 anf 11 o'clock
   * this function will return `config.morning` value, if between 12 and 20 `config.afternoon`
   * value will be returned. Or `config.night` object.
   * @param config object with the following format {morning: ..., afternoon: ..., night: ...}
   * @returns {*}
   * @private
   */
  _getDailyObject(config: DailyConfig): any {
    const currentHour = (new Date()).getHours();

    if (currentHour > 6 && currentHour < 12) {
      return config.morning;
    }

    if (currentHour >= 12 && currentHour < 20) {
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
        <StatusBar
          backgroundColor="transparent"
          translucent={true}
          />

        <View style={styles.textContainer}>
          <Text style={styles.text}>{Math.round(this.state.azimuth)} ˚ SE</Text>
        </View>

        <View style={styles.tableContainer}>
          <Image
            source={require('./img/table.png')}
            style={[styles.table]}
          >
            <Image
              source={require('./img/pointer.png')}
              style={[styles.pointer, {transform: [{ rotate: `${-this.state.azimuth}deg`}]}]}
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
  tableContainer: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  table: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  pointer: {

  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    opacity: 0.7
  }
});

export default Compass;