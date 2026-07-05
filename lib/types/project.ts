export type ProjectStatus = "active" | "archived";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  status: ProjectStatus;
};
