"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function LijecnikSearch({ specijalizacije }: { specijalizacije: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [pretraga, setPretraga] = useState(searchParams.get("pretraga") || "")
  const [specijalizacija, setSpecijalizacija] = useState(searchParams.get("specijalizacija") || "")

  const handlePretraga = (value: string) => {
    setPretraga(value)
    updateParams(value, specijalizacija)
  }

  const handleSpecijalizacija = (value: string) => {
    setSpecijalizacija(value)
    updateParams(pretraga, value)
  }

  const updateParams = (pretraga: string, specijalizacija: string) => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (pretraga) params.set("pretraga", pretraga)
      if (specijalizacija) params.set("specijalizacija", specijalizacija)
      router.push(`/dashboard/lijecnici?${params.toString()}`)
    })
  }

  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pretražite po imenu ili prezimenu..."
          value={pretraga}
          onChange={(e) => handlePretraga(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={specijalizacija} onValueChange={handleSpecijalizacija}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sve specijalizacije" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Sve specijalizacije</SelectItem>
          {specijalizacije.map((spec) => (
            <SelectItem key={spec} value={spec}>
              {spec}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
