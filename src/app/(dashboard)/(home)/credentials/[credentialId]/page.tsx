interface PageProps {
  params: {
    credentialId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { credentialId } = await params;
  return <div>credentials ID: {credentialId}</div>;
};

export default Page;
