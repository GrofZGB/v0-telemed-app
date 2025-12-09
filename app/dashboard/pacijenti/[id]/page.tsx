import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function PacijentDetaljPage({ params }: { params: { id: string } }) {
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

  // Dohvati nedavne nalaze
  const { data: nalazi } = await supabase
    .from("medicinski_nalazi")
    .select(
      `
      id,
      datum,
      dijagnoza,
      terapija,
      liječnici(ime, prezime, specijalizacija)
    `,
    )
    .eq("pacijent_id", params.id)
    .order("datum", { ascending: false })
    .limit(5)

  // Dohvati nadolazeće termine
  const { data: termini } = await supabase
    .from("termini")
    .select(
      `
      id,
      datum_vrijeme,
      razlog,
      status,
      liječnici(ime, prezime, specijalizacija)
    `,
    )
    .eq("pacijent_id", params.id)
    .gte("datum_vrijeme", new Date().toISOString())
    .order("datum_vrijeme", { ascending: true })
    .limit(5)

  const izracunajGodine = (datumRođenja: string) => {
    const danas = new Date()
    const rođenje = new Date(datumRođenja)
    let godine = danas.getFullYear() - rođenje.getFullYear()
    const mjesec = danas.getMonth() - rođenje.getMonth()
    if (mjesec < 0 || (mjesec === 0 && danas.getDate() < rođenje.getDate())) {
      godine--
    }
    return godine
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            {pacijent.ime} {pacijent.prezime}
          </h1>
          <p className="text-muted-foreground mt-2">OIB: {pacijent.oib}</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href={`/dashboard/pacijenti/${params.id}/uredi`}>
            <Edit className="h-4 w-4 mr-2" />
            Uredi
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Osnovne Informacije</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Dob</p>
                <p className="font-medium">{izracunajGodine(pacijent.datum_rođenja)} godina</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spol</p>
                <p className="font-medium">{pacijent.spol === "M" ? "Muško" : "Žensko"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Datum Rođenja</p>
                <p className="font-medium">{new Date(pacijent.datum_rođenja).toLocaleDateString("hr-HR")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Krvna Grupa</p>
                <p className="font-medium">{pacijent.krvna_grupa || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontakt Informacije</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Adresa</p>
              <p className="font-medium">{pacijent.adresa || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefon</p>
              <p className="font-medium">{pacijent.telefon || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{pacijent.email || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {pacijent.alergije && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Alergije</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{pacijent.alergije}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Nedavni Medicinski Nalazi
          </CardTitle>
          <CardDescription>Posljednjih 5 medicinskih nalaza</CardDescription>
        </CardHeader>
        <CardContent>
          {nalazi && nalazi.length > 0 ? (
            <div className="space-y-4">
              {nalazi.map((nalaz: any) => (
                <div key={nalaz.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{nalaz.dijagnoza}</p>
                      <p className="text-sm text-muted-foreground">
                        Dr. {nalaz.liječnici?.ime} {nalaz.liječnici?.prezime} - {nalaz.liječnici?.specijalizacija}
                      </p>
                      {nalaz.terapija && <p className="text-sm">Terapija: {nalaz.terapija}</p>}
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(nalaz.datum).toLocaleDateString("hr-HR")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nema medicinskih nalaza</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Nadolazeći Termini
          </CardTitle>
          <CardDescription>Zakazani termini</CardDescription>
        </CardHeader>
        <CardContent>
          {termini && termini.length > 0 ? (
            <div className="space-y-4">
              {termini.map((termin: any) => (
                <div key={termin.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{termin.razlog}</p>
                      <p className="text-sm text-muted-foreground">
                        Dr. {termin.liječnici?.ime} {termin.liječnici?.prezime} - {termin.liječnici?.specijalizacija}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-medium">
                        {new Date(termin.datum_vrijeme).toLocaleDateString("hr-HR")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(termin.datum_vrijeme).toLocaleTimeString("hr-HR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          termin.status === "zakazano"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : termin.status === "završeno"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {termin.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nema zakazanih termina</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
