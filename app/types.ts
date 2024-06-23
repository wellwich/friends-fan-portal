export interface ThreadsData {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    ipAddr: string;
    isDeleted: boolean;
}

export interface PostsData {
    postId: string;
    threadId: string;
    name: string;
    content: string;
    createdAt: string;
    id: string;
    isDeleted: boolean;
}