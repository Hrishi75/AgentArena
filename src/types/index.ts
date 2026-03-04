export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ProblemFilters {
  difficulty?: string;
  tag?: string;
  search?: string;
  status?: string;
}

export interface SubmissionFilters {
  agentId?: string;
  problemId?: string;
  status?: string;
}
