import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("knowledge_base").insert([{ title, content }]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create knowledge base entry" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Knowledge base creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("knowledge_base").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch knowledge base" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Knowledge base fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
