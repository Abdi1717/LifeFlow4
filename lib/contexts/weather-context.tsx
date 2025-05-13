import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types for weather data
export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_dir: string;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
    precip_mm: number;
    precip_in: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        daily_chance_of_rain: number;
      };
      hour: Array<{
        time: string;
        temp_c: number;
        temp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        chance_of_rain: number;
      }>;
    }>;
  };
}

interface WeatherContextType {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  fetchWeather: (location?: string) => Promise<void>;
  setLocation: (location: string) => void;
  currentLocation: string;
}

// Create the Weather context
const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

// Sample data for development (would be replaced with actual API data)
const SAMPLE_WEATHER: WeatherData = {
  location: {
    name: "Philadelphia",
    region: "Pennsylvania",
    country: "United States of America",
    lat: 39.95,
    lon: -75.16
  },
  current: {
    temp_c: 18.3,
    temp_f: 64.9,
    condition: {
      text: "Partly cloudy",
      icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
      code: 1003
    },
    wind_mph: 8.1,
    wind_kph: 13.0,
    wind_dir: "WSW",
    humidity: 43,
    feelslike_c: 18.3,
    feelslike_f: 64.9,
    uv: 5.0,
    precip_mm: 0.0,
    precip_in: 0.0
  },
  forecast: {
    forecastday: [
      {
        date: "2024-04-20",
        day: {
          maxtemp_c: 22.1,
          maxtemp_f: 71.8,
          mintemp_c: 12.8,
          mintemp_f: 55.0,
          condition: {
            text: "Sunny",
            icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
            code: 1000
          },
          daily_chance_of_rain: 0
        },
        hour: [
          {
            time: "2024-04-20 00:00",
            temp_c: 15.1,
            temp_f: 59.2,
            condition: {
              text: "Clear",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
              code: 1000
            },
            chance_of_rain: 0
          },
          // ... more hours would be here in real data
        ]
      },
      // ... more days would be here in real data
    ]
  }
};

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState("Philadelphia");

  // Fetch weather data from API or use sample data
  const fetchWeather = async (location?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call a weather API like WeatherAPI.com or OpenWeatherMap
      // For now, we'll simulate by using sample data and a delay
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use sample data (would be replaced with fetch response)
      setWeatherData(SAMPLE_WEATHER);
      
      // If a new location was provided, update the current location
      if (location) {
        setCurrentLocation(location);
        localStorage.setItem("weatherLocation", location);
      }
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to fetch weather data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Set a new location and fetch weather for it
  const setLocation = (location: string) => {
    fetchWeather(location);
  };

  // Load saved location from localStorage on initial render
  useEffect(() => {
    const storedLocation = localStorage.getItem("weatherLocation");
    if (storedLocation) {
      setCurrentLocation(storedLocation);
    }
    
    // Fetch weather data for the current location
    fetchWeather(storedLocation || currentLocation);
    
    // Refresh data every 30 minutes
    const intervalId = setInterval(() => {
      fetchWeather(currentLocation);
    }, 30 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const value = {
    weatherData,
    loading,
    error,
    fetchWeather,
    setLocation,
    currentLocation
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

// Custom hook to use the Weather context
export const useWeatherContext = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeatherContext must be used within a WeatherProvider");
  }
  return context;
}; 