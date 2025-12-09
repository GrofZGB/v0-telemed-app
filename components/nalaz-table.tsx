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

type Nalaz = {
  id: string
  datum: string
  dijagnoza: string
  pacijenti: { ime: string; prezime: string; oib: string }
  liječnici: { ime: string; prezime: string; specijalizacija: string }
}

export function NalazTable({ nalazi }: { nalazi: Nalaz[] }) {
  const [brisanjeId, setBrisanjeId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleBrisanje = async () => {
    if (!brisanjeId) return

    const { error } = await supabase.from("medicinski_nalazi").delete().eq("id", brisanjeId)

    if (!error) {
      router.refresh()
    }
    setBrisanjeId(null)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Pacijent</TableHead>
              <TableHead>Liječnik</TableHead>
              <TableHead>Dijagnoza</TableHead>
              <TableHead className="text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nalazi.map((nalaz) => (
              <TableRow key={nalaz.id}>
                <TableCell className="font-medium">{new Date(nalaz.datum).toLocaleDateString("hr-HR")}</TableCell>
                <TableCell>
                  {nalaz.pacijenti.ime} {nalaz.pacijenti.prezime}
                </TableCell>
                <TableCell>
                  Dr. {nalaz.liječnici.ime} {nalaz.liječnici.prezime}
                </TableCell>
                <TableCell>{nalaz.dijagnoza}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/nalazi/${nalaz.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/nalazi/${nalaz.id}/uredi`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setBrisanjeId(nalaz.id)}>
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
              Ova radnja ne može se poništiti. Ovo će trajno obrisati medicinski nalaz iz sustava.
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
