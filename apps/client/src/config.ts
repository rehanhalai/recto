export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
};

export const getRandomGenres = (count: number = 5): string[] => {
  const genres = [
    "Fiction",
    "Mystery",
    "Thriller",
    "Science Fiction",
    "Fantasy",
    "Romance",
    "Historical Fiction",
    "Horror",
    "Non-Fiction",
    "Biography",
    "History",
    "Philosophy",
    "Psychology",
    "Poetry",
    "Classics",
    "Business",
  ];

  // Shuffle array and return the requested count
  const shuffled = [...genres].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
