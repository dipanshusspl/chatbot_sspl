import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { question, answer } = await req.json()

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("faqs").insert([{ question, answer }]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("FAQ creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("faqs").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("FAQ fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
