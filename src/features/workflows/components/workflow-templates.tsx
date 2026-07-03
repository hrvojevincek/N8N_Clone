"use client";

import { Badge } from "@/components/ui/badge";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { LockIcon, MousePointer2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateWorkflowFromTemplate } from "../hooks/use-workflows";
import { workflowTemplates, type WorkflowTemplate } from "../templates";

const TemplateCard = ({
  template,
  onUse,
  isCreating,
}: {
  template: WorkflowTemplate;
  onUse: (template: WorkflowTemplate) => void;
  isCreating: boolean;
}) => {
  return (
    <button
      type="button"
      disabled={isCreating}
      onClick={() => onUse(template)}
      className="group relative flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/50 disabled:opacity-60"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MousePointer2Icon className="size-4 text-muted-foreground" />
          {template.logos.map((logo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={logo}
              src={logo}
              alt=""
              className="size-4 object-contain"
            />
          ))}
        </div>
        {template.premium && (
          <Badge variant="secondary" className="gap-1">
            <LockIcon className="size-3" />
            Pro
          </Badge>
        )}
      </div>
      <p className="text-sm font-medium">{template.name}</p>
      <p className="text-xs text-muted-foreground">{template.description}</p>
      {template.requires.length > 0 && (
        <p className="text-[11px] text-muted-foreground/80 mt-auto">
          Needs: {template.requires.join(", ")}
        </p>
      )}
      {template.requires.length === 0 && (
        <p className="text-[11px] text-primary mt-auto">
          Runs out of the box
        </p>
      )}
    </button>
  );
};

export const WorkflowTemplatesSection = () => {
  const createFromTemplate = useCreateWorkflowFromTemplate();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null
  );

  const handleUse = (template: WorkflowTemplate) => {
    setPendingTemplateId(template.id);
    createFromTemplate.mutate(
      { templateId: template.id },
      {
        onSuccess: (data) => {
          router.push(`/workflows/${data.id}`);
        },
        onError: (error) => {
          handleError(error);
        },
        onSettled: () => {
          setPendingTemplateId(null);
        },
      }
    );
  };

  // The demo template is seeded on signup; showing it again is redundant
  const templates = workflowTemplates.filter((template) => !template.isDemo);

  return (
    <div className="space-y-3">
      {modal}
      <p className="text-sm font-medium text-muted-foreground">
        Start from a template
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={handleUse}
            isCreating={pendingTemplateId === template.id}
          />
        ))}
      </div>
    </div>
  );
};
