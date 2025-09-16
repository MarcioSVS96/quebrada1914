import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PublicStore from "@/components/public-store"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is authenticated, redirect to admin
  if (user) {
    redirect("/admin")
  }

  return <PublicStore />
}
