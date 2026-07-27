import LZString from "lz-string";
import { Todo } from "@/components/todo"; // Adjust path to your Todo type

// Compresses the todo list into a URL-safe string
export const compressTodos = (todos: Todo[]): string => {
  const json = JSON.stringify(todos);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
};

// Decompresses the string back into a Todo array
export const decompressTodos = (compressed: string): Todo[] | null => {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const parsed = JSON.parse(json) as Todo[];

    // Basic validation to ensure it's an array of objects
    if (!Array.isArray(parsed)) return null;

    return parsed;
  } catch (error) {
    console.error("Failed to decompress todos:", error);
    return null;
  }
};
