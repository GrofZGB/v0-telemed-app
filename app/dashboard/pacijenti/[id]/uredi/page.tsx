import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PacijentForm } from "@/components/pacijent-form"

export default async function UrediPacijentaPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: pacijent, error } = await supabase.from("pacijenti").select("*").eq("id", params.id).single()

  if (error || !pacijent) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">Uredi Pacijenta</h1>
        <p className="text-muted-foreground mt-2">
          Ažurirajte podatke za {pacijent.ime} {pacijent.prezime}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Podaci o Pacijentu</CardTitle>
          <CardDescription>Uredite informacije o pacijentu</CardDescription>
        </CardHeader>
        <CardContent>
          <PacijentForm pacijent={pacijent} />
        </CardContent>
      </Card>
    </div>
  )
}
