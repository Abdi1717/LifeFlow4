import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load todos from localStorage on initial render
  useEffect(() => {
    const storedTodos = localStorage.getItem(storageKey);
    if (storedTodos) {
      try {
        setTodos(JSON.parse(storedTodos));
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
        },
      ]);
      setNewTodoText("");
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const clearCompletedTodos = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const hasCompletedTodos = completedCount > 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Add a new task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={addTodo}>Add</Button>
        </div>
        
        {todos.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No tasks yet. Add your first task above!
          </p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={todo.id}
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <Label
                    htmlFor={todo.id}
                    className={`${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {todo.text}
                  </Label>
                </div>
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
              </li>
            ))}
          </ul>
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
      </CardContent>
    </Card>
  );
} 