'use client';

// D3-related imports
import * as d3 from 'd3'
import { sankey, SankeyNodeMinimal } from 'd3-sankey'
// Regular imports
import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { CashflowItem, processSankeyData, SankeyLegendItem } from '@/lib/sankeyUtils'

interface SankeyDiagramProps {
  incomes: CashflowItem[];
  expenses: CashflowItem[];
  className?: string;
  title?: string;
  onTimeRangeChange?: (range: string) => void;
  timeRange?: string;
}

export const SankeyDiagramInternalInternal: React.FC<SankeyDiagramProps> = ({ 
  incomes = [], 
  expenses = [], 
  className,
  title = "Money Flow",
  onTimeRangeChange,
  timeRange = "month"
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  // State for category selection
  const [selectedCategories, setSelectedCategories] = useState<string[] | undefined>(undefined);
  const data = processSankeyData(incomes, expenses, selectedCategories ? { includeCategories: selectedCategories } : undefined);
  const isMobile = useIsMobile();
  // All categories from legend
  const allCategories = data.legend.map((item) => item.name);
  
  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = isMobile 
      ? { top: 30, right: 50, bottom: 30, left: 50 } // Minimal side margins for mobile
      : { top: 30, right: 180, bottom: 30, left: 180 };
    const width = svgRef.current.clientWidth;
    const height = isMobile ? 450 : 450;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'sankey');

    // Create the main group with margins
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up the Sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(isMobile ? 10 : 20)
      .nodePadding(isMobile ? 12 : 15)
      .extent([[0, 0], [innerWidth, innerHeight]]);

    // Generate the Sankey data
    const sankeyData = sankeyGenerator({
      nodes: data.nodes.map(node => {
        // Create a node that matches the SankeyNodeMinimal interface
        return {
          name: node.name.split('\n')[0],
          // Add required properties for d3-sankey
          index: 0, // This will be set by the sankey generator
          x0: 0,
          y0: 0,
          x1: 0,
          y1: 0,
          value: 0,
          // Add custom properties
          fill: node.color,
          color: node.color,
          percentage: node.percentage
        } as SankeyNodeMinimal<any, any>;
      }),
      links: data.links.map(link => ({
        // Ensure source and target are numbers as required
        source: link.source,
        target: link.target,
        value: link.value
      }))
    });

    // Center the budget node vertically
    const budgetNode = sankeyData.nodes.find((n: any) => n.name === 'Budget');
    if (budgetNode) {
      const centerY = innerHeight / 2;
      const nodeHeight = budgetNode.y1 - budgetNode.y0;
      budgetNode.y0 = centerY - (nodeHeight / 2);
      budgetNode.y1 = centerY + (nodeHeight / 2);
      
      // Additional adjustments for desktop view
      if (!isMobile) {
        const minHeight = innerHeight * 0.5;
        if (budgetNode.y1 - budgetNode.y0 < minHeight) {
          budgetNode.y0 = centerY - (minHeight / 2);
          budgetNode.y1 = centerY + (minHeight / 2);
        }
      }
    }

    // Create gradients for links
    const defs = svg.append('defs');
    sankeyData.links.forEach((link: any, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', link.source.x1)
        .attr('x2', link.target.x0);

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', link.source.fill);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', link.target.fill);
    });

    // Calculate vertical positions for links
    const sourceOffsets: { [key: string]: number } = {};
    const targetOffsets: { [key: string]: number } = {};

    sankeyData.nodes.forEach((node: any) => {
      sourceOffsets[node.index] = node.y0;
      targetOffsets[node.index] = node.y0;
    });

    // Sort links by target node index to maintain consistent ordering
    const sortedLinks = [...sankeyData.links].sort((a: any, b: any) => {
      if (a.target.index !== b.target.index) {
        return a.target.index - b.target.index;
      }
      return b.value - a.value; // For links to the same target, sort by value
    });

    // Custom link path generator that matches node heights
    const createLinkPath = (d: any) => {
      const sourceX = d.source.x1;
      const targetX = d.target.x0;
      
      // Calculate vertical positions based on accumulated offsets
      const sourceY = sourceOffsets[d.source.index];
      const targetY = targetOffsets[d.target.index];
      
      // Calculate heights based on the link's value
      const sourceHeight = (d.value / d.source.value) * (d.source.y1 - d.source.y0);
      const targetHeight = (d.value / d.target.value) * (d.target.y1 - d.target.y0);

      // Update offsets for next link
      sourceOffsets[d.source.index] += sourceHeight;
      targetOffsets[d.target.index] += targetHeight;

      // Control points for the curves
      const curvature = isMobile ? 0.2 : 0.5;
      const controlPoint1X = sourceX * (1 - curvature) + targetX * curvature;
      const controlPoint2X = sourceX * curvature + targetX * (1 - curvature);

      return `
        M${sourceX},${sourceY}
        C${controlPoint1X},${sourceY}
         ${controlPoint2X},${targetY}
         ${targetX},${targetY}
        L${targetX},${targetY + targetHeight}
        C${controlPoint2X},${targetY + targetHeight}
         ${controlPoint1X},${sourceY + sourceHeight}
         ${sourceX},${sourceY + sourceHeight}
        Z
      `;
    };

    // Draw the links
    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(sortedLinks)
      .join('path')
      .attr('class', 'link')
      .attr('d', createLinkPath)
      .attr('fill', (_, i) => `url(#gradient-${i})`)
      .attr('fill-opacity', isMobile ? 0.8 : 0.7)
      .attr('stroke', 'none');

    // Add link labels (percentage and dollar amount)
    const linkLabels = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(sortedLinks)
      .join('text')
      .attr('x', (d: any) => (d.source.x1 + d.target.x0) / 2)
      .attr('y', (d: any) => {
        // Center label vertically between source and target
        const sourceY = (d.source.y0 + d.source.y1) / 2;
        const targetY = (d.target.y0 + d.target.y1) / 2;
        return (sourceY + targetY) / 2;
      })
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('font-size', isMobile ? '9px' : '12px')
      .style('fill', '#374151')
      .style('pointer-events', 'none')
      .text((d: any) => {
        // Show $amount (xx%)
        const amount = d.dollarAmount !== undefined ? d.dollarAmount : d.value;
        const percent = d.percentage !== undefined ? d.percentage : 0;
        const percentStr = percent < 1 ? '<1%' : `${Math.round(percent)}%`;
        return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${percentStr})`;
      });

    // Draw the nodes
    const nodeGroups = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(sankeyData.nodes)
      .join('g')
      .attr('class', 'node');

    // Add node rectangles
    nodeGroups.append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', (d: any) => d.fill)
      .attr('fill-opacity', 0.9)
      .attr('rx', 4)
      .attr('ry', 4);

    // Add node labels
    nodeGroups.append('text')
      .attr('x', (d: any) => {
        const isBudget = d.name === 'Budget';
        const isLeftSide = sankeyData.nodes.indexOf(d) < sankeyData.nodes.findIndex((n: any) => n.name === 'Budget');
        const labelOffset = isMobile ? 5 : 10; // Further reduced offset for mobile
        return isBudget ? d.x0 + (d.x1 - d.x0) / 2 :
               isLeftSide ? d.x0 - labelOffset : d.x1 + labelOffset;
      })
      .attr('y', (d: any) => d.y0 + (d.y1 - d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: any) => {
        const isBudget = d.name === 'Budget';
        const isLeftSide = sankeyData.nodes.indexOf(d) < sankeyData.nodes.findIndex((n: any) => n.name === 'Budget');
        return isBudget ? 'middle' : isLeftSide ? 'end' : 'start';
      })
      .attr('transform', (d: any) => {
        // Tilt labels diagonally on mobile
        if (isMobile) {
          const isBudget = d.name === 'Budget';
          if (isBudget) return ''; // No rotation for budget node
          
          const isLeftSide = sankeyData.nodes.indexOf(d) < sankeyData.nodes.findIndex((n: any) => n.name === 'Budget');
          // Left side labels tilt up, right side labels tilt down
          const angle = isLeftSide ? 30 : -30; // Slightly less angled for better readability
          return `rotate(${angle}, ${isLeftSide ? d.x0 - 8 : d.x1 + 8}, ${d.y0 + (d.y1 - d.y0) / 2})`;
        }
        return '';
      })
      .attr('class', 'label')
      .style('font-size', isMobile ? '9px' : '12px')
      .style('fill', '#4b5563')
      .text((d: any) => {
        if (d.name === 'Budget') return 'Budget';
        // Show "< 1%" for percentages under 1%, otherwise show rounded integer
        const percentage = d.percentage < 1 ? '<1' : Math.round(d.percentage);
        let displayName = d.name;
        
        if (isMobile) {
          // Trim longer names on mobile
          if (displayName.length > 12) {
            displayName = displayName.substring(0, 10) + '..';
          }
          // Keep on same line but use very compact format
          return `${percentage}% ${displayName}`;
        }
        
        return `${percentage}% ${displayName}`;
      });

    // Adjust text for mobile
    if (isMobile) {
      nodeGroups.selectAll('text')
        .style('font-size', '8px') // Revert to 8px for mobile
        .each(function(d: any) {
          // Add a shadow effect to improve readability now that labels are closer to nodes
          const textElem = d3.select(this);
          const original = textElem.text();
          
          if (original && original.length > 0) {
            textElem
              .attr('stroke', 'white')
              .attr('stroke-width', '0.8px')
              .attr('paint-order', 'stroke');
          }
        });
    }

    // Add tooltips for links to show amounts
    links
      .append('title')
      .text((d: any) => {
        const sourceNode = d.source.name;
        const targetNode = d.target.name;
        return `${sourceNode} → ${targetNode}: $${d.value.toLocaleString()}`;
      });

  }, [data, incomes, expenses, isMobile]);

  const handleTimeRangeChange = (value: string) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(value);
    }
  };

  // Handle category selection
  const handleCategoryChange = (value: string[]) => {
    setSelectedCategories(value.length > 0 ? value : undefined);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Select
          value={timeRange}
          onValueChange={handleTimeRangeChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Current Month</SelectItem>
            <SelectItem value="quarter">Current Quarter</SelectItem>
            <SelectItem value="year">Current Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* Category selection UI */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Show Categories</label>
          <Select
            multiple
            value={selectedCategories || allCategories}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full max-w-lg">
              <SelectValue placeholder="Select categories to show" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {data.nodes.length > 0 ? (
          <div className="w-full overflow-auto">
            <div className="flex justify-center" style={{ height: isMobile ? 450 : 450 }}>
              <svg 
                ref={svgRef} 
                style={{ width: '100%', height: '100%', overflow: 'visible' }} 
                className="sankey mx-auto"
              />
            </div>
            {/* Color legend */}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {data.legend.map((item: SankeyLegendItem) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
            {/* Inflow/outflow warning */}
            {!data.inflowEqualsOutflow && (
              <div className="mt-2 text-xs text-red-500 text-center">
                {data.warning}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <h5 className="font-medium text-base mb-1">No Flow Data Available</h5>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Not enough transaction data to generate the money flow diagram.
              Import more transactions with both income and expenses to see how your money flows.
            </div>
          </div>
        )}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          This diagram visualizes how money flows from income sources through your budget to expense categories.
          Hover over links to see detailed amounts.
        </div>
      </CardContent>
    </Card>
  );
};
