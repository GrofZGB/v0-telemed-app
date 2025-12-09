"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@/lib/supabase/client"

type PacijentFormData = {
  ime: string
  prezime: string
  datum_rođenja: string
  spol: string
  oib: string
  adresa: string
  telefon: string
  email: string
  krvna_grupa: string
  alergije: string
}

type PacijentFormProps = {
  pacijent?: PacijentFormData & { id: string }
}

export function PacijentForm({ pacijent }: PacijentFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [greska, setGreska] = useState("")

  const [formData, setFormData] = useState<PacijentFormData>({
    ime: pacijent?.ime || "",
    prezime: pacijent?.prezime || "",
    datum_rođenja: pacijent?.datum_rođenja || "",
    spol: pacijent?.spol || "M",
    oib: pacijent?.oib || "",
    adresa: pacijent?.adresa || "",
    telefon: pacijent?.telefon || "",
    email: pacijent?.email || "",
    krvna_grupa: pacijent?.krvna_grupa || "",
    alergije: pacijent?.alergije || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGreska("")

    // Validacija OIB-a (mora imati 11 znamenki)
    if (formData.oib.length !== 11) {
      setGreska("OIB mora imati 11 znamenki")
      setLoading(false)
      return
    }

    const podaci = {
      ...formData,
      adresa: formData.adresa || null,
      telefon: formData.telefon || null,
      email: formData.email || null,
      krvna_grupa: formData.krvna_grupa || null,
      alergije: formData.alergije || null,
    }

    if (pacijent) {
      // Ažuriranje postojećeg pacijenta
      const { error } = await supabase.from("pacijenti").update(podaci).eq("id", pacijent.id)

      if (error) {
        setGreska("Greška pri ažuriranju pacijenta")
      } else {
        router.push("/dashboard/pacijenti")
        router.refresh()
      }
    } else {
      // Dodavanje novog pacijenta
      const { error } = await supabase.from("pacijenti").insert([podaci])

      if (error) {
        setGreska("Greška pri dodavanju pacijenta")
      } else {
        router.push("/dashboard/pacijenti")
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

        <div className="space-y-2">
          <Label htmlFor="datum_rođenja">
            Datum Rođenja <span className="text-red-600">*</span>
          </Label>
          <Input
            id="datum_rođenja"
            type="date"
            value={formData.datum_rođenja}
            onChange={(e) => setFormData({ ...formData, datum_rođenja: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="spol">
            Spol <span className="text-red-600">*</span>
          </Label>
          <Select value={formData.spol} onValueChange={(value) => setFormData({ ...formData, spol: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Muško</SelectItem>
              <SelectItem value="Ž">Žensko</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="oib">
            OIB <span className="text-red-600">*</span>
          </Label>
          <Input
            id="oib"
            value={formData.oib}
            onChange={(e) => setFormData({ ...formData, oib: e.target.value })}
            maxLength={11}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="krvna_grupa">Krvna Grupa</Label>
          <Select
            value={formData.krvna_grupa}
            onValueChange={(value) => setFormData({ ...formData, krvna_grupa: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Odaberite krvnu grupu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="0+">0+</SelectItem>
              <SelectItem value="0-">0-</SelectItem>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresa">Adresa</Label>
        <Input
          id="adresa"
          value={formData.adresa}
          onChange={(e) => setFormData({ ...formData, adresa: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alergije">Alergije</Label>
        <Textarea
          id="alergije"
          value={formData.alergije}
          onChange={(e) => setFormData({ ...formData, alergije: e.target.value })}
          placeholder="Navedite sve poznate alergije pacijenta..."
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
          {loading ? "Spremanje..." : pacijent ? "Ažuriraj Pacijenta" : "Dodaj Pacijenta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Odustani
        </Button>
      </div>
    </form>
  )
}
