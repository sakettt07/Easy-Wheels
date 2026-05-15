import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PublicHome from "@/components/PublicHome";
import RiderDashboard from "@/components/RiderDashboard";
import VehicleSlider from "@/components/VehicleSlider";
import Image from "next/image";

export default async function Home() {
  const session = await auth();
  return (
    <div className="w-full min-h-screen bg-white ">
      <Navbar />
      {session?.user?.role === "rider" ?
        <RiderDashboard />
        : (session?.user?.role === "admin" ? <AdminDashboard /> :
          <PublicHome />
        )}
      <Footer />
    </div>
  );
}
