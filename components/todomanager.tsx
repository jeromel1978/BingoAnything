"use client";

import { useState, useEffect, useCallback } from "react";
import { TodoList, Todo } from "@/components/todo"; // Import the component from previous step
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, FolderOpen, Save } from "lucide-react";
import { Sparkles, RefreshCw, Check, X } from "lucide-react";
import { BingoCard } from "@/components/bingo";
// Inside TodoListManager.tsx
import { ShareBingoButton } from "@/components/exportbutton";

// Define the structure of our localStorage data
interface TodoListsData {
  [listName: string]: Todo[];
}

const STORAGE_KEY = "my-todo-app-lists";

export function TodoListManager() {
  const [lists, setLists] = useState<TodoListsData>({});
  const [selectedListName, setSelectedListName] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [showBingo, setShowBingo] = useState(false);

  // Initialize state from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TodoListsData;
        setLists(parsed);
        const names = Object.keys(parsed);
        if (names.length > 0) {
          setSelectedListName(names[0]);
        }
      } catch (e) {
        console.error("Failed to parse stored todos", e);
      }
    }
  }, []);

  // Save to localStorage whenever lists change
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists, isClient]);

  // Create a new list
  const handleCreateList = () => {
    if (!newListName.trim() || lists[newListName.trim()]) {
      if (lists[newListName.trim()]) {
        alert("A list with this name already exists.");
      }
      return;
    }

    const name = newListName.trim();
    setLists((prev) => ({
      ...prev,
      [name]: [],
    }));
    setSelectedListName(name);
    setNewListName("");
    setIsAddDialogOpen(false);
  };

  // Delete a list
  const handleDeleteList = (name: string) => {
    if (!confirm(`Are you sure you want to delete the list "${name}"?`)) return;

    const newListNames = Object.keys(lists).filter((n) => n !== name);
    const newLists = { ...lists };
    delete newLists[name];

    setLists(newLists);

    if (selectedListName === name) {
      setSelectedListName(newListNames.length > 0 ? newListNames[0] : null);
    }
  };

  // Handle updates from the TodoList component
  const handleListUpdate = (updatedTodos: Todo[]) => {
    if (!selectedListName) return;

    setLists((prev) => ({
      ...prev,
      [selectedListName]: updatedTodos,
    }));
  };

  if (!isClient) return <div>Loading...</div>;

  const currentTodos = selectedListName ? lists[selectedListName] || [] : [];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Any Bingo</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Management Sidebar */}
        <div className="space-y-4">
          <div className="space-y-2">
            {Object.keys(lists).length === 0 && (
              <p className="text-sm text-muted-foreground">
                No lists created yet.
              </p>
            )}
            {Object.keys(lists).map((name) => (
              <Card
                key={name}
                className={`cursor-pointer transition-all ${
                  selectedListName === name
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedListName(name)}
              >
                <CardContent className="flex items-center justify-between">
                  <span className="font-medium">{name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground cursor-pointer hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(name);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Add List Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger className="flex -flex-row gap-2 items-center border border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50">
              <Plus className="h-4 w-4 mr-2" />
              New List
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Bingo List</DialogTitle>
                <CardDescription>
                  Give your list a unique name to get started.
                </CardDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="List Name (e.g., Work, Personal)"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateList}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col gap-2 w-full min-w-200">
          {/* Active List View */}
          <div className="lg:col-span-2">
            {selectedListName ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedListName}</span>
                    <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {currentTodos.length} items
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex flex-row items-center gap-3 w-full justify-between">
                      {showBingo ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBingo(false)}
                          disabled={currentTodos.length < 24}
                          className="cursor-pointer"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBingo(true)}
                          disabled={currentTodos.length < 24}
                          className="cursor-pointer"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Bingo
                        </Button>
                      )}
                      <ShareBingoButton
                        todos={currentTodos}
                        listName={selectedListName || "My List"}
                      />
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Inside the CardHeader of the active list view in TodoListManager */}
                  {showBingo ? (
                    <BingoCard
                      items={currentTodos}
                      onBack={() => setShowBingo(false)}
                    />
                  ) : (
                    // ... existing TodoList render ...
                    <TodoList
                      items={currentTodos}
                      onChange={handleListUpdate}
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center text-center p-8 border-dashed">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No List Selected</h3>
                <p className="text-muted-foreground max-w-sm mb-4">
                  Select an existing list from the sidebar or create a new one
                  to start managing your tasks.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New List
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
