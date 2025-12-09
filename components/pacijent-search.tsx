"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function PacijentSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [pretraga, setPretraga] = useState(searchParams.get("pretraga") || "")

  const handlePretraga = (value: string) => {
    setPretraga(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("pretraga", value)
      } else {
        params.delete("pretraga")
      }
      router.push(`/dashboard/pacijenti?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Pretražite po imenu, prezimenu ili OIB-u..."
        value={pretraga}
        onChange={(e) => handlePretraga(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
