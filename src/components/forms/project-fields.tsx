import { ProjectHealth, ProjectStatus } from "@prisma/client";

import {
  projectHealthOptions,
  projectStatusOptions,
} from "@/lib/constants";

type ProjectFieldsProps = {
  project?: {
    id: string;
    name: string;
    areaId: string | null;
    status: ProjectStatus;
    health: ProjectHealth;
    pinned: boolean;
    clientName: string | null;
    description: string | null;
    targetOutcome: string | null;
    notes: string | null;
  };
  areas: Array<{ id: string; name: string }>;
  redirectTo?: string;
};

export function ProjectFields({ project, areas, redirectTo }: ProjectFieldsProps) {
  return (
    <div className="space-y-4">
      {project?.id ? <input type="hidden" name="id" value={project.id} /> : null}
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <div className="space-y-1.5">
        <label
          htmlFor="project-name"
          className="text-sm font-medium text-[color:var(--app-text)]"
        >
          Name
        </label>
        <input
          id="project-name"
          name="name"
          required
          defaultValue={project?.name ?? ""}
          className="app-input"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="areaId" className="text-sm font-medium text-[color:var(--app-text)]">
            Area
          </label>
          <select
            id="areaId"
            name="areaId"
            defaultValue={project?.areaId ?? ""}
            className="app-select"
          >
            <option value="">No area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="project-status"
            className="text-sm font-medium text-[color:var(--app-text)]"
          >
            Status
          </label>
          <select
            id="project-status"
            name="status"
            defaultValue={project?.status ?? ProjectStatus.active}
            className="app-select"
          >
            {projectStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="project-health"
            className="text-sm font-medium text-[color:var(--app-text)]"
          >
            Health
          </label>
          <select
            id="project-health"
            name="health"
            defaultValue={project?.health ?? ProjectHealth.on_track}
            className="app-select"
          >
            {projectHealthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="app-chip px-4 py-3">
        <input
          type="checkbox"
          name="pinned"
          defaultChecked={project?.pinned ?? false}
          className="app-checkbox rounded"
        />
        <span>Pin project</span>
      </label>
      <div className="space-y-1.5">
        <label htmlFor="clientName" className="text-sm font-medium text-[color:var(--app-text)]">
          Client / Company
        </label>
        <input
          id="clientName"
          name="clientName"
          defaultValue={project?.clientName ?? ""}
          className="app-input"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="project-description"
          className="text-sm font-medium text-[color:var(--app-text)]"
        >
          Description
        </label>
        <textarea
          id="project-description"
          name="description"
          rows={3}
          defaultValue={project?.description ?? ""}
          className="app-textarea"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="targetOutcome"
          className="text-sm font-medium text-[color:var(--app-text)]"
        >
          Target outcome
        </label>
        <textarea
          id="targetOutcome"
          name="targetOutcome"
          rows={2}
          defaultValue={project?.targetOutcome ?? ""}
          className="app-textarea"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="project-notes"
          className="text-sm font-medium text-[color:var(--app-text)]"
        >
          Notes
        </label>
        <textarea
          id="project-notes"
          name="notes"
          rows={4}
          defaultValue={project?.notes ?? ""}
          className="app-textarea"
        />
      </div>
    </div>
  );
}
