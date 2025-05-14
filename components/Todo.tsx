import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, GripVertical, AlertCircle, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: Date | null;
}

interface TodoProps {
  initialTodos?: TodoItem[];
  title?: string;
  storageKey?: string;
}

export default function Todo({ 
  initialTodos = [], 
  title = "Todo List",
  storageKey = "lifeflow-todos"
}: TodoProps) {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<"low" | "medium" | "high" | undefined>(undefined);
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Load todos from localStorage on initial render
  useEffect(() => {
    const storedTodos = localStorage.getItem(storageKey);
    if (storedTodos) {
      try {
        // Convert string dates back to Date objects
        const parsed = JSON.parse(storedTodos);
        const todosList = parsed.map((todo: any) => ({
          ...todo,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : null
        }));
        setTodos(todosList);
      } catch (error) {
        console.error("Failed to parse stored todos:", error);
      }
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(storageKey, JSON.stringify(todos));
    }
  }, [todos, storageKey, isLoaded]);

  const addTodo = () => {
    if (newTodoText.trim()) {
      setTodos([
        ...todos,
        {
          id: uuidv4(),
          text: newTodoText,
          completed: false,
          priority: newTodoPriority,
          dueDate: newTodoDueDate
        },
      ]);
      setNewTodoText("");
      setNewTodoPriority(undefined);
      setNewTodoDueDate(null);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const updateTodoPriority = (id: string, priority: "low" | "medium" | "high" | undefined) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, priority } : todo
      )
    );
  };

  const updateTodoDueDate = (id: string, dueDate: Date | null) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, dueDate } : todo
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const clearCompletedTodos = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const onDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const reorderedTodos = Array.from(todos);
    const [movedItem] = reorderedTodos.splice(result.source.index, 1);
    reorderedTodos.splice(result.destination.index, 0, movedItem);

    setTodos(reorderedTodos);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by priority (if both have priorities)
    if (a.priority && b.priority) {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (a.priority) {
      return -1; // a has priority, b doesn't
    } else if (b.priority) {
      return 1; // b has priority, a doesn't
    }
    
    // Then by due date (if both have due dates)
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    } else if (a.dueDate) {
      return -1; // a has due date, b doesn't
    } else if (b.dueDate) {
      return 1; // b has due date, a doesn't
    }
    
    return 0;
  });

  const completedCount = todos.filter((todo) => todo.completed).length;
  const hasCompletedTodos = completedCount > 0;
  const dueToday = todos.filter((todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueDate = new Date(todo.dueDate.getFullYear(), todo.dueDate.getMonth(), todo.dueDate.getDate());
    return todayDate.getTime() === dueDate.getTime();
  }).length;

  const getPriorityBadge = (priority: "low" | "medium" | "high" | undefined) => {
    if (!priority) return null;
    
    const colors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    
    const icons = {
      low: null,
      medium: <AlertTriangle className="h-3 w-3 mr-1" />,
      high: <AlertCircle className="h-3 w-3 mr-1" />
    };
    
    return (
      <Badge variant="outline" className={cn("ml-2 font-normal flex items-center", colors[priority])}>
        {icons[priority]}
        {priority}
      </Badge>
    );
  };

  const getDueDateStatus = (dueDate: Date | null | undefined, completed: boolean) => {
    if (!dueDate || completed) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateCopy = new Date(dueDate);
    dueDateCopy.setHours(0, 0, 0, 0);
    
    const isOverdue = dueDateCopy < today;
    const isDueToday = dueDateCopy.getTime() === today.getTime();
    
    if (isOverdue) {
      return <Badge variant="destructive" className="ml-2">Overdue</Badge>;
    }
    
    if (isDueToday) {
      return <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Due today</Badge>;
    }
    
    return (
      <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
        Due {format(dueDate, "MMM d")}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Input
              placeholder="Add a new task..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            
            <div className="flex items-center space-x-2">
              <Select value={newTodoPriority} onValueChange={(value: any) => setNewTodoPriority(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !newTodoDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTodoDueDate ? format(newTodoDueDate, "PPP") : <span>Due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTodoDueDate || undefined}
                    onSelect={setNewTodoDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button onClick={addTodo} className="flex-shrink-0">Add</Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm">
              <Button 
                variant={filter === "all" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button 
                variant={filter === "active" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter("active")}
              >
                Active
              </Button>
              <Button 
                variant={filter === "completed" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilter("completed")}
              >
                Completed
              </Button>
            </div>
            
            {dueToday > 0 && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                {dueToday} due today
              </Badge>
            )}
          </div>
          
          {sortedTodos.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              {filter === "all" 
                ? "No tasks yet. Add your first task above!" 
                : filter === "active"
                  ? "No active tasks. All done!"
                  : "No completed tasks yet."}
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="todo-list">
                {(provided) => (
                  <ul 
                    className="space-y-2" 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {sortedTodos.map((todo, index) => (
                      <Draggable key={todo.id} draggableId={todo.id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-md border",
                              todo.completed ? "bg-muted/50" : "bg-card"
                            )}
                          >
                            <div className="flex items-center space-x-2 flex-1">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab text-muted-foreground hover:text-foreground"
                              >
                                <GripVertical size={16} />
                              </div>
                              
                              <Checkbox
                                id={todo.id}
                                checked={todo.completed}
                                onCheckedChange={() => toggleTodo(todo.id)}
                              />
                              
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <Label
                                  htmlFor={todo.id}
                                  className={cn(
                                    "cursor-pointer",
                                    todo.completed ? "line-through text-muted-foreground" : ""
                                  )}
                                >
                                  {todo.text}
                                </Label>
                                
                                <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                                  {getPriorityBadge(todo.priority)}
                                  {getDueDateStatus(todo.dueDate, todo.completed)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {!todo.completed && (
                                <>
                                  <Select 
                                    value={todo.priority} 
                                    onValueChange={(value: any) => updateTodoPriority(todo.id, value)}
                                  >
                                    <SelectTrigger className="w-[100px] h-8">
                                      <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                      >
                                        <CalendarIcon className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                      <Calendar
                                        mode="single"
                                        selected={todo.dueDate || undefined}
                                        onSelect={(date) => updateTodoDueDate(todo.id, date)}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTodo(todo.id)}
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Delete</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </Button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}
          
          {todos.length > 0 && (
            <div className="mt-4">
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {completedCount}/{todos.length} completed
                </p>
                {hasCompletedTodos && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCompletedTodos}
                  >
                    Clear completed
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 