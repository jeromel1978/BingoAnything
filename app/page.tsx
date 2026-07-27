"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { TodoListManager } from "@/components/todomanager";
import { decompressTodos } from "@/lib/encoding";
import { Todo } from "@/components/todo";

export default function Home() {
  const searchParams = useSearchParams();
  const [initialData, setInitialData] = useState<Todo[] | null>(null);
  const [initialListName, setInitialListName] = useState<string | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    const nameParam = searchParams.get("list");

    if (dataParam) {
      const decoded = decompressTodos(dataParam);
      if (decoded) {
        setInitialData(decoded);
        setInitialListName(nameParam || "Shared List");
      }
    }
  }, [searchParams]);

  // If we have initial data from the URL, we might want to pass it down
  // or handle it inside TodoListManager.
  // Since TodoListManager manages its own localStorage, we can either:
  // 1. Pre-fill localStorage with this data on load.
  // 2. Pass it as a prop to override the selected list.

  // Option 1: Auto-save to localStorage and select it
  useEffect(() => {
    if (initialData && initialListName) {
      // Check if this list already exists in localStorage to avoid duplicates
      const stored = localStorage.getItem("my-todo-app-lists");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed[initialListName]) {
          parsed[initialListName] = initialData;
          localStorage.setItem("my-todo-app-lists", JSON.stringify(parsed));
          // Force a reload or update the manager state if needed
          // For simplicity, we reload the page to let the manager pick it up
          window.location.reload();
        }
      } else {
        const newList = { [initialListName]: initialData };
        localStorage.setItem("my-todo-app-lists", JSON.stringify(newList));
        window.location.reload();
      }
    }
  }, [initialData, initialListName]);

  if (initialData && !initialListName) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading shared list...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <TodoListManager />
    </main>
  );
}
