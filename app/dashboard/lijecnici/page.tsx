import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { LijecnikTable } from "@/components/lijecnik-table"
import { LijecnikSearch } from "@/components/lijecnik-search"

export default async function LijecniciPage({
  searchParams,
}: {
  searchParams: { pretraga?: string; specijalizacija?: string }
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Dohvati liječnike s opcionalnom pretragom
  let query = supabase.from("liječnici").select("*").order("prezime", { ascending: true })

  if (searchParams.pretraga) {
    const pretraga = `%${searchParams.pretraga}%`
    query = query.or(`ime.ilike.${pretraga},prezime.ilike.${pretraga}`)
  }

  if (searchParams.specijalizacija) {
    query = query.eq("specijalizacija", searchParams.specijalizacija)
  }

  const { data: lijecnici, error } = await query

  // Dohvati jedinstvene specijalizacije za filter
  const { data: specijalizacijeData } = await supabase.from("liječnici").select("specijalizacija")

  const specijalizacije = Array.from(new Set(specijalizacijeData?.map((l) => l.specijalizacija))).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">Liječnici</h1>
          <p className="text-muted-foreground mt-2">Upravljanje liječnicima u sustavu</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/dashboard/lijecnici/novi">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj Liječnika
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pretraga Liječnika</CardTitle>
          <CardDescription>Pretražite liječnike po imenu, prezimenu ili specijalizaciji</CardDescription>
        </CardHeader>
        <CardContent>
          <LijecnikSearch specijalizacije={specijalizacije} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popis Liječnika</CardTitle>
          <CardDescription>
            {lijecnici?.length || 0} {lijecnici?.length === 1 ? "liječnik" : "liječnika"} pronađeno
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-red-600">Greška pri učitavanju liječnika</p>
          ) : lijecnici && lijecnici.length > 0 ? (
            <LijecnikTable lijecnici={lijecnici} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nema pronađenih liječnika</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
