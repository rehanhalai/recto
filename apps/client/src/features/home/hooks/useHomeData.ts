import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHomeStore } from "@/features/home/store/home-store";
import { homeApi } from "../service/home-api";
import { getRandomGenres } from "@/config";

export const useHomeData = () => {
  const genres = useHomeStore((state) => state.genres);
  const setGenres = useHomeStore((state) => state.setGenres);
  const setBooksRecommendations = useHomeStore(
    (state) => state.setBooksRecommendations,
  );
  const setBookLists = useHomeStore((state) => state.setBookLists);
  const setBlogs = useHomeStore((state) => state.setBlogs);

  // Use ref to hold generated genres - persists across renders and is immediately available
  const genresRef = useRef<string[]>([]);

  // Determine session genres: prioritize store, then ref, then generate new
  let sessionGenres: string[];
  if (genres.length > 0) {
    // Use genres from store (from previous session or navigation)
    sessionGenres = genres;
    genresRef.current = genres;
  } else if (genresRef.current.length > 0) {
    // Use genres from ref (generated in this session but not yet in store)
    sessionGenres = genresRef.current;
  } else {
    // Generate new genres for first time
    sessionGenres = getRandomGenres(5);
    genresRef.current = sessionGenres;
    setGenres(sessionGenres); // Store for future use
  }

  const query = useQuery({
    queryKey: ["home", sessionGenres.join(",")], // Cache key includes genres
    queryFn: async () => {
      const data = await homeApi.fetchHomeData(sessionGenres);

      // Store data in Zustand for global access
      setBooksRecommendations(data.booksRecommendations);
      setBookLists(data.bookLists);
      setBlogs(data.blogs);

      return data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 60, // 1 hour - consistent during session
  });

  return query;
};
