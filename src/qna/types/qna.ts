export interface Question {
    id: number;
    userId: number;
    title: string;
    content: string;
    category: string;
    status: 'OPEN' | 'CLOSED' | 'BLINDED' | 'DELETED';
    createdAt: string;
    updatedAt: string;
    stats?: QuestionStat;
}

export interface QuestionStat {
    viewCount: number;
    likeCount: number;
    answerCount: number;
    popularityScore: number;
}

export interface Answer {
    id: number;
    questionId: number;
    userId: number;
    content: string;
    isPrivate: boolean;
    status: 'VISIBLE' | 'BLINDED' | 'DELETED';
    upvoteCount: number;
    downvoteCount: number;
    reportCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface VoteRequest {
    type: 'UP' | 'DOWN';
}

export interface ReportRequest {
    reason: string;
}
