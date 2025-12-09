import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-teal-900">Medicinski Sustav</h1>
              <nav className="hidden md:flex gap-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-teal-600 transition-colors">
                  Nadzorna Ploča
                </Link>
                <Link href="/dashboard/pacijenti" className="text-gray-700 hover:text-teal-600 transition-colors">
                  Pacijenti
                </Link>
                <Link href="/dashboard/lijecnici" className="text-gray-700 hover:text-teal-600 transition-colors">
                  Liječnici
                </Link>
                <Link href="/dashboard/nalazi" className="text-gray-700 hover:text-teal-600 transition-colors">
                  Nalazi
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action={handleSignOut}>
                <Button variant="outline" size="sm" type="submit">
                  Odjava
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
