import { notFound } from "next/navigation";
import { Todo } from "@/components/todo";
import { loadRecord } from "@/actions/redis";
import TodoManager from "@/components/todomanager";

type PageProps = {
  params: Promise<{ ID: string }>;
};
export default async function Page({ params }: PageProps) {
  const { ID } = await params;

  try {
    // Load data from Redis using the ID parameter
    const storedData = await loadRecord<{ data: Todo[]; name: string }>(ID);

    if (!storedData) {
      notFound();
    }

    // Pass the retrieved data to HomeContent as props
    return (
      <main>
        <TodoManager
          initialData={storedData.data}
          initialListName={storedData.name}
        />
      </main>
    );
  } catch (error) {
    console.error("Failed to load data from Redis:", error);
    notFound();
  }
}
