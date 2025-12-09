import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { NalazTable } from "@/components/nalaz-table"
import { NalazSearch } from "@/components/nalaz-search"

export default async function NalaziPage({
  searchParams,
}: {
  searchParams: { pretraga?: string; od?: string; do?: string }
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Dohvati medicinske nalaze s opcionalnom pretragom
  let query = supabase
    .from("medicinski_nalazi")
    .select(
      `
      *,
      pacijenti(ime, prezime, oib),
      liječnici(ime, prezime, specijalizacija)
    `,
    )
    .order("datum", { ascending: false })

  if (searchParams.pretraga) {
    const pretraga = `%${searchParams.pretraga}%`
    query = query.or(`dijagnoza.ilike.${pretraga}`)
  }

  if (searchParams.od) {
    query = query.gte("datum", searchParams.od)
  }

  if (searchParams.do) {
    query = query.lte("datum", searchParams.do)
  }

  const { data: nalazi, error } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">Medicinski Nalazi</h1>
          <p className="text-muted-foreground mt-2">Upravljanje medicinskim nalazima</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/dashboard/nalazi/novi">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj Nalaz
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pretraga Nalaza</CardTitle>
          <CardDescription>Pretražite nalaze po dijagnozi ili datumu</CardDescription>
        </CardHeader>
        <CardContent>
          <NalazSearch />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popis Nalaza</CardTitle>
          <CardDescription>
            {nalazi?.length || 0} {nalazi?.length === 1 ? "nalaz" : "nalaza"} pronađeno
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-red-600">Greška pri učitavanju nalaza</p>
          ) : nalazi && nalazi.length > 0 ? (
            <NalazTable nalazi={nalazi} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nema pronađenih nalaza</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
