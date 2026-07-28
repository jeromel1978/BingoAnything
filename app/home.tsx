"use client";

import { useEffect, useState } from "react";
import { TodoListManager } from "@/components/todomanager";
import { decompressTodos } from "@/lib/encoding";
import { Todo } from "@/components/todo";

type HomeProps = {
  data?: string | null;
  name?: string | null;
};
export default function HomeContent({ data, name }: HomeProps) {
  const [initialData, setInitialData] = useState<Todo[] | null>(null);
  const [initialListName, setInitialListName] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side to prevent SSR issues
    if (typeof window !== "undefined") {
      if (data) {
        const decoded = decompressTodos(data);
        if (decoded) {
          setInitialData(decoded);
          setInitialListName(name || "Shared List");
        }
      }
    }
  }, [data, name]);

  // Auto-save to localStorage when we have initial data
  useEffect(() => {
    if (initialData && initialListName && typeof window !== "undefined") {
      const stored = localStorage.getItem("my-todo-app-lists");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed[initialListName]) {
          parsed[initialListName] = initialData;
          localStorage.setItem("my-todo-app-lists", JSON.stringify(parsed));
        }
      } else {
        const newList = { [initialListName]: initialData };
        localStorage.setItem("my-todo-app-lists", JSON.stringify(newList));
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
