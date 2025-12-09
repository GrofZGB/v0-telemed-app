import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Users, UserCog, FileText, Calendar, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Dohvati statistike
  const [{ count: ukupnoPacijenata }, { count: ukupnoLijecnika }, { count: ukupnoNalaza }, { count: danasTermina }] =
    await Promise.all([
      supabase.from("pacijenti").select("*", { count: "exact", head: true }),
      supabase.from("lijecnici").select("*", { count: "exact", head: true }),
      supabase.from("medicinski_nalazi").select("*", { count: "exact", head: true }),
      supabase
        .from("termini")
        .select("*", { count: "exact", head: true })
        .gte("datum_vrijeme", new Date().toISOString().split("T")[0])
        .lt("datum_vrijeme", new Date(Date.now() + 86400000).toISOString().split("T")[0]),
    ])

  // Dohvati skorašnje nalaze
  const { data: skorasnji_nalazi } = await supabase
    .from("medicinski_nalazi")
    .select(
      `
      id,
      datum,
      dijagnoza,
      pacijenti(ime, prezime),
      lijecnici(ime, prezime)
    `,
    )
    .order("datum", { ascending: false })
    .limit(5)

  // Dohvati današnje termine
  const { data: danasnji_termini } = await supabase
    .from("termini")
    .select(
      `
      id,
      datum_vrijeme,
      razlog,
      status,
      pacijenti(ime, prezime),
      lijecnici(ime, prezime)
    `,
    )
    .gte("datum_vrijeme", new Date().toISOString().split("T")[0])
    .lt("datum_vrijeme", new Date(Date.now() + 86400000).toISOString().split("T")[0])
    .order("datum_vrijeme", { ascending: true })

  const statistike = [
    {
      naziv: "Ukupno Pacijenata",
      vrijednost: ukupnoPacijenata || 0,
      ikona: Users,
      boja: "text-teal-600",
      pozadina: "bg-teal-50",
    },
    {
      naziv: "Ukupno Liječnika",
      vrijednost: ukupnoLijecnika || 0,
      ikona: UserCog,
      boja: "text-blue-600",
      pozadina: "bg-blue-50",
    },
    {
      naziv: "Medicinski Nalazi",
      vrijednost: ukupnoNalaza || 0,
      ikona: FileText,
      boja: "text-purple-600",
      pozadina: "bg-purple-50",
    },
    {
      naziv: "Današnji Termini",
      vrijednost: danasTermina || 0,
      ikona: Calendar,
      boja: "text-orange-600",
      pozadina: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">Nadzorna Ploča</h1>
        <p className="text-muted-foreground mt-2">Dobrodošli u sustav za upravljanje pacijentima</p>
      </div>

      {/* Statistike */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statistike.map((stat) => (
          <Card key={stat.naziv}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.naziv}</CardTitle>
              <div className={`${stat.pozadina} p-2 rounded-lg`}>
                <stat.ikona className={`h-4 w-4 ${stat.boja}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.vrijednost}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Skorašnji Nalazi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              Nedavni Medicinski Nalazi
            </CardTitle>
            <CardDescription>Posljednjih 5 medicinskih nalaza</CardDescription>
          </CardHeader>
          <CardContent>
            {skorasnji_nalazi && skorasnji_nalazi.length > 0 ? (
              <div className="space-y-4">
                {skorasnji_nalazi.map((nalaz: any) => (
                  <div
                    key={nalaz.id}
                    className="flex items-start justify-between border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {nalaz.pacijenti?.ime} {nalaz.pacijenti?.prezime}
                      </p>
                      <p className="text-sm text-muted-foreground">{nalaz.dijagnoza}</p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {nalaz.lijecnici?.ime} {nalaz.lijecnici?.prezime}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(nalaz.datum).toLocaleDateString("hr-HR")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nema nedavnih nalaza</p>
            )}
          </CardContent>
        </Card>

        {/* Današnji Termini */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Današnji Termini
            </CardTitle>
            <CardDescription>Pregled termina za danas</CardDescription>
          </CardHeader>
          <CardContent>
            {danasnji_termini && danasnji_termini.length > 0 ? (
              <div className="space-y-4">
                {danasnji_termini.map((termin: any) => (
                  <div
                    key={termin.id}
                    className="flex items-start justify-between border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {termin.pacijenti?.ime} {termin.pacijenti?.prezime}
                      </p>
                      <p className="text-sm text-muted-foreground">{termin.razlog}</p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {termin.lijecnici?.ime} {termin.lijecnici?.prezime}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs font-medium">
                        {new Date(termin.datum_vrijeme).toLocaleTimeString("hr-HR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          termin.status === "zakazano"
                            ? "bg-blue-100 text-blue-700"
                            : termin.status === "završeno"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {termin.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nema termina za danas</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
