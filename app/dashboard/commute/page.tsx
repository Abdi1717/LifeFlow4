'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, Train } from 'lucide-react';
import { useSeptaContext } from '@/lib/contexts/septa-context';
import { useWeatherContext } from '@/lib/contexts/weather-context';
import { lazyImport } from '@/lib/utils';
import { Suspense } from 'react';
import Loading from '@/components/loading';

// Lazy load commute components
const SeptaTrainStatus = lazyImport(() => import('@/components/septa-train-status').then(mod => ({ default: mod.SeptaTrainStatus })), {
  displayName: 'SeptaTrainStatus',
  ssr: false,
  loading: <Loading text="Loading train status..." />
});

const SeptaLineSelector = lazyImport(() => import('@/components/septa-line-selector').then(mod => ({ default: mod.SeptaLineSelector })), {
  displayName: 'SeptaLineSelector',
  ssr: false,
  loading: <Loading text="Loading line selector..." />
});

const WeatherDisplay = lazyImport(() => import('@/components/weather-display').then(mod => ({ default: mod.WeatherDisplay })), {
  displayName: 'WeatherDisplay',
  ssr: false,
  loading: <Loading text="Loading weather data..." />
});

export default function CommutePage() {
  const [activeTab, setActiveTab] = useState<string>('train');
  const { isLoading: septaLoading, error: septaError } = useSeptaContext();
  const { isLoading: weatherLoading, error: weatherError } = useWeatherContext();
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Commute Information</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-4">
            <TabsTrigger value="train" className="flex items-center gap-2 flex-1">
              <Train className="h-4 w-4" />
              <span>Train Status</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2 flex-1">
              <CloudRain className="h-4 w-4" />
              <span>Weather</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="train" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Train className="h-4 w-4" />
                      Saved Lines
                    </CardTitle>
                    <CardDescription>
                      Add or remove train lines to track
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<Loading text="Loading line selector..." />}>
                      <SeptaLineSelector />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Train className="h-4 w-4" />
                      Train Status
                    </CardTitle>
                    <CardDescription>
                      Current status for your saved train lines
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<Loading text="Loading train status..." />}>
                      <SeptaTrainStatus />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="weather" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CloudRain className="h-4 w-4" />
                  Weather Forecast
                </CardTitle>
                <CardDescription>
                  Current and upcoming weather for your commute
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Loading text="Loading weather data..." />}>
                  <WeatherDisplay />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 