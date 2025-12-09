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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X } from "lucide-react"

type Pacijent = {
  id: string
  ime: string
  prezime: string
  oib: string
}

type Lijecnik = {
  id: string
  ime: string
  prezime: string
  specijalizacija: string
}

type LabRezultat = {
  naziv_testa: string
  vrijednost: string
  jedinica: string
  referentni_raspon: string
}

type NalazFormData = {
  pacijent_id: string
  liječnik_id: string
  datum: string
  dijagnoza: string
  simptomi: string
  terapija: string
  napomene: string
}

type NalazFormProps = {
  pacijenti: Pacijent[]
  lijecnici: Lijecnik[]
  nalaz?: NalazFormData & { id: string }
  postojeciLabRezultati?: LabRezultat[]
}

export function NalazForm({ pacijenti, lijecnici, nalaz, postojeciLabRezultati }: NalazFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [greska, setGreska] = useState("")

  const [formData, setFormData] = useState<NalazFormData>({
    pacijent_id: nalaz?.pacijent_id || "",
    liječnik_id: nalaz?.liječnik_id || "",
    datum: nalaz?.datum || new Date().toISOString().split("T")[0],
    dijagnoza: nalaz?.dijagnoza || "",
    simptomi: nalaz?.simptomi || "",
    terapija: nalaz?.terapija || "",
    napomene: nalaz?.napomene || "",
  })

  const [labRezultati, setLabRezultati] = useState<LabRezultat[]>(
    postojeciLabRezultati || [
      {
        naziv_testa: "",
        vrijednost: "",
        jedinica: "",
        referentni_raspon: "",
      },
    ],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGreska("")

    const podaci = {
      ...formData,
      simptomi: formData.simptomi || null,
      terapija: formData.terapija || null,
      napomene: formData.napomene || null,
    }

    let nalazId = nalaz?.id

    if (nalaz) {
      // Ažuriranje postojećeg nalaza
      const { error } = await supabase.from("medicinski_nalazi").update(podaci).eq("id", nalaz.id)

      if (error) {
        setGreska("Greška pri ažuriranju nalaza")
        setLoading(false)
        return
      }
    } else {
      // Dodavanje novog nalaza
      const { data: noviNalaz, error } = await supabase.from("medicinski_nalazi").insert([podaci]).select().single()

      if (error || !noviNalaz) {
        setGreska("Greška pri dodavanju nalaza")
        setLoading(false)
        return
      }

      nalazId = noviNalaz.id
    }

    // Dodaj laboratorijske rezultate ako postoje
    const validniLabRezultati = labRezultati.filter(
      (lab) => lab.naziv_testa && lab.vrijednost && lab.jedinica && lab.referentni_raspon,
    )

    if (validniLabRezultati.length > 0 && nalazId) {
      // Ako ažuriramo, prvo obriši stare rezultate
      if (nalaz) {
        await supabase.from("laboratorijski_rezultati").delete().eq("nalaz_id", nalazId)
      }

      const labPodaci = validniLabRezultati.map((lab) => ({
        nalaz_id: nalazId,
        ...lab,
      }))

      const { error: labError } = await supabase.from("laboratorijski_rezultati").insert(labPodaci)

      if (labError) {
        console.log("[v0] Error inserting lab results:", labError)
      }
    }

    router.push("/dashboard/nalazi")
    router.refresh()
    setLoading(false)
  }

  const dodajLabRezultat = () => {
    setLabRezultati([
      ...labRezultati,
      {
        naziv_testa: "",
        vrijednost: "",
        jedinica: "",
        referentni_raspon: "",
      },
    ])
  }

  const ukloniLabRezultat = (index: number) => {
    setLabRezultati(labRezultati.filter((_, i) => i !== index))
  }

  const updateLabRezultat = (index: number, field: keyof LabRezultat, value: string) => {
    const noviLabRezultati = [...labRezultati]
    noviLabRezultati[index][field] = value
    setLabRezultati(noviLabRezultati)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {greska && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{greska}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pacijent_id">
            Pacijent <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData.pacijent_id}
            onValueChange={(value) => setFormData({ ...formData, pacijent_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Odaberite pacijenta" />
            </SelectTrigger>
            <SelectContent>
              {pacijenti.map((pacijent) => (
                <SelectItem key={pacijent.id} value={pacijent.id}>
                  {pacijent.ime} {pacijent.prezime} ({pacijent.oib})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="liječnik_id">
            Liječnik <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData.liječnik_id}
            onValueChange={(value) => setFormData({ ...formData, liječnik_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Odaberite liječnika" />
            </SelectTrigger>
            <SelectContent>
              {lijecnici.map((lijecnik) => (
                <SelectItem key={lijecnik.id} value={lijecnik.id}>
                  Dr. {lijecnik.ime} {lijecnik.prezime} ({lijecnik.specijalizacija})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="datum">
            Datum <span className="text-red-600">*</span>
          </Label>
          <Input
            id="datum"
            type="date"
            value={formData.datum}
            onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dijagnoza">
          Dijagnoza <span className="text-red-600">*</span>
        </Label>
        <Input
          id="dijagnoza"
          value={formData.dijagnoza}
          onChange={(e) => setFormData({ ...formData, dijagnoza: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="simptomi">Simptomi</Label>
        <Textarea
          id="simptomi"
          value={formData.simptomi}
          onChange={(e) => setFormData({ ...formData, simptomi: e.target.value })}
          placeholder="Navedite simptome koje je pacijent prijavио..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="terapija">Terapija</Label>
        <Textarea
          id="terapija"
          value={formData.terapija}
          onChange={(e) => setFormData({ ...formData, terapija: e.target.value })}
          placeholder="Navedite propisanu terapiju..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="napomene">Napomene</Label>
        <Textarea
          id="napomene"
          value={formData.napomene}
          onChange={(e) => setFormData({ ...formData, napomene: e.target.value })}
          placeholder="Dodatne napomene o nalazu..."
          rows={3}
        />
      </div>

      {/* Laboratorijski rezultati */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Laboratorijski Rezultati</CardTitle>
          <CardDescription>Dodajte laboratorijske testove i njihove rezultate (opcionalno)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {labRezultati.map((lab, index) => (
            <div key={index} className="grid gap-4 md:grid-cols-4 border p-4 rounded-lg relative">
              {labRezultati.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => ukloniLabRezultat(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="space-y-2">
                <Label>Naziv Testa</Label>
                <Input
                  value={lab.naziv_testa}
                  onChange={(e) => updateLabRezultat(index, "naziv_testa", e.target.value)}
                  placeholder="Npr. Hemoglobin"
                />
              </div>

              <div className="space-y-2">
                <Label>Vrijednost</Label>
                <Input
                  value={lab.vrijednost}
                  onChange={(e) => updateLabRezultat(index, "vrijednost", e.target.value)}
                  placeholder="Npr. 14.5"
                />
              </div>

              <div className="space-y-2">
                <Label>Jedinica</Label>
                <Input
                  value={lab.jedinica}
                  onChange={(e) => updateLabRezultat(index, "jedinica", e.target.value)}
                  placeholder="Npr. g/dL"
                />
              </div>

              <div className="space-y-2">
                <Label>Referentni Raspon</Label>
                <Input
                  value={lab.referentni_raspon}
                  onChange={(e) => updateLabRezultat(index, "referentni_raspon", e.target.value)}
                  placeholder="Npr. 12-16"
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={dodajLabRezultat} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj Test
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
          {loading ? "Spremanje..." : nalaz ? "Ažuriraj Nalaz" : "Dodaj Nalaz"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Odustani
        </Button>
      </div>
    </form>
  )
}
