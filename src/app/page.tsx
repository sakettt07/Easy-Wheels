import { auth } from "@/auth";
import GeoUpdater from "@/components/GeoUpdater";
import PublicHome from "@/components/PublicHome";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export default async function Home() {
  const session = await auth();
  await connectDb();
  const user = session?.user?.email ? await User.findOne({ email: session.user.email }) : null;

  return (
    <main className="w-full min-h-screen bg-[#F3F6EF]">
      {user && <GeoUpdater userId={user._id.toString()} />}
      <PublicHome />
    </main>
  );
}
