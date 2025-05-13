import { useMemo } from "react";
import { SeptaTrainStatus, SEPTA_LINES, useSeptaContext } from "@/lib/contexts/septa-context";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollToTop } from "./scroll-to-top";

export const SeptaTrainStatusTable = ({ line }: { line?: string }) => {
  const { getFilteredTrains, loading, error } = useSeptaContext();
  
  const filteredTrains = useMemo(() => {
    return getFilteredTrains(line);
  }, [getFilteredTrains, line]);
  
  // Find line name from ID
  const getLineName = (lineId: string) => {
    const foundLine = SEPTA_LINES.find(l => l.id === lineId);
    return foundLine ? foundLine.name : lineId;
  };
  
  // Get color for line ID
  const getLineColor = (lineId: string) => {
    const foundLine = SEPTA_LINES.find(l => l.id === lineId);
    return foundLine ? foundLine.color : "#888888";
  };
  
  // Determine status icon and color
  const getStatusBadge = (train: SeptaTrainStatus) => {
    if (train.status.toLowerCase().includes("on time")) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <Check size={14} className="mr-1" /> On Time
        </Badge>
      );
    } else if (train.status.toLowerCase().includes("delay")) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          <Clock size={14} className="mr-1" /> {train.delay_minutes}m Delay
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          <AlertCircle size={14} className="mr-1" /> {train.status}
        </Badge>
      );
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        <AlertCircle className="inline-block mr-2" size={18} />
        {error}
      </div>
    );
  }
  
  // No trains found
  if (filteredTrains.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
        No trains found for the selected lines. Try selecting different lines or check back later.
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-auto relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Train</TableHead>
            <TableHead>Line</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Next Stop</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Estimated</TableHead>
            <TableHead>Direction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTrains.map((train) => (
            <TableRow key={train.train_id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{train.train_id}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getLineColor(train.line) }}
                  />
                  {train.line}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(train)}</TableCell>
              <TableCell>{train.destination}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <ChevronRight size={16} className="mr-1 text-gray-400" />
                  {train.next_station}
                </div>
              </TableCell>
              <TableCell>{train.scheduled_time}</TableCell>
              <TableCell 
                className={train.delay_minutes > 0 ? 'text-amber-600 font-medium' : ''}
              >
                {train.estimated_time}
              </TableCell>
              <TableCell>{train.direction}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollToTop top={200} className="bottom-4 right-4" />
    </div>
  );
};

// Component that wraps the status table in a card with title
export const SeptaTrainCard = ({ line, title }: { line?: string; title?: string }) => {
  const lineName = line ? SEPTA_LINES.find(l => l.id === line)?.name : "Saved Lines";
  const displayTitle = title || (line ? `${lineName} Trains` : "My Train Lines");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{displayTitle}</CardTitle>
        <CardDescription>
          Real-time train status information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SeptaTrainStatusTable line={line} />
      </CardContent>
    </Card>
  );
}; 