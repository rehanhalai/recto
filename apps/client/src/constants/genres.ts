export interface GenreMetadata {
  id: string;
  title: string;
  subtitle: string;
}

export const BOOK_GENRES: GenreMetadata[] = [
  { id: "fiction", title: "Fiction Top Picks", subtitle: "Imaginative Worlds" },
  { id: "science", title: "Science & Tech", subtitle: "Expand Your Mind" },
  { id: "history", title: "Historical Reads", subtitle: "Uncover the Past" },
  { id: "philosophy", title: "Philosophy & Thought", subtitle: "Deep Dive" },
  { id: "biography", title: "Biographies", subtitle: "Life Stories" },
  { id: "fantasy", title: "Fantasy & Magic", subtitle: "Epic Adventures" },
  { id: "mystery", title: "Mystery & Crime", subtitle: "Unsolve the Puzzle" },
  { id: "romance", title: "Romance", subtitle: "Heartfelt Stories" },
  { id: "thriller", title: "Thrillers", subtitle: "Edge of Your Seat" },
  { id: "psychology", title: "Psychology", subtitle: "Understand the Mind" },
  { id: "business", title: "Business & Finance", subtitle: "Grow Your Wealth" },
  { id: "technology", title: "Technology", subtitle: "Future is Now" },
  { id: "art", title: "Art & Design", subtitle: "Visual Inspiration" },
  {
    id: "religion",
    title: "Religion & Spirituality",
    subtitle: "Faith and Belief",
  },
  { id: "travel", title: "Travel", subtitle: "Explore the World" },
  { id: "cooking", title: "Cooking & Food", subtitle: "Culinary Delights" },
  { id: "health", title: "Health & Wellness", subtitle: "Mind and Body" },
  { id: "self-help", title: "Self-Help", subtitle: "Personal Growth" },
  { id: "poetry", title: "Poetry", subtitle: "Verse and Rhythm" },
  {
    id: "classics",
    title: "Classic Literature",
    subtitle: "Timeless Masterpieces",
  },
];
