import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the types for SEPTA train data
export interface SeptaTrainStatus {
  train_id: string;
  line: string;
  status: string;
  destination: string;
  next_station: string;
  scheduled_time: string;
  estimated_time: string;
  delay_minutes: number;
  direction: string;
  source?: string;
  track?: string;
}

export interface SeptaLine {
  id: string;
  name: string;
  color: string;
}

interface SeptaContextType {
  trains: SeptaTrainStatus[];
  savedLines: string[];
  loading: boolean;
  error: string | null;
  fetchTrainStatus: () => Promise<void>;
  addSavedLine: (line: string) => void;
  removeSavedLine: (line: string) => void;
  getFilteredTrains: (line?: string) => SeptaTrainStatus[];
  availableLines: SeptaLine[];
}

// Available SEPTA Regional Rail Lines with colors
export const SEPTA_LINES: SeptaLine[] = [
  { id: "AIR", name: "Airport Line", color: "#91456c" },
  { id: "CHE", name: "Chestnut Hill East Line", color: "#1d5d90" },
  { id: "CHW", name: "Chestnut Hill West Line", color: "#515114" },
  { id: "CYN", name: "Cynwyd Line", color: "#ee3e42" },
  { id: "FOX", name: "Fox Chase Line", color: "#faa634" },
  { id: "LAN", name: "Lansdale/Doylestown Line", color: "#623e97" },
  { id: "MED", name: "Media/Elwyn Line", color: "#ee3e42" },
  { id: "NOR", name: "Manayunk/Norristown Line", color: "#045c4f" },
  { id: "PAO", name: "Paoli/Thorndale Line", color: "#ee3e42" },
  { id: "TRE", name: "Trenton Line", color: "#ee3e42" },
  { id: "WAR", name: "Warminster Line", color: "#ee3e42" },
  { id: "WIL", name: "Wilmington/Newark Line", color: "#92278f" },
  { id: "WTR", name: "West Trenton Line", color: "#045c4f" },
];

// Create the SEPTA context
const SeptaContext = createContext<SeptaContextType | undefined>(undefined);

// Sample data for development (would be replaced with actual API data)
const SAMPLE_TRAINS: SeptaTrainStatus[] = [
  {
    train_id: "9382",
    line: "PAO",
    status: "On Time",
    destination: "Thorndale",
    next_station: "Ardmore",
    scheduled_time: "19:22",
    estimated_time: "19:22",
    delay_minutes: 0,
    direction: "Outbound",
    track: "2"
  },
  {
    train_id: "9383",
    line: "PAO",
    status: "Delayed",
    destination: "30th Street Station",
    next_station: "Malvern",
    scheduled_time: "19:30",
    estimated_time: "19:45",
    delay_minutes: 15,
    direction: "Inbound",
    track: "1"
  },
  {
    train_id: "4251",
    line: "LAN",
    status: "On Time",
    destination: "Doylestown",
    next_station: "North Broad",
    scheduled_time: "19:35",
    estimated_time: "19:35",
    delay_minutes: 0,
    direction: "Outbound"
  },
  {
    train_id: "4116",
    line: "AIR",
    status: "Delayed",
    destination: "Airport Terminals",
    next_station: "University City",
    scheduled_time: "19:18",
    estimated_time: "19:28",
    delay_minutes: 10,
    direction: "Outbound"
  },
  {
    train_id: "4117",
    line: "AIR",
    status: "On Time",
    destination: "30th Street Station",
    next_station: "Airport Terminals E-F",
    scheduled_time: "19:25",
    estimated_time: "19:25",
    delay_minutes: 0,
    direction: "Inbound"
  },
  {
    train_id: "9752",
    line: "WIL",
    status: "On Time",
    destination: "Newark",
    next_station: "Wilmington",
    scheduled_time: "19:40",
    estimated_time: "19:40",
    delay_minutes: 0,
    direction: "Outbound"
  }
];

export const SeptaProvider = ({ children }: { children: ReactNode }) => {
  const [trains, setTrains] = useState<SeptaTrainStatus[]>([]);
  const [savedLines, setSavedLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved lines from localStorage on initial render
  useEffect(() => {
    const storedLines = localStorage.getItem("septaSavedLines");
    if (storedLines) {
      setSavedLines(JSON.parse(storedLines));
    } else {
      // Default to save PAO (Paoli/Thorndale) line if no preferences exist
      const defaultLines = ["PAO"];
      setSavedLines(defaultLines);
      localStorage.setItem("septaSavedLines", JSON.stringify(defaultLines));
    }
  }, []);

  // Fetch train status from SEPTA API
  const fetchTrainStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call the actual SEPTA API
      // For now, we'll simulate by using sample data and a delay
      // Example API: https://www3.septa.org/hackathon/TrainView/
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use sample data (would be replaced with fetch response)
      setTrains(SAMPLE_TRAINS);
    } catch (err) {
      console.error("Error fetching SEPTA data:", err);
      setError("Failed to fetch SEPTA train status. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize with data on component mount
  useEffect(() => {
    fetchTrainStatus();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchTrainStatus, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Add a saved line preference
  const addSavedLine = (line: string) => {
    if (!savedLines.includes(line)) {
      const newSavedLines = [...savedLines, line];
      setSavedLines(newSavedLines);
      localStorage.setItem("septaSavedLines", JSON.stringify(newSavedLines));
    }
  };

  // Remove a saved line preference
  const removeSavedLine = (line: string) => {
    const newSavedLines = savedLines.filter(l => l !== line);
    setSavedLines(newSavedLines);
    localStorage.setItem("septaSavedLines", JSON.stringify(newSavedLines));
  };

  // Get trains filtered by line
  const getFilteredTrains = (line?: string) => {
    if (!line) {
      return trains.filter(train => savedLines.includes(train.line));
    }
    return trains.filter(train => train.line === line);
  };

  const value = {
    trains,
    savedLines,
    loading,
    error,
    fetchTrainStatus,
    addSavedLine,
    removeSavedLine,
    getFilteredTrains,
    availableLines: SEPTA_LINES
  };

  return <SeptaContext.Provider value={value}>{children}</SeptaContext.Provider>;
};

// Custom hook to use the SEPTA context
export const useSeptaContext = () => {
  const context = useContext(SeptaContext);
  if (context === undefined) {
    throw new Error("useSeptaContext must be used within a SeptaProvider");
  }
  return context;
}; 