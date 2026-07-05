"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "@/lib/types/project";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProjectActionsProps = {
  projectId: string;
  status: ProjectStatus;
};

const noRowsAffectedMessage =
  "No rows updated or deleted. The project may not exist, or RLS blocked the operation.";

export function ProjectActions({ projectId, status }: ProjectActionsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (nextStatus: ProjectStatus) => {
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from("projects")
      .update({ status: nextStatus })
      .eq("id", projectId)
      .select("id")
      .maybeSingle();

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    if (!data) {
      setError(noRowsAffectedMessage);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    router.refresh();
  };

  const deleteProject = async () => {
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { data, error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .select("id")
      .maybeSingle();

    if (deleteError) {
      setError(deleteError.message);
      setIsLoading(false);
      return;
    }

    if (!data) {
      setError(noRowsAffectedMessage);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2 justify-end">
        {status === "active" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => updateStatus("archived")}
          >
            Archive
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => updateStatus("active")}
          >
            Restore
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isLoading}
          onClick={deleteProject}
        >
          Delete
        </Button>
      </div>
      {error && <p className="text-xs text-red-500 max-w-xs text-right">{error}</p>}
    </div>
  );
}
