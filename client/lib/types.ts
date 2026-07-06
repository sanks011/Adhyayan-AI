export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timeLimit: number;
}

// Lightweight per-node quiz/flashcard shapes returned by the mind-map node endpoints
export interface NodeQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface Participant {
  userId: string;
  userName: string;
  avatar?: string;
  joinedAt: Date;
  score: number;
  correctAnswers: number;
  averageResponseTime: number;
  isReady: boolean;
  currentAnswer?: number;
  answerTime?: number;
}

export interface Room {
  roomCode: string;
  roomName: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hostId: string;
  hostName: string;
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
  status: 'waiting' | 'active' | 'completed';
  questions: QuizQuestion[];
  participants: Participant[];
  currentQuestionIndex: number;
  questionStartTime?: Date;
  questionEndTime?: Date;
  createdAt: Date;
  winner?: string;
  settings: {
    questionCount: number;
    timePerQuestion: number;
    showExplanations: boolean;
  };
}

export interface QuizAnswer {
  participantId: string;
  questionId: string;
  selectedAnswer: number;
  responseTime: number;
  isCorrect: boolean;
  score: number;
}

export interface RoomState {
  room: Room;
  currentQuestion?: QuizQuestion;
  timeRemaining: number;
  leaderboard: Participant[];
  allAnswered: boolean;
}