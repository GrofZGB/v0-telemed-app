import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Calendar, FileText, Users } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function LijecnikDetaljPage({ params }: { params: { id: string } }) {
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

  // Dohvati statistike liječnika
  const [{ count: brojPacijenata }, { count: brojNalaza }, { count: brojTermina }] = await Promise.all([
    supabase
      .from("medicinski_nalazi")
      .select("pacijent_id", { count: "exact", head: true })
      .eq("liječnik_id", params.id),
    supabase.from("medicinski_nalazi").select("*", { count: "exact", head: true }).eq("liječnik_id", params.id),
    supabase.from("termini").select("*", { count: "exact", head: true }).eq("liječnik_id", params.id),
  ])

  // Dohvati nedavne nalaze
  const { data: nalazi } = await supabase
    .from("medicinski_nalazi")
    .select(
      `
      id,
      datum,
      dijagnoza,
      terapija,
      pacijenti(ime, prezime)
    `,
    )
    .eq("liječnik_id", params.id)
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
      pacijenti(ime, prezime)
    `,
    )
    .eq("liječnik_id", params.id)
    .gte("datum_vrijeme", new Date().toISOString())
    .order("datum_vrijeme", { ascending: true })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            Dr. {lijecnik.ime} {lijecnik.prezime}
          </h1>
          <p className="text-muted-foreground mt-2">{lijecnik.specijalizacija}</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href={`/dashboard/lijecnici/${params.id}/uredi`}>
            <Edit className="h-4 w-4 mr-2" />
            Uredi
          </Link>
        </Button>
      </div>

      {/* Statistike */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacijenti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brojPacijenata || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nalazi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brojNalaza || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Termini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brojTermina || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kontakt Informacije</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Telefon</p>
              <p className="font-medium">{lijecnik.telefon || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{lijecnik.email || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Ordinacija</p>
              <p className="font-medium">{lijecnik.ordinacija || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <p className="font-medium">
                        {nalaz.pacijenti?.ime} {nalaz.pacijenti?.prezime}
                      </p>
                      <p className="text-sm text-muted-foreground">{nalaz.dijagnoza}</p>
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
                      <p className="font-medium">
                        {termin.pacijenti?.ime} {termin.pacijenti?.prezime}
                      </p>
                      <p className="text-sm text-muted-foreground">{termin.razlog}</p>
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
