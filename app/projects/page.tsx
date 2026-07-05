import { ProjectsContent } from "@/components/projects/projects-content";
import { Suspense } from "react";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-2xl font-bold">Projects (RLS check)</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Logged-in users should only see rows where{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">user_id</code>{" "}
          matches their account. Create, archive, and delete test your RLS
          policies.
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        }
      >
        <ProjectsContent />
      </Suspense>
    </div>
  );
}
