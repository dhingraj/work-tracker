import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Card className="border-dashed border-[color:var(--app-border-soft)] text-center">
      <div className="mx-auto max-w-sm space-y-2">
        <p className="text-base font-semibold text-[color:var(--app-text)]">{title}</p>
        {description ? (
          <p className="text-sm text-[color:var(--app-text-secondary)]">{description}</p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <div className="mt-4">
          <Link href={actionHref}>
            <Button variant="secondary" type="button">
              {actionLabel}
            </Button>
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
