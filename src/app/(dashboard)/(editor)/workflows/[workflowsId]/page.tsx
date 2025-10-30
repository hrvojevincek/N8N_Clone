import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: {
    workflowId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { workflowId } = await params;
  await requireAuth();
  return <div>workflow editor ID: {workflowId}</div>;
};

export default Page;
