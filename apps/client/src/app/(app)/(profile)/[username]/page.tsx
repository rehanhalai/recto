import { UserProfilePage } from "@/features/profile/components/user-profile-page";

type UserProfileRouteProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserProfileRoute({ params }: UserProfileRouteProps) {
  const { username } = await params;

  return <UserProfilePage username={username} />;
}