export interface QuestionRow {
  id: string;
  type: string;
  count: number;
  marks: number;
  showDropdown: boolean;
}

export function createQuestionRow(type = "Multiple Choice Questions"): QuestionRow {
  return {
    id: Math.random().toString(36).slice(2),
    type,
    count: 4,
    marks: 1,
    showDropdown: false,
  };
}

export function createDefaultQuestionRows(): QuestionRow[] {
  return [
    { ...createQuestionRow("Multiple Choice Questions"), count: 4, marks: 1 },
    { ...createQuestionRow("Short Questions"), count: 3, marks: 2 },
    { ...createQuestionRow("Diagram/Graph-Based Questions"), count: 5, marks: 5 },
    { ...createQuestionRow("Numerical Problems"), count: 5, marks: 5 },
  ];
}
