import { CreateProjectForm } from "@/components/projects/create-project-form";
import { ProjectActions } from "@/components/projects/project-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/project";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function ProjectsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, user_id, name, status")
    .order("name", { ascending: true });

  return (
    <>
      <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-start">
        <InfoIcon size="16" strokeWidth={2} className="mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p>
            Signed in as{" "}
            <span className="font-mono text-xs">{user.email}</span>
          </p>
          <p>
            Your user ID:{" "}
            <span className="font-mono text-xs break-all">{user.id}</span>
          </p>
          <p className="text-muted-foreground">
            Rows from other users should not appear here if SELECT policy uses{" "}
            <code className="text-xs">auth.uid() = user_id</code>.
          </p>
        </div>
      </div>

      <CreateProjectForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your projects</CardTitle>
          <CardDescription>
            {error
              ? "Query failed — check RLS policies and table schema."
              : `${projects?.length ?? 0} row(s) returned by SELECT.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-red-500 font-mono">{error.message}</p>
          ) : !projects?.length ? (
            <p className="text-sm text-muted-foreground">
              No projects yet. Create one above, or insert a row in SQL Editor
              with your user ID.
            </p>
          ) : (
            <ul className="divide-y">
              {(projects as Project[]).map((project) => (
                <li
                  key={project.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{project.name}</span>
                      <Badge
                        variant={
                          project.status === "active" ? "default" : "secondary"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      id: {project.id}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      user_id: {project.user_id}
                      {project.user_id === user.id ? (
                        <span className="text-foreground ml-2">(you)</span>
                      ) : (
                        <span className="text-red-500 ml-2">
                          (unexpected — RLS leak?)
                        </span>
                      )}
                    </p>
                  </div>
                  <ProjectActions
                    projectId={project.id}
                    status={project.status}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Not signed in?{" "}
        <Link href="/auth/login" className="underline underline-offset-4">
          Sign in
        </Link>{" "}
        first. SQL Editor inserts bypass RLS; use this page to verify app access.
      </p>
    </>
  );
}
