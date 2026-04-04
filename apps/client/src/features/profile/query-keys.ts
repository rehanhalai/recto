export const profileKeys = {
  all: ["profile"] as const,
  detail: (username: string) =>
    [...profileKeys.all, "detail", username] as const,
  posts: (userId: string) => [...profileKeys.all, userId, "posts"] as const,
  reading: (userId: string) => [...profileKeys.all, userId, "reading"] as const,
  readingByStatus: (userId: string, status: "reading" | "finished") =>
    [...profileKeys.reading(userId), status] as const,
  lists: (userId: string) => [...profileKeys.all, userId, "lists"] as const,
  relations: (username: string, mode: "followers" | "following") =>
    [...profileKeys.all, username, "relations", mode] as const,
};
