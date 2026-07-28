"use client";
import HomeContent from "@/app/home";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
export default function PageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <Page />
    </Suspense>
  );
}
function Page() {
  const params = useSearchParams();
  const data = params.get("data");
  const name = params.get("name");
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <HomeContent data={data} name={name} />
    </Suspense>
  );
}
