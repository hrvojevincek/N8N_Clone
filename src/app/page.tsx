import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

export default async function Home() {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="text-sm">{JSON.stringify(data, null, 2)}</div>
      <h1>Protected route</h1>
    </div>
  );
}
