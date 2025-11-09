"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { Credential } from "@/generated/prisma/client";
import { CredentialType } from "@/generated/prisma/enums";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => (
        <CredentialItem key={credential.id} data={credential} />
      )}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="Credentials"
      description="Create and manage your credentials"
      newButtonHref="/credentials/new"
      newButtonLabel="New Credential"
      disabled={disabled}
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      page={credentials.data.page}
      totalPages={credentials.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
      disabled={credentials.isFetching}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="Loading credentials..." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Error loading credentials..." />;
};

const CredentialsEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/credentials/new`);
  };

  return (
    <EmptyView
      message="No credentials found. Get started by creating a new credential."
      onNew={handleCreate}
    />
  );
};

type CredentialListItem = Pick<
  Credential,
  "id" | "name" | "type" | "createdAt" | "updatedAt"
>;

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.GEMINI]: "/logos/gemini.svg",
};

export const CredentialItem = ({ data }: { data: CredentialListItem }) => {
  const { mutateAsync: removeCredential, isPending } = useRemoveCredential();

  const handleRemove = async () => {
    await removeCredential({ id: data.id });
  };

  const logo = credentialLogos[data.type];

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} width={20} height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={isPending}
    />
  );
};
