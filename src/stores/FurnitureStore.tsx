import create from "zustand";
import { getCategoriesRequest, getCategoryInfo } from "../api/api-client";

export interface Category {
    _id: string;
    name: string;
    visible: boolean;
}

export interface FurnitureData {
    _id?: string;
    name?: string;
    width: number;
    height: number;
    imagePath: string;
    category?: string;
    zIndex?: number;
}

export interface FurnitureStore {
    categories: Category[];
    currentFurnitureData: FurnitureData[];
    getCategories: () => Promise<void>;
    getCurrentFurnitureData: (categoryId: string) => Promise<void>;
    error?: string;
    loading: boolean;
}

export const useFurnitureStore = create<FurnitureStore>((set) => ({
    categories: [],
    currentFurnitureData: [],
    loading: false,
    error: undefined,

    getCategories: async () => {
        set({ loading: true, error: undefined });
        try {
            const response = await getCategoriesRequest();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const res: Category[] = await response.json();
            set({ 
                categories: res,
                loading: false 
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch categories',
                loading: false 
            });
            console.error("Error fetching categories:", error);
        }
    },

    getCurrentFurnitureData: async (categoryId: string) => {
        set({ loading: true, error: undefined });
        try {
            const response = await getCategoryInfo(categoryId);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const res: FurnitureData[] = await response.json();
            set({ 
                currentFurnitureData: res,
                loading: false 
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch furniture data',
                loading: false 
            });
            console.error("Error fetching furniture data:", error);
        }
    }
}));