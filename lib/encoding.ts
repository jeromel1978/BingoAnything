import LZString from "lz-string";
import { Todo } from "@/components/todo"; // Adjust path to your Todo type

// Compresses the todo list into a URL-safe string
export const compressTodos = (
  todos: Todo[] | { data: Todo[]; name: string },
): string => {
  // If it's an object with data and name, compress that object
  if (typeof todos !== "string" && "data" in todos && "name" in todos) {
    const json = JSON.stringify(todos);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return compressed;
  }

  // Otherwise treat as regular todo array
  const json = JSON.stringify(todos);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
};

// Decompresses the string back into a Todo array or object
export const decompressTodos = (
  compressed: string,
): (Todo[] | { data: Todo[]; name: string }) | null => {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const parsed = JSON.parse(json);

    // Check if this is the new format with data and name properties
    if (
      parsed &&
      typeof parsed === "object" &&
      "data" in parsed &&
      "name" in parsed
    ) {
      // Validate that data is an array of todos
      if (Array.isArray(parsed.data)) {
        return parsed;
      }
      return null;
    }

    // Otherwise, treat as regular todo array
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch (error) {
    console.error("Failed to decompress todos:", error);
    return null;
  }
};
