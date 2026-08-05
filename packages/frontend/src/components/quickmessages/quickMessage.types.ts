export type QuickMessage = {
    id: string;
    name: string;
    message: string;
    brokerId: string;
    createdAt: string;
};

export type QuickMessageForm = {
    name: string;
    message: string;
};