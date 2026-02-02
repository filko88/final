import { createClient } from "@/utils/supabase/server"
import SellersClient from "./SellersClient"

export const metadata = {
    title: "Sellers | CNBabes",
    description: "Browse top sellers for rep finds.",
}

export default async function SellersPage() {
    const supabase = await createClient()
    const { data: sellers } = await supabase
        .from("sellers")
        .select("*")
        .order("created_at", { ascending: false })

    return <SellersClient initialSellers={sellers || []} />
}
