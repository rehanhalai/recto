import type { Metadata } from "next";
import { UserProfilePage } from "@/features/profile/components/user-profile-page";
import { config } from "@/config";

type UserProfileRouteProps = {
  params: Promise<{
    username: string;
  }>;
};

type ProfilePayload = {
  data?: {
    user?: SeoProfileUser;
  };
};

type SeoProfileUser = {
  userName?: string | null;
  fullName?: string | null;
  bio?: string | null;
  avatarImage?: string | null;
  followerCount?: number;
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://recto.social";

const fetchProfileForSeo = async (
  username: string,
): Promise<SeoProfileUser | null> => {
  const endpoint = `${config.apiUrl}/user/profile?userName=${encodeURIComponent(username)}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ProfilePayload;
    return payload.data?.user || null;
  } catch {
    return null;
  }
};

const truncate = (value: string, max = 160): string => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}...`;
};

export async function generateMetadata({
  params,
}: UserProfileRouteProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfileForSeo(username);

  const displayName =
    profile?.fullName?.trim() || profile?.userName?.trim() || username;
  const bio =
    profile?.bio?.trim() ||
    `Read ${displayName}'s profile on Recto, including shelves, reviews, lists, and reading activity.`;
  const description = truncate(bio);
  const canonicalPath = `/${username}`;

  return {
    title: `${displayName} | Recto Profile`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    keywords: [
      `${displayName} profile`,
      "reader profile",
      "book reviews",
      "reading shelves",
      "Recto",
    ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${displayName} | Recto Profile`,
      description,
      type: "profile",
      url: `${siteUrl}${canonicalPath}`,
      siteName: "Recto",
      images: profile?.avatarImage
        ? [{ url: profile.avatarImage, alt: `${displayName} avatar` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} | Recto Profile`,
      description,
      images: profile?.avatarImage ? [profile.avatarImage] : undefined,
    },
  };
}

export default async function UserProfileRoute({
  params,
}: UserProfileRouteProps) {
  const { username } = await params;
  const profile = await fetchProfileForSeo(username);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.fullName || profile?.userName || username,
    alternateName: profile?.userName || username,
    description: profile?.bio || undefined,
    image: profile?.avatarImage || undefined,
    url: `${siteUrl}/${username}`,
    interactionStatistic:
      typeof profile?.followerCount === "number"
        ? {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/FollowAction",
            userInteractionCount: profile.followerCount,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <UserProfilePage username={username} />
    </>
  );
}
