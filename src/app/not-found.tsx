import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <section className="grouped-section max-w-md text-center">
        <div className="grouped-row grouped-row-start justify-center">
          <div className="w-full space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--app-text-tertiary)]">
              Missing
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--app-text)]">
              That page does not exist.
            </h1>
            <p className="text-sm text-[color:var(--app-text-secondary)]">
              The item you tried to open was not found in this workspace.
            </p>
          </div>
        </div>
        <div className="border-t border-[color:var(--app-border-soft)] p-4">
          <Link href="/">
            <Button type="button">Back home</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
