import { getHomeData } from "@/lib/home-data"
import HomeCarouselsClient from "@/components/home/HomeCarouselsClient"

export default async function HomeCarouselsSection() {
  const data = await getHomeData()
  return <HomeCarouselsClient data={data} />
}
