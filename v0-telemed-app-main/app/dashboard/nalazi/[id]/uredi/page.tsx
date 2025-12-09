import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NalazForm } from "@/components/nalaz-form"

export default async function UrediNalazPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: nalaz, error } = await supabase.from("medicinski_nalazi").select("*").eq("id", params.id).single()

  if (error || !nalaz) {
    notFound()
  }

  // Dohvati pacijente i liječnike za select opcije
  const [{ data: pacijenti }, { data: lijecnici }, { data: labRezultati }] = await Promise.all([
    supabase.from("pacijenti").select("id, ime, prezime, oib").order("prezime", { ascending: true }),
    supabase.from("lijecnici").select("id, ime, prezime, specijalizacija").order("prezime", { ascending: true }),
    supabase.from("laboratorijski_rezultati").select("*").eq("nalaz_id", params.id),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">Uredi Medicinski Nalaz</h1>
        <p className="text-muted-foreground mt-2">Ažurirajte podatke o medicinskom nalazu</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Podaci o Nalazu</CardTitle>
          <CardDescription>Uredite informacije o medicinskom nalazu</CardDescription>
        </CardHeader>
        <CardContent>
          <NalazForm
            pacijenti={pacijenti || []}
            lijecnici={lijecnici || []}
            nalaz={nalaz}
            postojeciLabRezultati={labRezultati || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
