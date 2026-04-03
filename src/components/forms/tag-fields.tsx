export function TagFields() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="tag-name" className="text-sm font-medium text-[color:var(--app-text)]">
          Tag name
        </label>
        <input
          id="tag-name"
          name="name"
          required
          className="app-input"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="tag-color" className="text-sm font-medium text-[color:var(--app-text)]">
          Tag color
        </label>
        <input
          id="tag-color"
          type="color"
          name="color"
          defaultValue="#d6a859"
          className="h-12 w-full rounded-[0.95rem] border border-[color:var(--app-border-soft)] bg-[color:var(--app-surface-muted)] px-2 py-2 text-sm focus:border-[color:var(--app-blue)] focus:ring-[color:var(--app-blue-soft)]"
        />
      </div>
    </div>
  );
}
