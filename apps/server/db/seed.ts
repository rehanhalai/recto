import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import * as path from "path";
import { sql } from "drizzle-orm";

// ─── Environment Configuration ───────────────────────────────────────────────

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not defined!");
  process.exit(1);
}

// ─── Constants & Deterministic Setup ─────────────────────────────────────────

const NOW = new Date("2026-06-27T12:00:00Z");
const SIX_MONTHS_AGO = new Date("2026-01-01T00:00:00Z");

// Seed Faker for absolute determinism
faker.seed(42);

// Preset list of realistic book titles, subtitles, and descriptions
const PREMIUM_BOOKS_TEMPLATES = [
  {
    title: "The Silent Canopy",
    subtitle: "What the ancient trees tell us about our future",
    description: "An environmental odyssey exploring the secret communicative networks of old-growth forests and how they survive climate crises.",
    pageCount: 342,
    language: "en"
  },
  {
    title: "Echoes of the Labyrinth",
    subtitle: "A thriller in the catacombs of Paris",
    description: "When an archaeologist disappears in the forbidden zones of the Parisian underground, his daughter uncovers a secret dating back to the Templars.",
    pageCount: 412,
    language: "en"
  },
  {
    title: "Quantum Threads",
    subtitle: "How computing will redefine humanity by 2050",
    description: "A deep dive into quantum computing, qubits, and how the entanglement of technology is restructuring global economics and security.",
    pageCount: 280,
    language: "en"
  },
  {
    title: "The Clockmaker's Paradox",
    subtitle: "A story of time, love, and gears",
    description: "In 18th-century Vienna, an eccentric inventor designs a clockwork bird that can predict the futures of those who hold it, leading to a race against time.",
    pageCount: 389,
    language: "en"
  },
  {
    title: "Beyond the Event Horizon",
    subtitle: "The survival guide for deep-space colonization",
    description: "A hard science-fiction manual and narrative about the first generational starship sent to Proxima Centauri.",
    pageCount: 520,
    language: "en"
  },
  {
    title: "Verdant Horizon",
    subtitle: "Urban farming and the post-industrial city",
    description: "A comprehensive look at vertical agriculture, soil health, and how metropolitan cities can achieve food self-sufficiency.",
    pageCount: 215,
    language: "en"
  },
  {
    title: "Shadows in the Code",
    subtitle: "The rise of algorithmic warfare",
    description: "A cybersecurity expert details the quiet conflicts happening inside global grids, powered by autonomous scripts and machine learning.",
    pageCount: 310,
    language: "en"
  },
  {
    title: "The Alchemist of Prague",
    subtitle: "A historical fantasy",
    description: "In the court of Rudolf II, a young assistant discovers that the philosopher's stone is not a substance, but a language written in the stars.",
    pageCount: 460,
    language: "en"
  },
  {
    title: "Mind Palace Architecture",
    subtitle: "Mastering memory and cognitive agility",
    description: "A practical guide to the method of loci, mnemonic systems, and training the human brain to remember vast amounts of information.",
    pageCount: 198,
    language: "en"
  },
  {
    title: "Whispers of the Monsoon",
    subtitle: "A family saga across three generations in Kerala",
    description: "Set against the backwaters of southern India, this novel tracks the changing fortunes of a family running a spice plantation from 1940 to the present.",
    pageCount: 480,
    language: "en"
  },
  {
    title: "Cybernetic Oasis",
    subtitle: "Living in the virtual commons",
    description: "An sociological analysis of digital societies, virtual reality governance, and the digital divide in a hyper-connected world.",
    pageCount: 265,
    language: "en"
  },
  {
    title: "The Obsidian Throne",
    subtitle: "Book One of the Shattered Kingdoms",
    description: "Epic high fantasy detailing the political struggles, betrayals, and magic systems of a land whose sun has begun to freeze.",
    pageCount: 612,
    language: "en"
  },
  {
    title: "Deceptive Simplicity",
    subtitle: "The art of minimalistic design",
    description: "How the world's most successful products use restraint, whitespace, and human-centric design to create intuitive user interfaces.",
    pageCount: 176,
    language: "en"
  },
  {
    title: "Under a Freezing Sun",
    subtitle: "Tales from the Arctic research stations",
    description: "A collection of journals and interviews from scientists living in extreme isolation on the Greenland ice sheet.",
    pageCount: 295,
    language: "en"
  },
  {
    title: "The Cartographer's Daughter",
    subtitle: "Charting the uncharted islands of the Pacific",
    description: "An adventure novel set in the age of discovery, where a young woman completes her father's maps using a legacy navigation technique.",
    pageCount: 330,
    language: "en"
  }
];

function generateGenericBookTemplate(index: number) {
  const subject = faker.helpers.arrayElement(["Galactic", "Midnight", "Lost", "Forgotten", "Stellar", "Ancient", "Cryptic", "Invisible", "Hollow"]);
  const object = faker.helpers.arrayElement(["Empire", "Chronicles", "Labyrinth", "Prophecy", "Code", "Paradox", "Legacy", "Ocean", "Mirror"]);
  const title = `${subject} ${object} Vol. ${Math.floor(index / 10) + 1}`;
  return {
    title,
    subtitle: faker.helpers.arrayElement([
      "A journey into the unknown",
      "Unlocking the secrets of the past",
      "The definitive guide",
      "A modern exploration",
      undefined
    ]),
    description: faker.lorem.paragraph({ min: 2, max: 4 }),
    pageCount: faker.number.int({ min: 120, max: 750 }),
    language: faker.helpers.arrayElement(["en", "en", "en", "es", "fr"])
  };
}

// ─── Main Seeding Execution ──────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting high-performance database seeding process...");

  const queryClient = postgres(connectionString as string, { max: 1 });
  const db = drizzle(queryClient, { schema });

  try {
    await db.transaction(async (tx) => {
      // 1. Truncate all tables
      console.log("🧹 Truncating existing tables...");
      await tx.execute(sql`
        TRUNCATE TABLE 
          post_comment_likes,
          post_comments,
          post_likes,
          posts,
          review_likes,
          book_reviews,
          book_list_items,
          book_lists,
          added_books,
          sessions,
          followers,
          blogs,
          otps,
          users,
          book_genres,
          book_authors,
          genres,
          books
        CASCADE;
      `);
      console.log("✅ Tables truncated successfully.");

      // 2. Seed Genres (15 records)
      console.log("🌱 Seeding genres...");
      const GENRES_LIST = [
        { name: "Fiction", slug: "fiction" },
        { name: "Fantasy", slug: "fantasy" },
        { name: "Science Fiction", slug: "science-fiction" },
        { name: "Mystery & Thriller", slug: "mystery-thriller" },
        { name: "Romance", slug: "romance" },
        { name: "Biography & Memoir", slug: "biography-memoir" },
        { name: "History", slug: "history" },
        { name: "Self-Help", slug: "self-help" },
        { name: "Business & Economics", slug: "business-economics" },
        { name: "Science & Technology", slug: "science-technology" },
        { name: "Poetry", slug: "poetry" },
        { name: "Drama & Plays", slug: "drama-plays" },
        { name: "Young Adult", slug: "young-adult" },
        { name: "Graphic Novels & Comics", slug: "graphic-novels-comics" },
        { name: "Children's Books", slug: "childrens-books" }
      ];

      const genresData = await tx.insert(schema.genres).values(GENRES_LIST).returning();
      console.log(`✅ Seeded ${genresData.length} genres.`);

      // 3. Seed Books (60 records)
      console.log("📚 Seeding books...");
      const booksToInsert: any[] = [];

      for (let i = 0; i < 60; i++) {
        const template = i < PREMIUM_BOOKS_TEMPLATES.length 
          ? PREMIUM_BOOKS_TEMPLATES[i] 
          : generateGenericBookTemplate(i);

        const source = i % 5 === 0 ? "open_library" : (i % 12 === 0 ? "manual" : "google_books");
        const sourceId = source === "google_books" 
          ? faker.string.alphanumeric({ length: 12, casing: "mixed" })
          : source === "open_library"
            ? `OL${faker.number.int({ min: 100000, max: 999999 })}W`
            : `manual_${faker.string.alphanumeric({ length: 8 })}`;

        const releaseYear = faker.number.int({ min: 1980, max: 2026 });
        const releaseDate = faker.helpers.arrayElement([
          `${releaseYear}`,
          `${releaseYear}-${String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0')}`,
          `${releaseYear}-${String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0')}-${String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0')}`
        ]);

        booksToInsert.push({
          sourceId,
          source,
          title: template.title,
          subtitle: template.subtitle || null,
          releaseDate,
          description: template.description || null,
          pageCount: template.pageCount || null,
          language: template.language || "en",
          isbn13: faker.helpers.arrayElement([faker.string.numeric({ length: 13 }), null]),
          coverImage: `https://picsum.photos/seed/book_${i}/300/450`,
          averageRating: "0.00",
          ratingsCount: 0,
          createdAt: faker.date.between({ from: SIX_MONTHS_AGO, to: NOW }),
          updatedAt: NOW
        });
      }

      const booksData = await tx.insert(schema.books).values(booksToInsert).returning();
      console.log(`✅ Seeded ${booksData.length} books.`);

      // 4. Seed Book Authors & Book Genres
      console.log("✍️ Seeding authors and linking book genres...");
      const bookAuthorsToInsert: any[] = [];
      const bookGenresToInsert: any[] = [];

      for (const book of booksData) {
        const numAuthors = faker.number.int({ min: 1, max: 10 }) > 8 ? 2 : 1;
        for (let j = 0; j < numAuthors; j++) {
          bookAuthorsToInsert.push({
            bookId: book.id,
            authorName: faker.person.fullName()
          });
        }

        const numGenres = faker.number.int({ min: 1, max: 3 });
        const selectedGenres = faker.helpers.arrayElements(genresData, numGenres);
        for (const gen of selectedGenres) {
          bookGenresToInsert.push({
            bookId: book.id,
            genreId: gen.id
          });
        }
      }

      await tx.insert(schema.bookAuthors).values(bookAuthorsToInsert);
      await tx.insert(schema.bookGenres).values(bookGenresToInsert);
      console.log(`✅ Seeded book authors and book-genre relationships.`);

      // 5. Seed Users (40 records)
      console.log("👤 Seeding users (generating password hashes synchronously)...");
      const usersToInsert: any[] = [];
      const plainPassword = "password123";
      const hashedPassword = bcrypt.hashSync(plainPassword, 10);

      for (let i = 0; i < 40; i++) {
        const userName = `${faker.internet.username()}${i}`.toLowerCase().replace(/[^a-z0-9_]/g, "");
        const role = "user";
        const isVerified = faker.number.int({ min: 1, max: 10 }) > 6;
        const fullName = faker.person.fullName();

        const userCreatedAt = faker.date.between({ from: SIX_MONTHS_AGO, to: new Date("2026-05-01T00:00:00Z") });

        usersToInsert.push({
          userName,
          fullName,
          email: `${userName}@example.com`,
          googleId: i % 7 === 0 ? `google_${faker.string.uuid()}` : null,
          hashedPassword,
          bio: i % 5 === 4 ? null : faker.lorem.sentence({ min: 5, max: 15 }).slice(0, 300),
          avatarImage: `https://picsum.photos/seed/${userName}/150/150`,
          avatarPublicId: `avatar_${faker.string.alphanumeric(8)}`,
          coverImage: `https://picsum.photos/seed/${userName}_cover/1200/400`,
          coverPublicId: `cover_${faker.string.alphanumeric(8)}`,
          role,
          isVerified,
          followerCount: 0,
          followingCount: 0,
          createdAt: userCreatedAt,
          updatedAt: userCreatedAt
        });
      }

      const usersData = await tx.insert(schema.users).values(usersToInsert).returning();
      console.log(`✅ Seeded ${usersData.length} users.`);

      // Only keeping active and inactive users as requested
      const activeUsers = usersData.slice(0, 33);
      const inactiveUsers = usersData.slice(33, 40); // empty profiles

      // 6. Seed Followers & Followings
      console.log("🤝 Seeding follower network (respecting self-follow and unique constraints)...");
      const followersToInsert: any[] = [];
      const followerPairs = new Set<string>();

      for (const user of activeUsers) {
        // Active users follow a random set of other active users
        const potentialFollowing = activeUsers.filter(u => u.id !== user.id);
        const numFollowing = faker.number.int({ min: 2, max: 15 }); // Increased max to ensure a dense network without influencers
        const followingSelected = faker.helpers.arrayElements(potentialFollowing, numFollowing);

        for (const target of followingSelected) {
          const pairKey = `${user.id}->${target.id}`;
          if (!followerPairs.has(pairKey)) {
            followerPairs.add(pairKey);
            followersToInsert.push({
              followerId: user.id,
              followingId: target.id,
              createdAt: faker.date.between({ from: user.createdAt > target.createdAt ? user.createdAt : target.createdAt, to: NOW })
            });
          }
        }
      }

      if (followersToInsert.length > 0) {
        await tx.insert(schema.followers).values(followersToInsert);
      }
      console.log(`✅ Seeded ${followersToInsert.length} follower relationships.`);

      // 7. Seed Shelf Books (addedBooks)
      console.log("📖 Seeding user bookshelves (addedBooks)...");
      const addedBooksToInsert: any[] = [];
      const addedBooksSet = new Set<string>();

      for (const user of activeUsers) {
        const numBooks = faker.number.int({ min: 10, max: 30 });
        const booksSelected = faker.helpers.arrayElements(booksData, numBooks);

        for (const book of booksSelected) {
          const key = `${user.id}->${book.id}`;
          if (addedBooksSet.has(key)) continue;
          addedBooksSet.add(key);

          const rand = faker.number.int({ min: 1, max: 100 });
          let status: "wishlist" | "reading" | "finished" = "wishlist";
          if (rand > 40 && rand <= 60) status = "reading";
          else if (rand > 60) status = "finished";

          let startedAt: Date | null = null;
          let finishedAt: Date | null = null;

          const dateAdded = faker.date.between({ from: user.createdAt, to: NOW });

          if (status === "finished") {
            startedAt = faker.date.between({ from: dateAdded, to: new Date(dateAdded.getTime() + 15 * 24 * 60 * 60 * 1000 > NOW.getTime() ? NOW.getTime() : dateAdded.getTime() + 15 * 24 * 60 * 60 * 1000) });
            finishedAt = faker.date.between({ from: startedAt, to: NOW });
          } else if (status === "reading") {
            startedAt = faker.date.between({ from: dateAdded, to: NOW });
          }

          addedBooksToInsert.push({
            userId: user.id,
            bookId: book.id,
            status,
            startedAt,
            finishedAt,
            createdAt: dateAdded,
            updatedAt: NOW
          });
        }
      }

      const addedBooksData = await tx.insert(schema.addedBooks).values(addedBooksToInsert).returning();
      console.log(`✅ Seeded ${addedBooksData.length} books in user bookshelves.`);

      // 8. Seed Book Reviews
      console.log("⭐ Seeding book reviews & ratings...");
      const bookReviewsToInsert: any[] = [];
      const reviewSet = new Set<string>();
      
      const finishedAddedBooks = addedBooksData.filter(ab => ab.status === "finished");
      
      for (const ab of finishedAddedBooks) {
        if (faker.number.int({ min: 1, max: 10 }) <= 8) {
          const key = `${ab.userId}->${ab.bookId}`;
          if (reviewSet.has(key)) continue;
          reviewSet.add(key);

          const rating = faker.helpers.weightedArrayElement([
            { weight: 1, value: 1 },
            { weight: 2, value: 2 },
            { weight: 5, value: 3 },
            { weight: 15, value: 4 },
            { weight: 10, value: 5 }
          ]);

          const content = faker.helpers.arrayElement([
            "Absolutely loved this book! The characters were deep and the plot was incredibly engaging.",
            "A masterpiece of its genre. The author really knows how to build suspense.",
            "Pretty good read, although the middle section was a bit slow. Recommended.",
            "I had high expectations but it fell a little short for me. Good writing, but the pacing felt off.",
            "One of the best books I've read this year! Highly recommend it to anyone who likes a good story.",
            "Not really my cup of tea. Found it hard to connect with the protagonist.",
            "Beautifully written. I could not put it down and read it in a single sitting!",
            "Thought-provoking and beautifully crafted. I'll be thinking about this ending for a long time.",
            null
          ]);

          bookReviewsToInsert.push({
            userId: ab.userId,
            bookId: ab.bookId,
            content,
            rating,
            containsSpoilers: content ? (faker.number.int({ min: 1, max: 10 }) === 10) : false,
            likesCount: 0,
            createdAt: ab.finishedAt || ab.createdAt,
            updatedAt: ab.finishedAt || ab.createdAt
          });
        }
      }

      const readingAddedBooks = addedBooksData.filter(ab => ab.status === "reading");
      for (const ab of readingAddedBooks.slice(0, 15)) {
        const key = `${ab.userId}->${ab.bookId}`;
        if (reviewSet.has(key)) continue;
        reviewSet.add(key);

        const rating = faker.number.int({ min: 2, max: 5 });
        bookReviewsToInsert.push({
          userId: ab.userId,
          bookId: ab.bookId,
          content: `Currently reading. I'm about halfway through and it's quite fascinating. Pacing is great!`,
          rating,
          containsSpoilers: false,
          likesCount: 0,
          createdAt: ab.startedAt || ab.createdAt,
          updatedAt: ab.startedAt || ab.createdAt
        });
      }

      const reviewsData = await tx.insert(schema.bookReviews).values(bookReviewsToInsert).returning();
      console.log(`✅ Seeded ${reviewsData.length} book reviews.`);

      // 9. Seed Review Likes
      console.log("👍 Seeding review likes...");
      const reviewLikesToInsert: any[] = [];
      const reviewLikeSet = new Set<string>();

      for (const review of reviewsData) {
        const potentialLikers = activeUsers.filter(u => u.id !== review.userId);
        const numLikes = faker.number.int({ min: 0, max: Math.min(potentialLikers.length, 12) });
        const likers = faker.helpers.arrayElements(potentialLikers, numLikes);

        for (const liker of likers) {
          const key = `${review.id}->${liker.id}`;
          if (reviewLikeSet.has(key)) continue;
          reviewLikeSet.add(key);

          reviewLikesToInsert.push({
            reviewId: review.id,
            userId: liker.id,
            createdAt: faker.date.between({ from: review.createdAt, to: NOW })
          });
        }
      }

      if (reviewLikesToInsert.length > 0) {
        await tx.insert(schema.reviewLikes).values(reviewLikesToInsert);
      }
      console.log(`✅ Seeded ${reviewLikesToInsert.length} review likes.`);

      // 10. Seed Book Lists & List Items
      console.log("📁 Seeding curated book lists...");
      const bookListsToInsert: any[] = [];
      const listTemplates = [
        { name: "Must-Read Classics", desc: "A selection of historical classics that shaped literature." },
        { name: "Best of Science Fiction", desc: "Mind-bending futuristic tech and interstellar journeys." },
        { name: "Cosy Bedtime Reads", desc: "Soft, engaging, and slow-paced books for your nightstand." },
        { name: "Mind Hack & Growth", desc: "Productivity, psychology, and personal masteries." },
        { name: "Summer Page Turners", desc: "Fun, fast, and exciting mysteries to read on the beach." }
      ];

      const listCreators = activeUsers.slice(0, 10);
      let listIdx = 0;
      for (const user of listCreators) {
        const numLists = faker.number.int({ min: 1, max: 2 });
        for (let l = 0; l < numLists; l++) {
          const t = listTemplates[listIdx % listTemplates.length];
          const listName = `${user.fullName}'s ${t.name}`;
          bookListsToInsert.push({
            userId: user.id,
            name: listName,
            description: `${t.desc} Selected by ${user.fullName}.`,
            isPublic: faker.number.int({ min: 1, max: 10 }) > 1, 
            bookCount: 0,
            createdAt: faker.date.between({ from: user.createdAt, to: NOW }),
            updatedAt: NOW
          });
          listIdx++;
        }
      }

      const listsData = await tx.insert(schema.bookLists).values(bookListsToInsert).returning();
      console.log(`✅ Seeded ${listsData.length} book lists.`);

      const bookListItemsToInsert: any[] = [];
      const listItemsSet = new Set<string>();

      for (const list of listsData) {
        const numBooks = faker.number.int({ min: 4, max: 12 });
        const booksSelected = faker.helpers.arrayElements(booksData, numBooks);

        for (const book of booksSelected) {
          const key = `${list.id}->${book.id}`;
          if (listItemsSet.has(key)) continue;
          listItemsSet.add(key);

          bookListItemsToInsert.push({
            listId: list.id,
            bookId: book.id,
            addedAt: faker.date.between({ from: list.createdAt, to: NOW })
          });
        }
      }

      await tx.insert(schema.bookListItems).values(bookListItemsToInsert);
      console.log(`✅ Seeded ${bookListItemsToInsert.length} items across lists.`);

      // 11. Seed Posts
      console.log("📝 Seeding social posts...");
      const postsToInsert: any[] = [];
      
      const postContentsTemplates = [
        "Just finished reading this chapter. Wow, simply blown away by the depth of the world-building!",
        "Can anyone recommend a really gripping mystery thriller? I need something I can't put down.",
        "Here's my reading list for the weekend. What is everyone else working through?",
        "Unpopular opinion: the book was much better paced in the first half than the second.",
        "Decided to spend my Sunday afternoon drinking coffee and diving deep into a new novel.",
        "Struggling to get through this book. Does the plot pick up at all in the later chapters?",
        "I love the way this author writes about nature. It feels so vivid and alive.",
        "Finally hit my reading challenge goal for the month! 🎉"
      ];

      for (const user of activeUsers) {
        const numPosts = faker.number.int({ min: 2, max: 8 });
        for (let p = 0; p < numPosts; p++) {
          const linkBook = faker.number.int({ min: 1, max: 100 }) <= 45;
          const bookId = linkBook ? faker.helpers.arrayElement(booksData).id : null;
          const content = faker.helpers.arrayElement(postContentsTemplates) + (bookId ? " #reading #books" : " #daily");

          postsToInsert.push({
            authorId: user.id,
            bookId,
            content: content.slice(0, 500),
            image: faker.number.int({ min: 1, max: 10 }) > 8 ? `https://picsum.photos/seed/post_${user.id}_${p}/800/600` : null,
            likesCount: 0,
            commentsCount: 0,
            createdAt: faker.date.between({ from: user.createdAt, to: NOW }),
            updatedAt: NOW
          });
        }
      }

      const postsData = await tx.insert(schema.posts).values(postsToInsert).returning();
      console.log(`✅ Seeded ${postsData.length} posts.`);

      // 12. Seed Post Likes
      console.log("❤️ Seeding post likes...");
      const postLikesToInsert: any[] = [];
      const postLikeSet = new Set<string>();

      for (const post of postsData) {
        const potentialLikers = usersData.filter(u => u.id !== post.authorId && !inactiveUsers.find(i => i.id === u.id));
        const numLikes = faker.number.int({ min: 0, max: Math.min(potentialLikers.length, 18) });
        const likers = faker.helpers.arrayElements(potentialLikers, numLikes);

        for (const liker of likers) {
          const key = `${post.id}->${liker.id}`;
          if (postLikeSet.has(key)) continue;
          postLikeSet.add(key);

          postLikesToInsert.push({
            postId: post.id,
            userId: liker.id,
            createdAt: faker.date.between({ from: post.createdAt, to: NOW })
          });
        }
      }

      if (postLikesToInsert.length > 0) {
        const chunkSize = 250;
        for (let i = 0; i < postLikesToInsert.length; i += chunkSize) {
          await tx.insert(schema.postLikes).values(postLikesToInsert.slice(i, i + chunkSize));
        }
      }
      console.log(`✅ Seeded ${postLikesToInsert.length} post likes.`);

      // 13. Seed Post Comments (including nested replies)
      console.log("💬 Seeding post comments...");
      const postCommentsToInsert: any[] = [];
      const commentResponses = [
        "Awesome review!",
        "I totally agree with this.",
        "Added to my reading shelf right away!",
        "Really? I had a very different experience with this one.",
        "Yes! That specific chapter was magnificent.",
        "Spot on analysis. Thanks for sharing.",
        "Agreed. The character arcs were superb.",
        "I'll have to read this next!"
      ];

      for (const post of postsData) {
        const potentialCommenters = usersData.filter(u => u.id !== post.authorId && !inactiveUsers.find(i => i.id === u.id));
        const numComments = faker.number.int({ min: 0, max: 4 });
        const commenters = faker.helpers.arrayElements(potentialCommenters, numComments);

        for (const commenter of commenters) {
          postCommentsToInsert.push({
            userId: commenter.id,
            postId: post.id,
            parentId: null,
            content: faker.helpers.arrayElement(commentResponses),
            likesCount: 0,
            createdAt: faker.date.between({ from: post.createdAt, to: NOW }),
            updatedAt: NOW
          });
        }
      }

      let insertedTopLevelComments: any[] = [];
      if (postCommentsToInsert.length > 0) {
        insertedTopLevelComments = await tx.insert(schema.postComments).values(postCommentsToInsert).returning();
      }

      const repliesToInsert: any[] = [];
      if (insertedTopLevelComments.length > 0) {
        for (const comment of insertedTopLevelComments) {
          if (faker.number.int({ min: 1, max: 10 }) <= 3) {
            const potentialRepliers = usersData.filter(u => u.id !== comment.userId && !inactiveUsers.find(i => i.id === u.id));
            const replier = faker.helpers.arrayElement(potentialRepliers);

            repliesToInsert.push({
              userId: replier.id,
              postId: comment.postId,
              parentId: comment.id,
              content: faker.helpers.arrayElement(["Absolutely!", "Well said.", "I'm not so sure about that.", "Fair point."]),
              likesCount: 0,
              createdAt: faker.date.between({ from: comment.createdAt, to: NOW }),
              updatedAt: NOW
            });
          }
        }
      }

      let insertedReplies: any[] = [];
      if (repliesToInsert.length > 0) {
        insertedReplies = await tx.insert(schema.postComments).values(repliesToInsert).returning();
      }

      const allComments = [...insertedTopLevelComments, ...insertedReplies];
      console.log(`✅ Seeded ${allComments.length} comments.`);

      // 14. Seed Comment Likes
      console.log("👍 Seeding post comment likes...");
      const commentLikesToInsert: any[] = [];
      const commentLikeSet = new Set<string>();

      for (const comment of allComments) {
        const potentialLikers = usersData.filter(u => u.id !== comment.userId && !inactiveUsers.find(i => i.id === u.id));
        const numLikes = faker.number.int({ min: 0, max: Math.min(potentialLikers.length, 5) });
        const likers = faker.helpers.arrayElements(potentialLikers, numLikes);

        for (const liker of likers) {
          const key = `${comment.id}->${liker.id}`;
          if (commentLikeSet.has(key)) continue;
          commentLikeSet.add(key);

          commentLikesToInsert.push({
            commentId: comment.id,
            userId: liker.id,
            createdAt: faker.date.between({ from: comment.createdAt, to: NOW })
          });
        }
      }

      if (commentLikesToInsert.length > 0) {
        await tx.insert(schema.postCommentLikes).values(commentLikesToInsert);
      }
      console.log(`✅ Seeded ${commentLikesToInsert.length} post comment likes.`);

      // 15. Seed Blogs (8 records)
      console.log("📰 Seeding blog articles...");
      const blogsToInsert: any[] = [];
      // Using some active users as blog authors since there are no admins/moderators
      const blogAuthorsList = activeUsers.slice(0, 5);
      
      const blogTemplates = [
        { title: "Top 10 Books That Defined Sci-Fi", slug: "top-10-books-defined-sci-fi" },
        { title: "Why physical books are making a comeback", slug: "physical-books-comeback" },
        { title: "Building a consistent reading habit in 2026", slug: "building-reading-habit" },
        { title: "Understanding the narrative arc in modern fiction", slug: "understanding-narrative-arc" },
        { title: "The rise of indie publishers and self-publishing", slug: "rise-of-indie-publishers" },
        { title: "Exploring magical realism: A beginner's guide", slug: "exploring-magical-realism" },
        { title: "How reading reduces stress according to studies", slug: "reading-reduces-stress" },
        { title: "An interview with contemporary novelists", slug: "interview-contemporary-novelists" }
      ];

      for (let i = 0; i < blogTemplates.length; i++) {
        const template = blogTemplates[i];
        const author = faker.helpers.arrayElement(blogAuthorsList);
        const createdAt = faker.date.between({ from: author.createdAt, to: NOW });
        
        blogsToInsert.push({
          authorId: author.id,
          title: template.title,
          slug: template.slug,
          coverImage: `https://picsum.photos/seed/blog_${i}/800/450`,
          content: `## Introduction\n\n${faker.lorem.paragraphs(2)}\n\n## Deep Dive\n\n${faker.lorem.paragraphs(3)}\n\n## Conclusion\n\n${faker.lorem.paragraphs(1)}`,
          isPublished: i < 6,
          createdAt,
          updatedAt: NOW
        });
      }

      await tx.insert(schema.blogs).values(blogsToInsert);
      console.log(`✅ Seeded ${blogsToInsert.length} blog articles.`);

      // 16. Seed Sessions & OTPs
      console.log("🔑 Seeding sessions and OTP records...");
      const sessionsToInsert: any[] = [];
      for (const user of activeUsers.slice(0, 15)) {
        sessionsToInsert.push({
          userId: user.id,
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          ipAddress: faker.internet.ip(),
          expiresAt: new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000),
          createdAt: faker.date.between({ from: user.createdAt, to: NOW })
        });
        sessionsToInsert.push({
          userId: user.id,
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)",
          ipAddress: faker.internet.ip(),
          expiresAt: new Date(NOW.getTime() - 24 * 60 * 60 * 1000),
          createdAt: faker.date.between({ from: user.createdAt, to: new Date(NOW.getTime() - 8 * 24 * 60 * 60 * 1000) })
        });
      }
      await tx.insert(schema.sessions).values(sessionsToInsert);

      const otpsToInsert: any[] = [];
      for (let i = 0; i < 10; i++) {
        otpsToInsert.push({
          email: `user_otp_${i}@example.com`,
          hashedCode: bcrypt.hashSync(faker.string.numeric({ length: 6 }), 4),
          hashedPassword: null,
          expiresAt: i < 5 ? new Date(NOW.getTime() + 15 * 60 * 1000) : new Date(NOW.getTime() - 15 * 60 * 1000)
        });
      }
      await tx.insert(schema.otps).values(otpsToInsert);
      console.log("✅ Seeded sessions and OTPs.");

      // ─── High-Performance Bulk Updates (Reconciling Caches) ───────────────────
      console.log("⚡ Executing database-side bulk update reconciliations...");

      // A. Reconcile follower counts on users
      console.log("📊 Bulk updating user follower/following counts...");
      await tx.execute(sql`
        UPDATE users u
        SET 
          follower_count = COALESCE(f.followers, 0),
          following_count = COALESCE(f.following, 0)
        FROM (
          SELECT 
            u.id,
            (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers,
            (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following
          FROM users u
        ) f
        WHERE u.id = f.id;
      `);

      // B. Reconcile review likes count
      console.log("📊 Bulk updating review likes count...");
      await tx.execute(sql`
        UPDATE book_reviews br
        SET likes_count = COALESCE(l.cnt, 0)
        FROM (
          SELECT review_id, COUNT(*) as cnt
          FROM review_likes
          GROUP BY review_id
        ) l
        WHERE br.id = l.review_id;
      `);

      // C. Reconcile book ratings and count
      console.log("📊 Bulk updating book average ratings and review counts...");
      await tx.execute(sql`
        UPDATE books b
        SET 
          average_rating = COALESCE(r.avg_rating, 0.00),
          ratings_count = COALESCE(r.cnt, 0)
        FROM (
          SELECT 
            book_id,
            ROUND(AVG(rating), 2)::numeric(3,2) as avg_rating,
            COUNT(*) as cnt
          FROM book_reviews
          GROUP BY book_id
        ) r
        WHERE b.id = r.book_id;
      `);

      // D. Reconcile book lists book count
      console.log("📊 Bulk updating book list book counts...");
      await tx.execute(sql`
        UPDATE book_lists bl
        SET book_count = COALESCE(i.cnt, 0)
        FROM (
          SELECT list_id, COUNT(*) as cnt
          FROM book_list_items
          GROUP BY list_id
        ) i
        WHERE bl.id = i.list_id;
      `);

      // E. Reconcile comment likes
      console.log("📊 Bulk updating comment likes counts...");
      await tx.execute(sql`
        UPDATE post_comments pc
        SET likes_count = COALESCE(l.cnt, 0)
        FROM (
          SELECT comment_id, COUNT(*) as cnt
          FROM post_comment_likes
          GROUP BY comment_id
        ) l
        WHERE pc.id = l.comment_id;
      `);

      // F. Reconcile post commentsCount
      console.log("📊 Bulk updating post comments counts...");
      await tx.execute(sql`
        UPDATE posts p
        SET comments_count = COALESCE(c.cnt, 0)
        FROM (
          SELECT post_id, COUNT(*) as cnt
          FROM post_comments
          GROUP BY post_id
        ) c
        WHERE p.id = c.post_id;
      `);

      // G. Reconcile post likesCount
      console.log("📊 Bulk updating post likes counts...");
      await tx.execute(sql`
        UPDATE posts p
        SET likes_count = COALESCE(l.cnt, 0)
        FROM (
          SELECT post_id, COUNT(*) as cnt
          FROM post_likes
          GROUP BY post_id
        ) l
        WHERE p.id = l.post_id;
      `);

      console.log("✅ All bulk cache updates completed successfully.");
    });

    console.log("🎉 Database seeding completed successfully! All constraints and dependencies satisfied.");
  } catch (error) {
    console.error("❌ Database seeding failed! Rolling back changes.", error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

main().catch((err) => {
  console.error("❌ Seeding script crashed:", err);
  process.exit(1);
});
