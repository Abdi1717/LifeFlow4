import { useWeatherContext } from "@/lib/contexts/weather-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, Droplets, Wind, Thermometer, Sun } from "lucide-react";
import { useState } from "react";

export function WeatherCard() {
  const { weatherData, loading, error, setLocation, currentLocation } = useWeatherContext();
  const [searchLocation, setSearchLocation] = useState("");
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setLocation(searchLocation);
      setSearchLocation("");
    }
  };
  
  // Get an appropriate icon based on the condition code
  const getWeatherIcon = (conditionCode: number) => {
    // Clear conditions
    if (conditionCode === 1000) return <Sun className="h-10 w-10 text-yellow-500" />;
    
    // Cloudy conditions (1003, 1006, 1009)
    if (conditionCode >= 1003 && conditionCode <= 1009) {
      return <svg className="h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 15H17C19.2091 15 21 16.7909 21 19C21 21.2091 19.2091 23 17 23H3M3 15C5.21 15 7 16.79 7 19C7 21.21 5.21 23 3 23M3 15C1.34 15 0 13.66 0 12C0 10.34 1.34 9 3 9C3.25 9 3.51 9.03 3.75 9.09C4.26 6.21 6.75 4 9.75 4C13.5 4 16.5 7 16.5 10.75C16.5 11.19 16.47 11.63 16.4 12.05C16.6 12.02 16.8 12 17 12C19.76 12 22 14.24 22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    }
    
    // Rainy conditions (1063, 1180-1198, 1240-1246)
    if ((conditionCode === 1063) || 
        (conditionCode >= 1180 && conditionCode <= 1198) || 
        (conditionCode >= 1240 && conditionCode <= 1246)) {
      return <Droplets className="h-10 w-10 text-blue-500" />;
    }
    
    // Stormy conditions (1087, 1273-1282)
    if (conditionCode === 1087 || (conditionCode >= 1273 && conditionCode <= 1282)) {
      return <svg className="h-10 w-10 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 16.9C19.78 16.6232 20.4367 16.0818 20.8614 15.3744C21.286 14.6669 21.4564 13.8349 21.343 13.0195C21.2296 12.2041 20.8391 11.4564 20.2349 10.9018C19.6307 10.3473 18.8504 10.0219 18.03 10H16.74C16.4329 8.97228 15.8667 8.04193 15.0989 7.31234C14.3311 6.58276 13.3853 6.07909 12.3602 5.85362C11.3351 5.62816 10.2684 5.68966 9.27502 6.03145C8.28166 6.37324 7.39151 6.98323 6.698 7.798C6.00448 8.61277 5.53223 9.59717 5.33732 10.6525C5.1424 11.7078 5.23158 12.798 5.59577 13.8009C5.95996 14.8039 6.58575 15.6854 7.40202 16.3466C8.2183 17.0079 9.19472 17.4225 10.23 17.549" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 14L9 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 22L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    }
    
    // Snowy conditions (1066, 1114-1117, 1210-1237)
    if (conditionCode === 1066 || 
       (conditionCode >= 1114 && conditionCode <= 1117) || 
       (conditionCode >= 1210 && conditionCode <= 1237)) {
      return <svg className="h-10 w-10 text-sky-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 17.58C21.0512 17.1196 21.9069 16.3116 22.4058 15.2909C22.9047 14.2703 23.0131 13.1035 22.7175 12.0064C22.4219 10.9094 21.7451 9.94991 20.8069 9.29233C19.8688 8.63475 18.7269 8.32163 17.58 8.41C17.3223 7.05995 16.6456 5.82427 15.6438 4.86466C14.6421 3.90505 13.3645 3.26678 12.0011 3.02516C10.6377 2.78354 9.23461 2.94686 7.96847 3.49461C6.70234 4.04235 5.63379 4.95046 4.9 6.1C4.19108 7.19385 3.81467 8.47099 3.8157 9.78C3.81673 11.089 4.19518 12.3654 4.9058 13.4578C5.61643 14.5502 6.65566 15.4198 7.87 15.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 16H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 20H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 16H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 20H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    }
    
    // Foggy conditions (1030, 1135, 1147)
    if (conditionCode === 1030 || conditionCode === 1135 || conditionCode === 1147) {
      return <svg className="h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 5H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 13H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 17H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    }
    
    // Default icon for other conditions
    return <svg className="h-10 w-10 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>;
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Weather</CardTitle>
            <CardDescription>
              Current conditions for your commute
            </CardDescription>
          </div>
          
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input 
              placeholder="City name..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="max-w-[150px]"
            />
            <Button type="submit" size="icon" disabled={loading}>
              <Search size={18} />
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            <AlertCircle className="inline-block mr-2" size={18} />
            {error}
          </div>
        ) : weatherData ? (
          <div>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{weatherData.location.name}</h3>
                <p className="text-sm text-muted-foreground">{weatherData.location.region}, {weatherData.location.country}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{weatherData.current.temp_f}°F</div>
                <p className="text-sm text-muted-foreground">Feels like {weatherData.current.feelslike_f}°F</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg flex items-center">
                {getWeatherIcon(weatherData.current.condition.code)}
                <div className="ml-4">
                  <div className="font-medium">{weatherData.current.condition.text}</div>
                  <div className="text-sm text-muted-foreground">
                    {weatherData.current.precip_in > 0 ? 
                      `${weatherData.current.precip_in}" precipitation` : 
                      "No precipitation"}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Wind size={16} className="mr-2 text-blue-400" />
                    <div className="text-sm">
                      <span className="font-medium">{weatherData.current.wind_mph} mph</span>
                      <div className="text-xs text-muted-foreground">{weatherData.current.wind_dir}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Droplets size={16} className="mr-2 text-blue-400" />
                    <div className="text-sm">
                      <span className="font-medium">{weatherData.current.humidity}%</span>
                      <div className="text-xs text-muted-foreground">Humidity</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Thermometer size={16} className="mr-2 text-red-400" />
                    <div className="text-sm">
                      <span className="font-medium">{weatherData.current.feelslike_f}°F</span>
                      <div className="text-xs text-muted-foreground">Feels like</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Sun size={16} className="mr-2 text-yellow-400" />
                    <div className="text-sm">
                      <span className="font-medium">{weatherData.current.uv}</span>
                      <div className="text-xs text-muted-foreground">UV Index</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {weatherData.forecast && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Today's Forecast</h4>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">High: {weatherData.forecast.forecastday[0].day.maxtemp_f}°F</span>
                      <span className="mx-2">|</span>
                      <span className="font-medium">Low: {weatherData.forecast.forecastday[0].day.mintemp_f}°F</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{weatherData.forecast.forecastday[0].day.daily_chance_of_rain}%</span>
                      <span className="text-muted-foreground ml-1">chance of rain</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-600">
            No weather data available
          </div>
        )}
      </CardContent>
    </Card>
  );
} 