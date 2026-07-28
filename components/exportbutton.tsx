"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Share2, Check, Loader2 } from "lucide-react";
import { Todo } from "@/components/todo";
import { saveRecord } from "@/actions/redis";

interface ShareBingoButtonProps {
  todos: Todo[];
  listName: string;
}

export function ShareBingoButton({ todos, listName }: ShareBingoButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleShare = useCallback(async () => {
    if (todos.length === 0) return;

    setLoading(true);
    try {
      // Create an object with both data and name
      const shareObject = {
        data: todos,
        name: listName,
      };

      // 1. Save to Redis instead of localStorage
      const storedRecord = await saveRecord<{ data: Todo[]; name: string }>(
        shareObject,
      );

      // 2. Update URL parameter with the Redis ID (6-character NanoID)
      const params = new URLSearchParams(searchParams.toString());
      params.set("data", storedRecord.id); // Use the Redis ID instead of compressed data

      // Remove the old list parameter if it exists
      params.delete("list");

      // Replace the URL without reloading
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, "", newUrl);

      // 3. Copy to clipboard
      const fullUrl = window.location.origin + newUrl;
      await navigator.clipboard.writeText(fullUrl);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to share:", error);
    } finally {
      setLoading(false);
    }
  }, [todos, listName, searchParams, router]);

  return (
    <Button
      onClick={handleShare}
      disabled={loading || todos.length === 0}
      variant="outline"
      className="relative overflow-hidden cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Compressing...
        </>
      ) : copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied to Clipboard!
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Share via Link
        </>
      )}
    </Button>
  );
}
