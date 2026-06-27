import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return parseInt(session.user.id);
}
