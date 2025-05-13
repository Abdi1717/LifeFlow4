'use client';

import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useRadar } from '@/lib/contexts/radar-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RadarTimelineProps {
  height?: number;
}

/**
 * RadarTimeline displays a line chart showing progress for selected areas over time
 * 
 * @param {object} props - The component props
 * @param {number} [props.height=350] - Chart height in pixels
 * @returns {JSX.Element} The rendered timeline chart component
 */
export function RadarTimeline({ height = 350 }: RadarTimelineProps) {
  const { areas, entries } = useRadar();
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('3m');

  // Filter entries based on time range
  const filteredEntries = useMemo(() => {
    if (timeRange === 'all') return [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case '1m': cutoffDate = subMonths(now, 1); break;
      case '3m': cutoffDate = subMonths(now, 3); break;
      case '6m': cutoffDate = subMonths(now, 6); break;
      case '1y': cutoffDate = subMonths(now, 12); break;
      default: cutoffDate = subMonths(now, 3);
    }
    
    return entries
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries, timeRange]);

  // Prepare chart data
  const chartData: ChartData<'line'> = useMemo(() => {
    // If no entries or no areas selected, return empty chart
    if (filteredEntries.length === 0 || selectedAreaIds.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Get dates for x-axis
    const labels = filteredEntries.map(entry => format(new Date(entry.date), 'MMM d, yyyy'));
    
    // Create datasets for selected areas
    const datasets = selectedAreaIds.map(areaId => {
      const area = areas.find(a => a.id === areaId);
      if (!area) return null;
      
      return {
        label: area.name,
        data: filteredEntries.map(entry => {
          const value = entry.values.find(v => v.areaId === areaId);
          return value ? value.value : null;
        }),
        borderColor: area.color,
        backgroundColor: area.color,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    }).filter(Boolean);
    
    return {
      labels,
      datasets: datasets as any[],
    };
  }, [filteredEntries, selectedAreaIds, areas]);

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Score',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}/10`;
          }
        }
      }
    },
  };

  // Toggle area selection
  const toggleAreaSelection = (areaId: string) => {
    setSelectedAreaIds(prev => {
      if (prev.includes(areaId)) {
        return prev.filter(id => id !== areaId);
      } else {
        return [...prev, areaId];
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Progress Timeline</CardTitle>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {areas.map(area => (
            <div
              key={area.id}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer border transition-colors ${
                selectedAreaIds.includes(area.id)
                  ? 'border-2 text-white'
                  : 'border-1 text-muted-foreground bg-transparent'
              }`}
              style={{
                backgroundColor: selectedAreaIds.includes(area.id) ? area.color : 'transparent',
                borderColor: area.color,
              }}
              onClick={() => toggleAreaSelection(area.id)}
            >
              {area.name}
            </div>
          ))}
        </div>
        
        <div style={{ height: `${height}px` }}>
          {filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No entries found for the selected time period.
            </div>
          ) : selectedAreaIds.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select one or more areas to view progress.
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </CardContent>
    </Card>
  );
} 