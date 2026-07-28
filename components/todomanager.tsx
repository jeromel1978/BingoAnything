"use client";

import { useState, useEffect } from "react";
import { TodoList, Todo } from "@/components/todo";
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
import { Plus, Trash2, FolderOpen, List } from "lucide-react";
import { Sparkles } from "lucide-react";
import { BingoCard } from "@/components/bingo";
import { ShareBingoButton } from "@/components/exportbutton";
import { IndexedDBVars } from "@/lib/vars";
import {
  Accordion,
  AccordionTrigger,
  AccordionItem,
  AccordionContent,
} from "./ui/accordion";

interface TodoListsData {
  [listName: string]: Todo[];
}

// Define the props interface
interface TodoListManagerProps {
  initialData?: Todo[] | null;
  initialListName?: string | null;
}

export default function TodoListManager({
  initialData,
  initialListName,
}: TodoListManagerProps) {
  const [lists, setLists] = useState<TodoListsData>({});
  const [selectedListName, setSelectedListName] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [showBingo, setShowBingo] = useState(false);

  // Initialize state from IndexedDB on mount
  useEffect(() => {
    setIsClient(true);

    // Only run this on client side to avoid Node.js issues
    if (typeof window === "undefined") return;

    const loadFromIndexedDB = () => {
      try {
        // Check if IndexedDB is available
        if (!window.indexedDB) {
          console.warn("IndexedDB is not supported");
          setLists({});
          return;
        }

        const request = indexedDB.open(
          IndexedDBVars.DB_NAME,
          IndexedDBVars.VERSION,
        );

        request.onerror = () => {
          console.error("Failed to open IndexedDB");
          // Fallback to empty lists
          setLists({});
        };

        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(
            [IndexedDBVars.STORE_NAME],
            "readonly",
          );
          const objectStore = transaction.objectStore(IndexedDBVars.STORE_NAME);

          const getAllRequest = objectStore.getAll();

          getAllRequest.onsuccess = () => {
            const allLists = getAllRequest.result;

            // Convert to lists object
            const loadedLists: TodoListsData = {};
            allLists.forEach((list) => {
              if (list.name && list.data) {
                loadedLists[list.name] = list.data;
              }
            });

            setLists(loadedLists);

            // If we have initial data, add it to the bottom
            if (initialData && initialListName) {
              const newLists = { ...loadedLists };
              newLists[initialListName] = initialData;
              setLists(newLists);
              setSelectedListName(initialListName);
            }
          };

          transaction.oncomplete = () => {
            db.close();
          };
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(IndexedDBVars.STORE_NAME)) {
            const objectStore = db.createObjectStore(IndexedDBVars.STORE_NAME, {
              keyPath: "name",
            });
            objectStore.createIndex("name", "name", { unique: true });
          }
        };
      } catch (error) {
        console.error("Failed to load from IndexedDB:", error);
        setLists({});
      }
    };

    loadFromIndexedDB();
  }, [initialData, initialListName]);

  // Save to IndexedDB whenever lists change
  useEffect(() => {
    if (!isClient || Object.keys(lists).length === 0) return;

    // Only run this on client side to avoid Node.js issues
    if (typeof window === "undefined") return;

    const saveToIndexedDB = () => {
      try {
        // Check if IndexedDB is available
        if (!window.indexedDB) {
          console.warn("IndexedDB is not supported");
          return;
        }

        const request = indexedDB.open(
          IndexedDBVars.DB_NAME,
          IndexedDBVars.VERSION,
        );

        request.onerror = () => {
          console.error("Failed to open IndexedDB for saving");
        };

        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(
            [IndexedDBVars.STORE_NAME],
            "readwrite",
          );
          const objectStore = transaction.objectStore(IndexedDBVars.STORE_NAME);

          // First, clear all existing data
          const clearRequest = objectStore.clear();

          clearRequest.onsuccess = () => {
            // Then add all current lists
            Object.entries(lists).forEach(([name, data]) => {
              objectStore.add({
                name,
                data,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            });
          };

          transaction.oncomplete = () => {
            db.close();
          };
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(IndexedDBVars.STORE_NAME)) {
            const objectStore = db.createObjectStore(IndexedDBVars.STORE_NAME, {
              keyPath: "name",
            });
            objectStore.createIndex("name", "name", { unique: true });
          }
        };
      } catch (error) {
        console.error("Failed to save to IndexedDB:", error);
      }
    };

    saveToIndexedDB();
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
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 max-h-dvh">
      <header className="flex justify-center w-full">
        <h1 className="text-3xl font-bold">BINGO Anything</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 w-full h-full">
        {/* List Management Sidebar */}
        <Accordion>
          <AccordionItem>
            <AccordionTrigger className="cursor-pointer">
              Cards
            </AccordionTrigger>
            <AccordionContent className="p-1">
              <div className="space-y-4">
                <div className="space-y-2">
                  {Object.keys(lists).length === 0 && (
                    <p className="text-sm text-muted-foreground text-nowrap">
                      No BINGO cards created yet.
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
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger className="flex -flex-row gap-2 items-center border border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50 text-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    New BINGO Card
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Bingo Card</DialogTitle>
                      <CardDescription>
                        Give your BINGO card a unique name to get started.
                      </CardDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="List Name (e.g., Work, Personal)"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCreateList()
                        }
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex flex-col gap-2 w-full">
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
                          <List className="h-4 w-4 mr-2" />
                          BINGO Card List
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
                          Generate BINGO
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
                  {showBingo ? (
                    <BingoCard
                      items={currentTodos}
                      onBack={() => setShowBingo(false)}
                    />
                  ) : (
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
                  Select an existing BINGO card from the sidebar or create a new
                  one to start managing your tasks.
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New BINGO Card
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
