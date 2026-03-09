import { create } from "zustand";
import {
  BookResponse,
  BookListResponse,
  BlogResponse,
} from "@/features/home/service/home.service";

interface HomeStore {
  genres: string[];
  setGenres: (genres: string[]) => void;

  booksRecommendations: { [key: string]: BookResponse[] };
  setBooksRecommendations: (booksRecommendations: {
    [key: string]: BookResponse[];
  }) => void;

  bookLists: BookListResponse[];
  setBookLists: (bookLists: BookListResponse[]) => void;

  blogs: BlogResponse[];
  setBlogs: (blogs: BlogResponse[]) => void;

  // Clear all home data
  clearHomeData: () => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
  genres: [],
  setGenres: (genres: string[]) => set({ genres }),

  booksRecommendations: {},
  setBooksRecommendations: (booksRecommendations) =>
    set({ booksRecommendations }),

  bookLists: [],
  setBookLists: (bookLists) => set({ bookLists }),

  blogs: [],
  setBlogs: (blogs) => set({ blogs }),

  clearHomeData: () =>
    set({
      genres: [],
      booksRecommendations: {},
      bookLists: [],
      blogs: [],
    }),
}));
