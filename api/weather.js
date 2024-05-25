// api/weather.js
import axios from "axios";
import { apiKey } from "../constants";
import { database } from './firebaseConfig'; // Ensure you have firebaseConfig.js correctly set up

const forecastEndpoint = params => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}`;
const locationsEndpoint = params => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint,
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.log('error: ', error);
        return {};
    }
}

export const fetchWeatherForecast = async params => {
    let forecastUrl = forecastEndpoint(params);
    const apiData = await apiCall(forecastUrl);

    const firebaseData = await fetchFirebaseData();

    if (firebaseData) {
        apiData.current.temp_c = firebaseData.temperature_c;
        apiData.current.temp_f = firebaseData.temperature_f;
        apiData.current.temp_k = firebaseData.temperature_k;
        apiData.current.temp_r = firebaseData.temperature_r;
        apiData.current.humidity = firebaseData.humidity;
        apiData.current.co_detected = firebaseData.co_detected;
        apiData.current.light_detected = firebaseData.light_detected;
        apiData.current.vibration_detected = firebaseData.vibration_detected;
        apiData.current.date = firebaseData.date;
    }

    return apiData;
}

export const fetchLocations = params => {
    let locationsUrl = locationsEndpoint(params);
    return apiCall(locationsUrl);
}

const fetchFirebaseData = async () => {
    try {
        const snapshot = await database.ref().once('value');
        return snapshot.val();
    } catch (error) {
        console.log('Error fetching data: ', error);
        return {};
    }
}
