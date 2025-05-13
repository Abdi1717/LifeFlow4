import { useSeptaContext, SEPTA_LINES } from "@/lib/contexts/septa-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePlus, BadgeCheck, BadgeX } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SeptaLineSelector() {
  const { savedLines, addSavedLine, removeSavedLine } = useSeptaContext();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEPTA Lines</CardTitle>
        <CardDescription>
          Select the train lines you want to track
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {SEPTA_LINES.map((line) => {
              const isSaved = savedLines.includes(line.id);
              return (
                <div 
                  key={line.id}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    isSaved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: line.color }}
                    />
                    <div>
                      <div className="font-medium">{line.name}</div>
                      <div className="text-xs text-muted-foreground">{line.id}</div>
                    </div>
                  </div>

                  {isSaved ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSavedLine(line.id)}
                      aria-label={`Remove ${line.name} from saved lines`}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <BadgeX size={18} />
                      <span className="ml-1">Remove</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addSavedLine(line.id)}
                      aria-label={`Add ${line.name} to saved lines`}
                      className="text-green-500 hover:text-green-700 hover:bg-green-50"
                    >
                      <BadgePlus size={18} />
                      <span className="ml-1">Add</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Currently Tracking</h4>
          <div className="flex flex-wrap gap-2">
            {savedLines.length > 0 ? (
              savedLines.map((lineId) => {
                const line = SEPTA_LINES.find(l => l.id === lineId);
                return (
                  <div 
                    key={lineId}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${line?.color}20`, // 20% opacity
                      color: line?.color,
                      border: `1px solid ${line?.color}` 
                    }}
                  >
                    <BadgeCheck size={12} className="mr-1" />
                    {line?.name || lineId}
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-sm">No lines selected. Add some lines above.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 