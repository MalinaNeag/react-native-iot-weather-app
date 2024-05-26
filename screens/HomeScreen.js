import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon, CalendarIcon, CloudIcon, ChevronDoubleDownIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from 'lodash';
import { theme } from '../theme';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import * as Progress from 'react-native-progress';
import { StatusBar } from 'expo-status-bar';
import { weatherImages } from '../constants';
import { getData, storeData } from '../utils/asyncStorage';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({});

  const handleSearch = search => {
    if (search && search.length > 2) {
      fetchLocations({ cityName: search }).then(data => {
        setLocations(data);
      });
    }
  }

  const handleLocation = loc => {
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data => {
      setLoading(false);
      setWeather(data);
      storeData('city', loc.name);
    });
  }

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Islamabad';
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data => {
      setWeather(data);
      setLoading(false);

      // Trigger notifications for dangerous conditions
      if (data.current?.co_detected) {
        Alert.alert("Danger Alert", "Carbon Monoxide detected! Possible fire hazard. Please take immediate action.");
      }
      if (data.current?.vibration_detected) {
        Alert.alert("Danger Alert", "Vibration detected! Possible earthquake. Please take immediate action.");
      }
    });
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { location, current } = weather;

  const formattedTemp = (temp) => temp ? temp.toFixed(1) : 'N/A';

  const getLightStatus = () => {
    if (!current) return 'No light detected';
    const isDay = current.is_day === 1;
    if (isDay && current.light_detected) return 'Light detected';
    if (!isDay && current.light_detected) return 'Artificial light detected';
    return 'No light detected';
  };

  const formattedPressure = (pressure) => pressure ? pressure.toFixed(1) : 'N/A';

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', position: 'absolute', width: '100%', height: '100%' }} />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        className="absolute w-full h-full"
      />
      {
        loading ? (
          <View className="flex-1 flex-row justify-center items-center">
            <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
          </View>
        ) : (
          <SafeAreaView className="flex flex-1">
            <View className="mx-4 flex justify-around flex-1 mb-2">
              <Text className="text-white text-center text-2xl font-bold">
                {location?.name},
                <Text className="text-lg font-semibold text-gray-300"> {location?.country}</Text>
              </Text>
              <View className="flex-row justify-center">
                <Image
                  source={weatherImages[current?.condition?.text] || weatherImages['other']}
                  className="w-52 h-52"
                />
              </View>
              <View className="space-y-2">
                <Text className="text-center font-bold text-white text-6xl ml-5">
                  {formattedTemp(current?.temp_c)}&#176;C
                </Text>
                <Text className="text-center text-white text-xl tracking-widest">
                  {current?.condition?.text}
                </Text>
                <Text className="text-center text-white text-lg">
                  <Text className="text-base">{formattedTemp(current?.temp_f)}&#176;F</Text> / <Text className="text-base">{formattedTemp(current?.temp_k)}K</Text> / <Text className="text-base">{formattedTemp(current?.temp_r)}R</Text>
                </Text>
                <Text className="text-center text-white text-lg">
                  {current?.date}
                </Text>
              </View>
              <View className="flex-row justify-between mx-4">
                <View className="flex-row space-x-2 items-center">
                  <Image source={require('../assets/icons/drop.png')} className="w-6 h-6" />
                  <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <CloudIcon size={20} color="white" />
                  <Text className="text-white font-semibold text-base">{current?.rain_detected ? 'Detected' : 'Not Detected'}</Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <ChevronDoubleDownIcon size={20} color="white" />
                  <Text className="text-white font-semibold text-base">
                    {formattedPressure(current?.pressure)} hPa
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-2 space-y-3">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size="22" color="white" />
                <Text className="text-white text-base">Daily forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}
              >
                {weather?.forecast?.forecastday?.map((item, index) => {
                  const date = new Date(item.date);
                  const options = { weekday: 'long' };
                  let dayName = date.toLocaleDateString('en-US', options);
                  dayName = dayName.split(',')[0];

                  const conditionText = item?.day?.condition?.text || 'other';
                  const weatherImage = weatherImages[conditionText] || weatherImages['other'];

                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      style={{ backgroundColor: theme.bgWhite(0.15) }}
                    >
                      <Image
                        source={weatherImage}
                        className="w-11 h-11"
                      />
                      <Text className="text-white">{dayName}</Text>
                      <Text className="text-white text-xl font-semibold">
                        {formattedTemp(item?.day?.avgtemp_c)}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
            <View className="px-5 py-1 mt-4 mx-5 space-y-1">
              <View className="flex justify-center items-center w-full rounded-3xl py-1" style={{ backgroundColor: current?.co_detected ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 128, 0, 0.3)' }}>
                <Text className="text-white text-sm font-semibold">Fire Alert</Text>
                <Text className="text-xs text-white">{current?.co_detected ? 'Carbon Monoxide Detected' : 'No Carbon Monoxide detected'}</Text>
              </View>
              <View className="flex justify-center items-center w-full rounded-3xl py-1" style={{ backgroundColor: current?.vibration_detected ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 128, 0, 0.3)' }}>
                <Text className="text-white text-sm font-semibold">Earthquake Alert</Text>
                <Text className="text-xs text-white">{current?.vibration_detected ? 'Vibration detected' : 'No vibration detected'}</Text>
              </View>
              <View className="flex justify-center items-center w-full rounded-3xl py-1" style={{ backgroundColor: current?.light_detected ? 'rgba(0, 128, 0, 0.3)' : 'rgba(128, 128, 128, 0.3)' }}>
                <Text className="text-white text-sm font-semibold">Light Detection</Text>
                <Text className="text-xs text-white">{getLightStatus()}</Text>
              </View>
            </View>
          </SafeAreaView>
        )
      }
    </View>
  );
}
