import type { ReactNode } from "react";

export interface TutorialSlideData {
    id: string;
    title: string;
    description: string;
    icon?: ReactNode;
    highlight?: string;
}
