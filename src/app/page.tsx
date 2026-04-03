import { HomeScreen } from "@/components/home/home-screen";
import { getDashboardData } from "@/lib/data";

export default async function HomePage() {
  const data = await getDashboardData();

  return <HomeScreen data={data} />;
}
