import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

import { BottomNav } from "@/components/layout/bottom-nav";
import { QuickAddSheet } from "@/components/layout/quick-add-sheet";
import { TopBar } from "@/components/layout/top-bar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getCurrentUser } from "@/lib/auth";
import { getWorkspaceScaffold } from "@/lib/data";
import { getThemeScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Work Tracker",
  description: "Track work, plan your day, and log focus sessions.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Work Tracker",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#007aff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const dynamic = "force-dynamic";

const swScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const scaffold = currentUser ? await getWorkspaceScaffold() : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
        <ThemeProvider>
          {scaffold ? (
            <>
              <TopBar />
              <main className="mx-auto min-h-screen max-w-5xl px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(env(safe-area-inset-top,0px)+4.5rem)] md:px-6 md:pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pt-[calc(env(safe-area-inset-top,0px)+5rem)]">
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
