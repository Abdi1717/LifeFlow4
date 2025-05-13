'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense, lazy } from "react";
import { Loading } from "@/components/loading";
import dynamic from "next/dynamic";

// Dynamically import components to reduce initial bundle size
const SeptaTrainCard = dynamic(() => import('@/components/septa-train-status').then(mod => mod.SeptaTrainCard), {
  ssr: false,
  loading: () => <Loading />
});

const SeptaLineSelector = dynamic(() => import('@/components/septa-line-selector').then(mod => mod.SeptaLineSelector), {
  ssr: false,
  loading: () => <Loading />
});

const WeatherCard = dynamic(() => import('@/components/weather-display').then(mod => mod.WeatherCard), {
  ssr: false,
  loading: () => <Loading />
});

// Dynamically import the providers to reduce initial bundle size
const SeptaProvider = dynamic(() => import('@/lib/contexts/septa-context').then(mod => mod.SeptaProvider), {
  ssr: false,
  loading: () => <Loading />
});

const WeatherProvider = dynamic(() => import('@/lib/contexts/weather-context').then(mod => mod.WeatherProvider), {
  ssr: false,
  loading: () => <Loading />
});

export default function CommutePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Commute Dashboard</h1>
      
      <Tabs defaultValue="trains" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="trains">SEPTA Train Status</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trains" className="space-y-6 mt-6">
          <Suspense fallback={<Loading />}>
            <SeptaProvider>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <SeptaTrainCard />
                </div>
                <div>
                  <SeptaLineSelector />
                </div>
              </div>
            </SeptaProvider>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="weather" className="space-y-6 mt-6">
          <Suspense fallback={<Loading />}>
            <WeatherProvider>
              <WeatherCard />
            </WeatherProvider>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
} 