type AreaFieldsProps = {
  area?: {
    id: string;
    name: string;
    description: string | null;
    color: string;
  };
};

export function AreaFields({ area }: AreaFieldsProps) {
  return (
    <div className="space-y-4">
      {area?.id ? <input type="hidden" name="id" value={area.id} /> : null}
      <div className="space-y-1.5">
        <label
          htmlFor={`area-name-${area?.id ?? "new"}`}
          className="text-sm font-medium text-[color:var(--app-text)]"
        >
          Name
        </label>
        <input
          id={`area-name-${area?.id ?? "new"}`}
          name="name"
          required
          defaultValue={area?.name ?? ""}
          className="app-input"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor={`area-description-${area?.id ?? "new"}`}
          className="text-sm font-medium text-[color:var(--app-text)]"
        >
          Description
        </label>
        <textarea
          id={`area-description-${area?.id ?? "new"}`}
          name="description"
          rows={3}
          defaultValue={area?.description ?? ""}
          className="app-textarea"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor={`area-color-${area?.id ?? "new"}`}
          className="text-sm font-medium text-[color:var(--app-text)]"
        >
          Color
        </label>
        <input
          id={`area-color-${area?.id ?? "new"}`}
          type="color"
          name="color"
          defaultValue={area?.color ?? "#1f7a78"}
          className="h-12 w-full rounded-[0.95rem] border border-[color:var(--app-border-soft)] bg-[color:var(--app-surface-muted)] px-2 py-2 text-sm focus:border-[color:var(--app-blue)] focus:ring-[color:var(--app-blue-soft)]"
        />
      </div>
    </div>
  );
}
