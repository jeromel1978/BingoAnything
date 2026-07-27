"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";

// Define the Todo type
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  /** The list of todos from the parent */
  items: Todo[];
  /** Callback to report changes back to the parent */
  onChange: (items: Todo[]) => void;
}

export function TodoList({ items, onChange }: TodoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newItemText, setNewItemText] = useState("");

  // Handle toggling completion status
  const toggleComplete = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    onChange(updatedItems);
  };

  // Start editing an item
  const startEdit = (item: Todo) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  // Save the edited item
  const saveEdit = (id: string) => {
    if (!editText.trim()) return;

    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, text: editText } : item,
    );
    onChange(updatedItems);
    setEditingId(null);
    setEditText("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // Delete an item
  const deleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    onChange(updatedItems);
  };

  // Add a new item
  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem: Todo = {
      id: crypto.randomUUID(),
      text: newItemText,
      completed: false,
    };

    onChange([...items, newItem]);
    setNewItemText("");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Add New Item Section */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
          className="flex-1"
        />
        <Button
          onClick={handleAddItem}
          size="icon"
          disabled={!newItemText.trim()}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add</span>
        </Button>
      </div>

      {/* List Section */}
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No tasks yet. Add one above!
          </p>
        )}

        {items.map((item) => (
          <Card key={item.id} className="p-0 overflow-hidden">
            <CardContent className="flex items-center gap-3 p-3">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleComplete(item.id)}
                className="h-5 w-5"
              />

              {editingId === item.id ? (
                // Editing Mode
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(item.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => saveEdit(item.id)}
                    className="h-8 w-8 text-green-600 hover:text-green-700 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelEdit}
                    className="h-8 w-8 text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                // Viewing Mode
                <div className="flex-1 flex items-center justify-between">
                  <span
                    className={`flex-1 ${
                      item.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.text}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(item)}
                      className="h-8 w-8 cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(item.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
