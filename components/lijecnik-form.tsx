"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@/lib/supabase/client"

type LijecnikFormData = {
  ime: string
  prezime: string
  specijalizacija: string
  telefon: string
  email: string
  ordinacija: string
}

type LijecnikFormProps = {
  lijecnik?: LijecnikFormData & { id: string }
}

const specijalizacije = [
  "Opća medicina",
  "Kardiologija",
  "Dermatologija",
  "Neurologија",
  "Ortopedija",
  "Pedijatrija",
  "Psihijatrija",
  "Radiologija",
  "Kirurgija",
  "Ginekologija",
  "Oftalmologija",
  "Otorinolaringologija",
  "Urologija",
  "Onkologija",
  "Endokrinologija",
  "Gastroenterologija",
  "Nefrologija",
  "Pneumologija",
  "Reumatologija",
  "Anesteziologija",
]

export function LijecnikForm({ lijecnik }: LijecnikFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [greska, setGreska] = useState("")

  const [formData, setFormData] = useState<LijecnikFormData>({
    ime: lijecnik?.ime || "",
    prezime: lijecnik?.prezime || "",
    specijalizacija: lijecnik?.specijalizacija || "",
    telefon: lijecnik?.telefon || "",
    email: lijecnik?.email || "",
    ordinacija: lijecnik?.ordinacija || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGreska("")

    const podaci = {
      ...formData,
      telefon: formData.telefon || null,
      email: formData.email || null,
      ordinacija: formData.ordinacija || null,
    }

    if (lijecnik) {
      // Ažuriranje postojećeg liječnika
      const { error } = await supabase.from("liječnici").update(podaci).eq("id", lijecnik.id)

      if (error) {
        setGreska("Greška pri ažuriranju liječnika")
      } else {
        router.push("/dashboard/lijecnici")
        router.refresh()
      }
    } else {
      // Dodavanje novog liječnika
      const { error } = await supabase.from("liječnici").insert([podaci])

      if (error) {
        setGreska("Greška pri dodavanju liječnika")
      } else {
        router.push("/dashboard/lijecnici")
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {greska && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{greska}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ime">
            Ime <span className="text-red-600">*</span>
          </Label>
          <Input
            id="ime"
            value={formData.ime}
            onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prezime">
            Prezime <span className="text-red-600">*</span>
          </Label>
          <Input
            id="prezime"
            value={formData.prezime}
            onChange={(e) => setFormData({ ...formData, prezime: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="specijalizacija">
            Specijalizacija <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData.specijalizacija}
            onValueChange={(value) => setFormData({ ...formData, specijalizacija: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Odaberite specijalizaciju" />
            </SelectTrigger>
            <SelectContent>
              {specijalizacije.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefon">Telefon</Label>
          <Input
            id="telefon"
            type="tel"
            value={formData.telefon}
            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ordinacija">Ordinacija</Label>
          <Input
            id="ordinacija"
            value={formData.ordinacija}
            onChange={(e) => setFormData({ ...formData, ordinacija: e.target.value })}
            placeholder="Npr. Ordinacija 101, Zgrada A"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
          {loading ? "Spremanje..." : lijecnik ? "Ažuriraj Liječnika" : "Dodaj Liječnika"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Odustani
        </Button>
      </div>
    </form>
  )
}
