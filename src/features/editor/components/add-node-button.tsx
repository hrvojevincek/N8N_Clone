"use client";

import { NodeSelector } from "@/components/node-selector";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";

export const AddNodeButton = memo(() => {
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
      <Button variant="outline" size="icon" className="bg-background">
        <PlusIcon className="size-4" />
      </Button>
    </NodeSelector>
  );
});

AddNodeButton.displayName = "AddNodeButton";
