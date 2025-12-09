import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PacijentForm } from "@/components/pacijent-form"

export default async function NoviPacijentPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">Novi Pacijent</h1>
        <p className="text-muted-foreground mt-2">Dodajte novog pacijenta u sustav</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Podaci o Pacijentu</CardTitle>
          <CardDescription>Unesite sve potrebne informacije o pacijentu</CardDescription>
        </CardHeader>
        <CardContent>
          <PacijentForm />
        </CardContent>
      </Card>
    </div>
  )
}
