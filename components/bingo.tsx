"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Check, X } from "lucide-react";
import { Todo } from "@/components/todo"; // Assuming Todo type is exported from your previous file

interface BingoCardProps {
  items: Todo[];
  onBack: () => void;
}

// Helper to shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function BingoCard({ items, onBack }: BingoCardProps) {
  // We need 24 items to fill the card (25 slots - 1 free space)
  const MIN_ITEMS_REQUIRED = 24;
  const GRID_SIZE = 5;
  const TOTAL_SLOTS = GRID_SIZE * GRID_SIZE;

  // State to track which squares are marked on the bingo card
  // Key is the index (0-24), Value is boolean
  const [markedSquares, setMarkedSquares] = useState<Record<number, boolean>>(
    {},
  );

  // Prepare the 24 random items + free space
  const gridItems = useMemo(() => {
    if (items.length < MIN_ITEMS_REQUIRED) return null;

    // Shuffle and take the first 24
    const shuffled = shuffleArray(items).slice(0, MIN_ITEMS_REQUIRED);

    // Create the 25-item grid, inserting "FREE SPACE" at index 12 (row 2, col 2)
    const grid: (Todo | { id: string; text: string; isFree: true })[] = [];
    let itemIndex = 0;

    for (let i = 0; i < TOTAL_SLOTS; i++) {
      if (i === 12) {
        grid.push({ id: "free-space", text: "FREE SPACE", isFree: true });
      } else {
        grid.push(shuffled[itemIndex]);
        itemIndex++;
      }
    }
    return grid;
  }, [items]);

  const toggleSquare = (index: number) => {
    setMarkedSquares((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const regenerateCard = () => {
    setMarkedSquares({});
    // Force a re-render of the grid by toggling a key or just relying on the shuffle logic
    // Since gridItems depends on items, and items haven't changed, we need to force a re-shuffle.
    // We can do this by adding a "seed" or just re-shuffling inside a useEffect if needed.
    // For simplicity, we'll just re-run the shuffle logic by adding a random key to the component
    // or simply re-calling the shuffle.
    // Actually, since gridItems is useMemo with [items], it won't re-run.
    // We need a state to force the shuffle.
    setSeed((prev) => prev + 1);
  };

  const [seed, setSeed] = useState(0);

  // Re-calculate grid with seed to force shuffle
  const finalGrid = useMemo(() => {
    if (items.length < MIN_ITEMS_REQUIRED) return null;

    // Combine items with seed to get different shuffle
    const shuffled = shuffleArray(items).slice(0, MIN_ITEMS_REQUIRED);
    const grid: (Todo | { id: string; text: string; isFree: true })[] = [];
    let itemIndex = 0;

    for (let i = 0; i < TOTAL_SLOTS; i++) {
      if (i === 12) {
        grid.push({ id: "free-space", text: "FREE SPACE", isFree: true });
      } else {
        grid.push(shuffled[itemIndex]);
        itemIndex++;
      }
    }
    return grid;
  }, [items, seed]);

  // Check for Bingo (Rows, Cols, Diagonals)
  const checkBingo = () => {
    const indices = Array.from({ length: 25 }, (_, i) => i);
    const lines: number[][] = [];

    // Rows
    for (let r = 0; r < GRID_SIZE; r++) {
      lines.push(indices.filter((i) => Math.floor(i / GRID_SIZE) === r));
    }
    // Cols
    for (let c = 0; c < GRID_SIZE; c++) {
      lines.push(indices.filter((i) => i % GRID_SIZE === c));
    }
    // Diagonals
    lines.push([0, 6, 12, 18, 24]);
    lines.push([4, 8, 12, 16, 20]);

    // return lines.some((line) => line.every((idx) => markedSquares[idx]));
    const isMarked = (idx: number) => idx === 12 || markedSquares[idx];
    return lines.some((line) => line.every(isMarked));
  };

  const hasBingo = checkBingo();

  if (items.length < MIN_ITEMS_REQUIRED) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Not Enough Items</CardTitle>
          <CardDescription className="text-center">
            You need at least {MIN_ITEMS_REQUIRED} items to generate a Bingo
            card. Currently you have {items.length}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={onBack}>Back to List</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={regenerateCard}
          variant="secondary"
          className="cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Shuffle
        </Button>
        {hasBingo && (
          <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 text-lg px-4 py-1 animate-pulse">
            BINGO!
          </Badge>
        )}
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Bingo Card
          </CardTitle>
          <CardDescription>Mark squares to find a line!</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div
            className="grid grid-cols-5 gap-2"
            style={{ aspectRatio: "1 / 1" }}
          >
            {finalGrid &&
              finalGrid.map((item, index) => {
                const isFree = "isFree" in item && item.isFree;
                const isMarked = markedSquares[index];

                return (
                  <div
                    key={`${index}-${isFree ? "free" : item.id}`}
                    onClick={() => !isFree && toggleSquare(index)}
                    className={`
                    relative flex flex-col items-center justify-center p-2 text-center rounded-md border-2 cursor-pointer transition-all select-none
                    ${
                      isMarked
                        ? "bg-primary text-primary-foreground border-primary shadow-inner"
                        : "bg-muted hover:bg-muted/80 border-border"
                    }
                    ${isFree ? "bg-yellow-100 border-yellow-400 text-yellow-800" : ""}
                    ${!isFree ? "hover:scale-[1.02]" : ""}
                  `}
                  >
                    {isMarked && !isFree && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Check className="h-8 w-8 opacity-20" />
                      </div>
                    )}

                    <span
                      className={`text-xs font-medium leading-tight ${isMarked ? "opacity-100" : "opacity-90"}`}
                    >
                      {item.text}
                    </span>

                    {isFree && (
                      <span className="absolute bottom-1 right-1 text-[10px] opacity-50">
                        FREE
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        {hasBingo
          ? "Congratulations! You have a Bingo!"
          : "Tap any square (except Free Space) to mark it."}
      </div>
    </div>
  );
}
