import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("knowledge_base").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete knowledge base entry" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Knowledge base deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
