export interface AggregatedItem {
  Id: string;
  RecruiterId: number | string;
  WorkflowId: number | null;
  AgencyId?: number | null;
  DateCreated: string;
  SurveySent?: number;
  Responses?: number;
  View?: number;
  Starts?: number;
  AverageTime?: number;
  AverageScore?: number;
  InitialQuestion: InitialQuestion;
  QuestionData?: { [Key: string]: string | number | (string | number[]) }[] | null;
}

export interface InitialQuestion {
  Question?: string;
  Answer?: string;
  Score?: number | null;
}
