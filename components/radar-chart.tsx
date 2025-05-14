'use client';

import React, { useMemo, useCallback, memo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useRadar } from '@/lib/contexts/radar-context';
import { RadarEntry } from '@/lib/types';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Register the chart.js components we need
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  entry?: RadarEntry | null;
  previousEntry?: RadarEntry | null;
  showLegend?: boolean;
  showComparison?: boolean;
  height?: number;
  showCard?: boolean;
  areaIndices?: number[];
  entries?: { date: string; values: Record<string, number>; isRelevant?: boolean }[];
}

/**
 * RadarChart displays a radar/spider chart visualizing personal growth areas
 * 
 * @param {object} props - The component props
 * @param {RadarEntry} [props.entry] - The entry to display (defaults to latest if not provided)
 * @param {RadarEntry} [props.previousEntry] - Optional previous entry to compare with
 * @param {boolean} [props.showLegend=true] - Whether to show the chart legend
 * @param {boolean} [props.showComparison=false] - Whether to show comparison with previous entry
 * @param {number} [props.height=300] - Chart height in pixels
 * @returns {JSX.Element} The rendered radar chart component
 */
function RadarChartComponent({
  entry,
  previousEntry,
  showLegend = true,
  showComparison = false,
  height = 300,
  showCard = false,
  areaIndices,
  entries
}: RadarChartProps) {
  const { getLatestEntry, getAreas, getEntryByDate } = useRadar();
  
  // Use provided entry or latest
  const currentEntry = useMemo(() => {
    return entry || getLatestEntry();
  }, [entry, getLatestEntry]);

  // Data transformation is memoized to avoid recomputing on every render
  const chartData = useMemo(() => {
    let dataToUse = entries || [];
    
    // If no entries are provided, use latest entry
    if (!entries || entries.length === 0) {
      const latest = getLatestEntry();
      if (latest) {
        dataToUse = [{ 
          date: latest.date, 
          values: latest.areas.reduce((acc, area) => {
            acc[area.name] = area.value
            return acc
          }, {} as Record<string, number>),
          isRelevant: true
        }];
      }
    }
    
    // Filter areas if specific indices are provided
    const areas = getAreas();
    const filteredAreas = areaIndices 
      ? areaIndices.map(index => areas[index])
      : areas
    
    // Prepare data for the radar chart
    const formattedData = filteredAreas.map(area => {
      const areaData: Record<string, any> = {
        subject: area.name,
        fullMark: 10 // The maximum value in our scale
      };
      
      // Add values from entries
      dataToUse.forEach((entry, index) => {
        const value = entry.values[area.name] || 0;
        areaData[`entry${index}`] = value;
        
        // Add a suffix to indicate the most recent/relevant entry
        if (entry.isRelevant) {
          areaData.current = value;
        }
      });
      
      return areaData;
    });
    
    return formattedData;
  }, [getLatestEntry, getAreas, areaIndices, entries]);
  
  // Only create the date labels once to avoid recreating on each render
  const dateLabels = useMemo(() => {
    if (entries) {
      return entries.map(entry => new Date(entry.date).toLocaleDateString());
    }
    return [];
  }, [entries]);
  
  // Memoize the color factory function
  const getCustomColor = useCallback((index: number) => {
    const colors = [
      '#8884d8', // Purple
      '#82ca9d', // Green
      '#ffc658', // Yellow
      '#ff8042', // Orange
      '#0088fe', // Blue
      '#00C49F', // Teal
      '#FFBB28', // Light Orange
      '#FF8042'  // Orange
    ];
    
    // For 'current' values, always use a distinctive color
    if (index === -1) return '#ff5252';
    
    // For series data, cycle through colors
    return colors[index % colors.length];
  }, []);
  
  const renderTooltipContent = useCallback(({ payload, label }: any) => {
    if (!payload || payload.length === 0) return null;
    
    return (
      <div className="bg-background border rounded-md p-2 shadow-md text-sm">
        <p className="font-semibold">{label}</p>
        <div className="space-y-1 mt-1">
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {entry.name === 'current' ? 'Current' : 
                  entries && dateLabels[parseInt(entry.dataKey.replace('entry', ''))]
                }
                : {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }, [entries, dateLabels]);
  
  // Render different layouts based on props
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart 
        cx="50%" 
        cy="50%" 
        outerRadius="80%" 
        data={chartData}
      >
        <PolarGrid strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis domain={[0, 10]} tickCount={6} />
        
        {/* Render radar for each entry */}
        {entries && entries.map((_, index) => (
          <Radar
            key={`radar-${index}`}
            name={dateLabels[index] || `Entry ${index + 1}`}
            dataKey={`entry${index}`}
            stroke={getCustomColor(index)}
            fill={getCustomColor(index)}
            fillOpacity={0.2}
          />
        ))}
        
        {/* Render current/latest if applicable */}
        {(!entries || entries.some(e => e.isRelevant)) && (
          <Radar
            name="Current"
            dataKey="current"
            stroke={getCustomColor(-1)}
            fill={getCustomColor(-1)}
            fillOpacity={0.3}
          />
        )}
        
        <Tooltip content={renderTooltipContent} />
        <Legend />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
  
  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Life Areas Radar</CardTitle>
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }
  
  return chart;
}

// Wrap with memo to prevent unnecessary re-renders
export const RadarChart = memo(RadarChartComponent); 