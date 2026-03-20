import { create } from "zustand";
import { Book } from "../types";

interface FetchBookPayload {
  sourceId: string;
  title?: string;
  authors?: string[];
}

interface BookStore {
  currentBook: Book | null;
  setCurrentBook: (book: Book | null) => void;
  fetchBookPayload: FetchBookPayload | null;
  setFetchBookPayload: (payload: FetchBookPayload | null) => void;
}

export const useBookStore = create<BookStore>((set) => ({
  currentBook: null,
  setCurrentBook: (book: Book | null) => set({ currentBook: book }),
  fetchBookPayload: null,
  setFetchBookPayload: (payload: FetchBookPayload | null) => {
    console.log("Setting fetchBookPayload:", payload);
    set({ fetchBookPayload: payload });
  },
}));
