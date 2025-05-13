'use client';

import React, { useMemo } from 'react';
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
export function RadarChart({
  entry,
  previousEntry,
  showLegend = true,
  showComparison = false,
  height = 300
}: RadarChartProps) {
  const { areas, getLatestEntry } = useRadar();
  
  // Use provided entry or latest
  const currentEntry = useMemo(() => {
    return entry || getLatestEntry();
  }, [entry, getLatestEntry]);

  // Prepare chart data
  const chartData: ChartData<'radar'> = useMemo(() => {
    if (!currentEntry) {
      // Default empty chart
      return {
        labels: areas.map(area => area.name),
        datasets: [
          {
            label: 'No Data Available',
            data: areas.map(() => 0),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
          },
        ],
      };
    }

    // Current entry dataset
    const currentDataset = {
      label: new Date(currentEntry.date).toLocaleDateString(),
      data: areas.map(area => {
        const valueEntry = currentEntry.values.find(v => v.areaId === area.id);
        return valueEntry ? valueEntry.value : 0;
      }),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
    };

    const datasets = [currentDataset];

    // Add previous entry for comparison if requested and available
    if (showComparison && previousEntry) {
      datasets.push({
        label: new Date(previousEntry.date).toLocaleDateString(),
        data: areas.map(area => {
          const valueEntry = previousEntry.values.find(v => v.areaId === area.id);
          return valueEntry ? valueEntry.value : 0;
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      });
    }

    return {
      labels: areas.map(area => area.name),
      datasets,
    };
  }, [areas, currentEntry, previousEntry, showComparison]);

  // Chart options
  const chartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.formattedValue}/10`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      {areas.length > 0 ? (
        <Radar data={chartData} options={chartOptions} />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Please define some areas to track first.
        </div>
      )}
    </div>
  );
} 