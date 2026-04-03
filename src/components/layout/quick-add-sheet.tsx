"use client";

import type { ReactNode } from "react";

import { useEffect, useState } from "react";
import { FolderPlus, Layers3, Plus } from "lucide-react";

import { AreaFields } from "@/components/forms/area-fields";
import { ProjectFields } from "@/components/forms/project-fields";
import { TaskCaptureForm } from "@/components/forms/task-capture-form";
import { Button } from "@/components/ui/button";
import { RevealSheet } from "@/components/ui/reveal-sheet";
import { createAreaAction, createProjectAction } from "@/server/actions/projects";
import { createWorkItemAction, quickCaptureAction } from "@/server/actions/work-items";

type QuickAddSheetProps = {
  areas: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; projectId: string; projectName: string }>;
  tags: Array<{ id: string; name: string; color: string }>;
};

type AddType = "task" | "project" | "area";

function AddChoice({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-3.5 py-2 text-[14px] font-semibold text-[color:var(--app-blue)] transition hover:bg-[color:var(--app-surface-muted)]"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function QuickAddSheet({ areas, projects, sections, tags }: QuickAddSheetProps) {
  const [step, setStep] = useState<AddType>("task");

  useEffect(() => {
    setStep("task");
  }, []);

  return (
    <RevealSheet
      triggerAriaLabel="Quick add"
      triggerContent={<Plus className="h-6 w-6" />}
      triggerClassName="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+6rem)] right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] text-[color:var(--app-blue)] shadow-[0_10px_24px_rgba(60,60,67,0.14)] transition hover:bg-[color:var(--app-surface-muted)] md:right-8"
      title={step === "task" ? "Add" : step === "project" ? "New Project" : "New Area"}
      panelClassName="min-h-[22rem]"
    >
      <div className="space-y-4">
        {step === "task" ? (
          <>
            <TaskCaptureForm
              action={createWorkItemAction}
              fastAction={quickCaptureAction}
              projects={projects}
              sections={sections}
              tags={tags}
              titlePlaceholder="Inbox"
              submitLabel="Add"
              detailsLabel="More"
            />
            <div className="flex flex-wrap gap-2">
              <AddChoice
                icon={<FolderPlus className="h-4 w-4" />}
                label="Project"
                onClick={() => setStep("project")}
              />
              <AddChoice
                icon={<Layers3 className="h-4 w-4" />}
                label="Area"
                onClick={() => setStep("area")}
              />
            </div>
          </>
        ) : null}

        {step === "project" ? (
          <>
            <button
              type="button"
              onClick={() => setStep("task")}
              className="text-[15px] font-medium text-[color:var(--app-blue)]"
            >
              Back
            </button>
            <form action={createProjectAction} className="space-y-4">
              <ProjectFields areas={areas} />
              <Button fullWidth>Create project</Button>
            </form>
          </>
        ) : null}

        {step === "area" ? (
          <>
            <button
              type="button"
              onClick={() => setStep("task")}
              className="text-[15px] font-medium text-[color:var(--app-blue)]"
            >
              Back
            </button>
            <form action={createAreaAction} className="space-y-4">
              <AreaFields />
              <Button fullWidth variant="secondary">
                Add area
              </Button>
            </form>
          </>
        ) : null}
      </div>
    </RevealSheet>
  );
}
