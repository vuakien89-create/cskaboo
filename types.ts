
export interface LessonDetails {
  topic: string;
  gradeLevel: string;
  numberOfPeriods: string;
  objectives: string;
  keyConcepts: string;
  tone: string;
  activities: string;
  creativity: string;
  verbosity: string;
}

export interface Slide {
  title: string;
  content: string[];
  speakerNotes?: string;
  visualSuggestion?: {
    suggestion: string;
    rationale: string;
  };
}
