import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NalazForm } from "@/components/nalaz-form"

export default async function NoviNalazPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Dohvati pacijente i liječnike za select opcije
  const [{ data: pacijenti }, { data: lijecnici }] = await Promise.all([
    supabase.from("pacijenti").select("id, ime, prezime, oib").order("prezime", { ascending: true }),
    supabase.from("liječnici").select("id, ime, prezime, specijalizacija").order("prezime", { ascending: true }),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">Novi Medicinski Nalaz</h1>
        <p className="text-muted-foreground mt-2">Dodajte novi medicinski nalaz u sustav</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Podaci o Nalazu</CardTitle>
          <CardDescription>Unesite sve potrebne informacije o medicinskom nalazu</CardDescription>
        </CardHeader>
        <CardContent>
          <NalazForm pacijenti={pacijenti || []} lijecnici={lijecnici || []} />
        </CardContent>
      </Card>
    </div>
  )
}
