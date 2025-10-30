import { Button } from "@/components/ui/button";
import { caller } from "@/trpc/server";

export default async function Home() {
  const users = await caller.getUsers();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Button>Click me</Button>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
