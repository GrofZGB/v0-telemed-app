"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

type Pacijent = {
  id: string
  ime: string
  prezime: string
  datum_rođenja: string
  spol: string
  oib: string
  adresa: string | null
  telefon: string | null
  email: string | null
  krvna_grupa: string | null
  alergije: string | null
}

export function PacijentTable({ pacijenti }: { pacijenti: Pacijent[] }) {
  const [brisanjeId, setBrisanjeId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleBrisanje = async () => {
    if (!brisanjeId) return

    const { error } = await supabase.from("pacijenti").delete().eq("id", brisanjeId)

    if (!error) {
      router.refresh()
    }
    setBrisanjeId(null)
  }

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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ime i Prezime</TableHead>
              <TableHead>OIB</TableHead>
              <TableHead>Dob</TableHead>
              <TableHead>Spol</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Krvna Grupa</TableHead>
              <TableHead className="text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacijenti.map((pacijent) => (
              <TableRow key={pacijent.id}>
                <TableCell className="font-medium">
                  {pacijent.ime} {pacijent.prezime}
                </TableCell>
                <TableCell>{pacijent.oib}</TableCell>
                <TableCell>{izracunajGodine(pacijent.datum_rođenja)} god.</TableCell>
                <TableCell>
                  <Badge variant="outline">{pacijent.spol === "M" ? "Muško" : "Žensko"}</Badge>
                </TableCell>
                <TableCell>{pacijent.telefon || "-"}</TableCell>
                <TableCell>{pacijent.krvna_grupa || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/pacijenti/${pacijent.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/pacijenti/${pacijent.id}/uredi`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setBrisanjeId(pacijent.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!brisanjeId} onOpenChange={(open) => !open && setBrisanjeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja ne može se poništiti. Ovo će trajno obrisati pacijenta iz sustava.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={handleBrisanje} className="bg-red-600 hover:bg-red-700">
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
