import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LijecnikForm } from "@/components/lijecnik-form"

export default async function UrediLijecnikaPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: lijecnik, error } = await supabase.from("lijecnici").select("*").eq("id", params.id).single()

  if (error || !lijecnik) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">Uredi Liječnika</h1>
        <p className="text-muted-foreground mt-2">
          Ažurirajte podatke za Dr. {lijecnik.ime} {lijecnik.prezime}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Podaci o Liječniku</CardTitle>
          <CardDescription>Uredite informacije o liječniku</CardDescription>
        </CardHeader>
        <CardContent>
          <LijecnikForm lijecnik={lijecnik} />
        </CardContent>
      </Card>
    </div>
  )
}
