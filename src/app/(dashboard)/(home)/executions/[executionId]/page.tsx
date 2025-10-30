import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: {
    executionId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { executionId } = await params;
  await requireAuth();
  return <div>execution ID: {executionId}</div>;
};

export default Page;
