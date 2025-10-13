export interface Question {
    id: number;
    userId: number;
    title: string;
    content: string;
    category?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    likeCount: number;
    answerCount: number;
    popularityScore: number;
}

export interface Answer {
    id: number;
    questionId: number;
    userId: number;
    content: string | null;
    isPrivate: boolean;
    status: string;
    upvoteCount: number;
    downvoteCount: number;
    reportCount: number;
    createdAt: string;
    updatedAt: string;
}