import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Navbar from "@/components/Navbar";
import PublicHome from "@/components/PublicHome";
import RiderDashboard from "@/components/RiderDashboard";
import VehicleSlider from "@/components/VehicleSlider";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export default async function Home() {
  const session = await auth();
  await connectDb();
  const user = await User.findOne({ email: session?.user?.email });
  console.log("This is my userr---", user);
  return (
    <div className="w-full min-h-screen bg-white ">
      {user && <GeoUpdater userId={user._id.toString()} />}
      {user?.role === "rider" ?
        <>
          <Navbar />

          <RiderDashboard />
        </>
        : (user?.role === "admin" ? <AdminDashboard /> :
          <>
            <Navbar />
            <PublicHome />
          </>
        )}
      <Footer />
    </div>
  );
}
