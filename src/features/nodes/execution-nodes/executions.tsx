"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { executions } from "@/db/schema";
import { ExecutionStatus } from "@/db/enums";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { useSuspenseExecutions } from "../../executions/hooks/use-executions";
import { useExecutionsParams } from "../../executions/hooks/use-executions-params";

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();

  type ExecutionListItem = React.ComponentProps<typeof ExecutionItem>["data"];

  const items = executions.data.items as ExecutionListItem[];

  return (
    <EntityList
      items={items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => (
        <ExecutionItem key={execution.id} data={execution} />
      )}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = () => {
  return (
    <EntityHeader
      title="Executions"
      description="View your workflow executions history"
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      page={executions.data.page}
      totalPages={executions.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
      disabled={executions.isFetching}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions..." />;
};

const ExecutionsEmpty = () => {
  return (
    <EmptyView message="No executions found. Get started by creating a new workflow." />
  );
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 animate-spin text-blue-600" />;
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600 stroke-2" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600 stroke-2" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

export const ExecutionItem = ({
  data,
}: {
  data: typeof executions.$inferSelect & {
    workflow: { name: string; id: string };
  };
}) => {
  const duration = data.completedAt
    ? Math.round(
        (new Date(data.completedAt).getTime() -
          new Date(data.startedAt).getTime()) /
          1000
      )
    : null;

  const subtitle = (
    <>
      {data.workflow.name} &bull; Started{" "}
      {formatDistanceToNow(data.startedAt, { addSuffix: true })}
      {duration !== null && <> &bull; Duration {duration}s</>}
    </>
  );

  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
    />
  );
};
