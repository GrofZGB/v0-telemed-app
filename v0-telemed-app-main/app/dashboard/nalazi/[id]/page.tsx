import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, User, UserCog, FileText, Flag as Flask } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function NalazDetaljPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: nalaz, error } = await supabase
    .from("medicinski_nalazi")
    .select(
      `
      *,
      pacijenti(id, ime, prezime, oib, datum_rođenja, spol, krvna_grupa),
      lijecnici(id, ime, prezime, specijalizacija)
    `,
    )
    .eq("id", params.id)
    .single()

  if (error || !nalaz) {
    notFound()
  }

  // Dohvati laboratorijske rezultate
  const { data: labRezultati } = await supabase
    .from("laboratorijski_rezultati")
    .select("*")
    .eq("nalaz_id", params.id)
    .order("naziv_testa", { ascending: true })

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
          <h1 className="text-balance text-3xl font-bold tracking-tight">Medicinski Nalaz</h1>
          <p className="text-muted-foreground mt-2">{new Date(nalaz.datum).toLocaleDateString("hr-HR")}</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href={`/dashboard/nalazi/${params.id}/uredi`}>
            <Edit className="h-4 w-4 mr-2" />
            Uredi
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pacijent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              Pacijent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Ime i Prezime</p>
              <p className="font-medium">
                <Link href={`/dashboard/pacijenti/${nalaz.pacijenti.id}`} className="hover:underline">
                  {nalaz.pacijenti.ime} {nalaz.pacijenti.prezime}
                </Link>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">OIB</p>
                <p className="text-sm font-medium">{nalaz.pacijenti.oib}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dob</p>
                <p className="text-sm font-medium">{izracunajGodine(nalaz.pacijenti.datum_rođenja)} god.</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spol</p>
                <p className="text-sm font-medium">{nalaz.pacijenti.spol === "M" ? "Muško" : "Žensko"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Krvna Grupa</p>
                <p className="text-sm font-medium">{nalaz.pacijenti.krvna_grupa || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liječnik */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-600" />
              Liječnik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Ime i Prezime</p>
              <p className="font-medium">
                <Link href={`/dashboard/lijecnici/${nalaz.lijecnici.id}`} className="hover:underline">
                  Dr. {nalaz.lijecnici.ime} {nalaz.lijecnici.prezime}
                </Link>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specijalizacija</p>
              <Badge variant="secondary">{nalaz.lijecnici.specijalizacija}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dijagnoza i detalji */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Dijagnoza i Detalji
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Dijagnoza</p>
            <p className="font-medium text-lg">{nalaz.dijagnoza}</p>
          </div>

          {nalaz.simptomi && (
            <div>
              <p className="text-sm text-muted-foreground">Simptomi</p>
              <p className="text-sm">{nalaz.simptomi}</p>
            </div>
          )}

          {nalaz.terapija && (
            <div>
              <p className="text-sm text-muted-foreground">Terapija</p>
              <p className="text-sm">{nalaz.terapija}</p>
            </div>
          )}

          {nalaz.napomene && (
            <div>
              <p className="text-sm text-muted-foreground">Napomene</p>
              <p className="text-sm">{nalaz.napomene}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Laboratorijski rezultati */}
      {labRezultati && labRezultati.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flask className="h-5 w-5 text-orange-600" />
              Laboratorijski Rezultati
            </CardTitle>
            <CardDescription>{labRezultati.length} laboratorijskih testova</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>
                    <TableHead>Vrijednost</TableHead>
                    <TableHead>Jedinica</TableHead>
                    <TableHead>Referentni Raspon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labRezultati.map((rezultat: any) => (
                    <TableRow key={rezultat.id}>
                      <TableCell className="font-medium">{rezultat.naziv_testa}</TableCell>
                      <TableCell>{rezultat.vrijednost}</TableCell>
                      <TableCell>{rezultat.jedinica}</TableCell>
                      <TableCell>{rezultat.referentni_raspon}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
