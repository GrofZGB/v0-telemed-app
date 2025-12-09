"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, UserCog, FileText, LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigacija = [
  {
    naziv: "Nadzorna Ploča",
    href: "/dashboard",
    ikona: LayoutDashboard,
  },
  {
    naziv: "Pacijenti",
    href: "/dashboard/pacijenti",
    ikona: Users,
  },
  {
    naziv: "Liječnici",
    href: "/dashboard/lijecnici",
    ikona: UserCog,
  },
  {
    naziv: "Medicinski Nalazi",
    href: "/dashboard/nalazi",
    ikona: FileText,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleOdjava = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <nav className="flex flex-col gap-2">
      {navigacija.map((stavka) => {
        const jeAktivan = pathname === stavka.href
        return (
          <Link
            key={stavka.href}
            href={stavka.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
              jeAktivan ? "bg-teal-50 text-teal-700 font-medium" : "text-muted-foreground"
            }`}
          >
            <stavka.ikona className="h-4 w-4" />
            {stavka.naziv}
          </Link>
        )
      })}
      <Button
        variant="ghost"
        className="justify-start gap-3 text-muted-foreground hover:text-foreground mt-4"
        onClick={handleOdjava}
      >
        <LogOut className="h-4 w-4" />
        Odjava
      </Button>
    </nav>
  )
}
