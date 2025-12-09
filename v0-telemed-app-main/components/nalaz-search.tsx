"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

export function NalazSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [pretraga, setPretraga] = useState(searchParams.get("pretraga") || "")
  const [od, setOd] = useState(searchParams.get("od") || "")
  const [do_, setDo] = useState(searchParams.get("do") || "")

  const updateParams = (pretraga: string, od: string, do_: string) => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (pretraga) params.set("pretraga", pretraga)
      if (od) params.set("od", od)
      if (do_) params.set("do", do_)
      router.push(`/dashboard/nalazi?${params.toString()}`)
    })
  }

  const handlePretraga = (value: string) => {
    setPretraga(value)
    updateParams(value, od, do_)
  }

  const handleOd = (value: string) => {
    setOd(value)
    updateParams(pretraga, value, do_)
  }

  const handleDo = (value: string) => {
    setDo(value)
    updateParams(pretraga, od, value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="pretraga">Pretraga po dijagnozi</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="pretraga"
            placeholder="Pretražite dijagnoze..."
            value={pretraga}
            onChange={(e) => handlePretraga(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="od">Datum od</Label>
        <Input id="od" type="date" value={od} onChange={(e) => handleOd(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="do">Datum do</Label>
        <Input id="do" type="date" value={do_} onChange={(e) => handleDo(e.target.value)} />
      </div>
    </div>
  )
}
