import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return <div>workflows</div>;
};

export default Page;
