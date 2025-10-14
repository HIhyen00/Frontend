export interface Post {
    id: number;
    title: string;
    content: string;
    image: string;
    nickname: string;
    profileImage: string;
    accountId: number;
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    hashtags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface PostRequest {
    title: string;
    content: string;
    image?: string;
    hashtags?: string[];
}

export interface PostsResponse {
    content: Post[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
}
