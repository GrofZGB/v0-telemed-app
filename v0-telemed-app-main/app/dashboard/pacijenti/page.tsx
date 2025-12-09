import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PacijentTable } from "@/components/pacijent-table"
import { PacijentSearch } from "@/components/pacijent-search"

export default async function PacijentiPage({
  searchParams,
}: {
  searchParams: { pretraga?: string }
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Dohvati pacijente s opcionalnom pretragom
  let query = supabase.from("pacijenti").select("*").order("prezime", { ascending: true })

  if (searchParams.pretraga) {
    const pretraga = `%${searchParams.pretraga}%`
    query = query.or(`ime.ilike.${pretraga},prezime.ilike.${pretraga},oib.ilike.${pretraga}`)
  }

  const { data: pacijenti, error } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">Pacijenti</h1>
          <p className="text-muted-foreground mt-2">Upravljanje pacijentima u sustavu</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/dashboard/pacijenti/novi">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj Pacijenta
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pretraga Pacijenata</CardTitle>
          <CardDescription>Pretražite pacijente po imenu, prezimenu ili OIB-u</CardDescription>
        </CardHeader>
        <CardContent>
          <PacijentSearch />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popis Pacijenata</CardTitle>
          <CardDescription>
            {pacijenti?.length || 0} {pacijenti?.length === 1 ? "pacijent" : "pacijenata"} pronađeno
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-red-600">Greška pri učitavanju pacijenata</p>
          ) : pacijenti && pacijenti.length > 0 ? (
            <PacijentTable pacijenti={pacijenti} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nema pronađenih pacijenata</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
