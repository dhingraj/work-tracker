import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

import { BottomNav } from "@/components/layout/bottom-nav";
import { QuickAddSheet } from "@/components/layout/quick-add-sheet";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getCurrentUser } from "@/lib/auth";
import { getWorkspaceScaffold } from "@/lib/data";
import { getThemeScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Work Tracker",
  description: "A mobile-friendly work tracker for calendar planning, execution, lightweight time logging, and daily review.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const scaffold = currentUser ? await getWorkspaceScaffold() : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
        <ThemeProvider>
          {scaffold ? (
            <>
              <main className="mx-auto min-h-screen max-w-5xl px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] md:px-6 md:pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pt-[calc(env(safe-area-inset-top,0px)+2rem)]">
                <div className="page-grid">{children}</div>
              </main>
              <QuickAddSheet
                areas={scaffold.areas.map((area) => ({
                  id: area.id,
                  name: area.name,
                }))}
                projects={scaffold.projects.map((project) => ({
                  id: project.id,
                  name: project.name,
                }))}
                sections={scaffold.sections.map((section) => ({
                  id: section.id,
                  name: section.name,
                  projectId: section.projectId,
                  projectName: section.projectName,
                }))}
                tags={scaffold.tags.map((tag) => ({
                  id: tag.id,
                  name: tag.name,
                  color: tag.color,
                }))}
              />
              <BottomNav />
            </>
          ) : (
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
