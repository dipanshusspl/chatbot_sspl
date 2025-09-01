import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Using Groq for free AI responses
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export const maxDuration = 30

// Cache for synonyms to avoid repeated API calls
const synonymCache = new Map<string, string[]>()

// Define the menu structure for the chatbot

const MENU_STRUCTURE = {
      english: {
        welcome: "Hi, Welcome to Sparrow Softech Chatbot. How can I assist you?",
        other_option: "Other (Ask a question)",
        menus: [
          {
            label: "About Us",
            query: "About Us",
            // submenus: [
            //   { label: "Overview", query: "Overview" },
            //   { label: "History", query: "History" },
            //   { label: "Mission & Vision", query: "Mission & Vision" },
            //   { label: "Gallery", query: "Gallery" },
            //   { label: "Organisational Hierarchy", query: "Organisational Hierarchy" },
            //   { label: "Awards & Recognition", query: "Awards & Recognition" },
            //   { label: "Why Choose Us", query: "Why Choose Us" }
            // ]
          },
          {
            label: "Services",
            query: "Services",
            // submenus: [
            //   { label: "Door to Door Survey & Assessment", query: "Door to Door Survey & Assessment" },
            //   { label: "Municipal Revenue Augmentation Services", query: "Municipal Revenue Augmentation Services" },
            //   { label: "Drone Survey With GIS‑Mapping", query: "Drone Survey With GIS‑Mapping" },
            //   { label: "Business Process Outsourcing", query: "Business Process Outsourcing" },
            //   { label: "Manpower Outsourcing", query: "Manpower Outsourcing" },
            //   { label: "GIS Based Geo‑Tagging", query: "GIS Based Geo‑Tagging" },
            //   { label: "Scanning & Digitalization", query: "Scanning & Digitalization" },
            //   { label: "AI Based Technology", query: "AI Based Technology" },
            //   { label: "Mobile Application", query: "Mobile Application" },
            //   { label: "Financial Inclusion", query: "Financial Inclusion" }
            // ]
          },
          {
            label: "Products",
            query: "Products",
            // submenus: [
            //   { label: "E‑Municipal", query: "E‑Municipal" },
            //   { label: "E‑Office", query: "E‑Office" },
            //   { label: "Land Allotment", query: "Land Allotment" },
            //   { label: "Hospital Information Management System", query: "Hospital Information Management System" },
            //   { label: "Industrial Area Management System", query: "Industrial Area Management System" },
            //   { label: "Legal Metrology", query: "Legal Metrology" }
            // ]
          },
          //{
            //label: "Technical Information",
            //query: "Technical Information",
            // submenus: [
            //   { label: "Technical Overview", query: "Technical Overview" },
            //   { label: "Tech Stack", query: "Tech Stack" },
            //   { label: "Our delivery process", query: "Our delivery process" }
            // ]
          //},
          {
            label: "Contact Us",
            query: "Contact Us",
            // submenus: [
            //   { label: "Reach Us", query: "Reach Us" },
            //   { label: "Regional Offices", query: "Regional Offices" },
            //   { label: "Overseas Presence", query: "Overseas Presence" },
            //   { label: "Others", query: "Others" }
            // ]
          }
        ]
      }
}



// Generate synonyms using Groq AI (supports multiple languages)
async function generateSynonyms(query: string): Promise<string[]> {
  const cacheKey = query.toLowerCase()
  if (synonymCache.has(cacheKey)) {
    return synonymCache.get(cacheKey)!
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        //model: "llama3-8b-8192",
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a synonym generator. Given a word or phrase, provide related words, synonyms, and alternative phrasings that mean the same thing. 

Rules:
1. Return only the synonyms/related terms, separated by commas
2. Maximum 12 terms total
3. Don't include explanations, just the terms

Example:
Input: "business hours" 
Output: working hours, office hours, operating hours, timing, schedule, व्यवसाय तास, कार्य तास, ऑफिस तास`,
          },
          {
            role: "user",
            content: `Generate synonyms and related terms for: "${query}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate synonyms")
    }

    const data = await response.json()
    const synonymsText = data.choices[0]?.message?.content || ""

    const synonyms = synonymsText
      .split(",")
      .map((term: string) => term.trim().toLowerCase())
      .filter((term: string) => term.length > 0 && term !== query.toLowerCase())
      .slice(0, 12)

    const allTerms = [query.toLowerCase(), ...synonyms]

    synonymCache.set(cacheKey, allTerms)

    return allTerms
  } catch (error) {
    console.error("Error generating synonyms:", error)
    return [query.toLowerCase()]
  }
}

// Enhanced content matching with better cross-language support
async function findRelevantContent(query: string) {
  try {
    const { data: faqs } = await supabase.from("faqs").select("*").order("created_at", { ascending: false })
    const { data: knowledge } = await supabase
      .from("knowledge_base")
      .select("*")
      .order("created_at", { ascending: false })

    if (!faqs && !knowledge) {
      return { faqs: [], knowledge: [] }
    }

    const expandedTerms = await generateSynonyms(query)

    console.log(`Query: "${query}" expanded to:`, expandedTerms)

    const relevantFaqs =
      faqs?.filter((faq) => {
        const questionLower = faq.question.toLowerCase()
        const answerLower = faq.answer.toLowerCase()

        const hasMatch = expandedTerms.some(
          (term) =>
            questionLower.includes(term) ||
            answerLower.includes(term) ||
            calculateSimilarity(query.toLowerCase(), questionLower) > 0.2,
        )
        return hasMatch
      }) || []

    const relevantKnowledge =
      knowledge?.filter((kb) => {
        const titleLower = kb.title.toLowerCase()
        const contentLower = kb.content.toLowerCase()

        const hasMatch = expandedTerms.some(
          (term) =>
            titleLower.includes(term) ||
            contentLower.includes(term) ||
            calculateSimilarity(query.toLowerCase(), titleLower) > 0.2,
        )
        return hasMatch
      }) || []

    return { faqs: relevantFaqs, knowledge: relevantKnowledge }
  } catch (error) {
    console.error("Error finding relevant content:", error)
    return { faqs: [], knowledge: [] }
  }
}

// Simple similarity calculation (Jaccard similarity)
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(" "))
  const words2 = new Set(str2.split(" "))

  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

async function generateResponse(query: string, context: any, language: string) {
  const contextText = [
    ...context.faqs.map((faq: any) => `Q: ${faq.question}\nA: ${faq.answer}`),
    ...context.knowledge.map((kb: any) => `${kb.title}: ${kb.content}`),
  ].join("\n\n")

  // Check if the query is a specific menu/submenu item
  let isMenuItemQuery = false
  let menuItemInfo = ""

  for (const langKey of Object.keys(MENU_STRUCTURE)) {
    const langConfig = (MENU_STRUCTURE as any)[langKey]
    for (const menu of langConfig.menus) {
      if (query === menu.query) {
        isMenuItemQuery = true
        menuItemInfo = `The user selected the main menu item: "${menu.label}". Provide a general overview of "${menu.label}" services offered by Sparrow Softech Pvt Ltd.`
        break
      }
      // for (const submenu of menu.submenus) {
      //   if (query === submenu.query) {
      //     isMenuItemQuery = true
      //     menuItemInfo = `The user selected the submenu item: "${submenu.label}". Provide detailed information about "${submenu.label}" service offered by Sparrow Softech Pvt Ltd. Include steps, requirements, or relevant links if available in the context.`
      //     break
      //   }
      // }
      if (isMenuItemQuery) break
    }
    if (isMenuItemQuery) break
  }

  //const systemPrompt = `You are a helpful AI assistant for Sparrow Softech Pvt Ltd. Your primary goal is to assist users with information about municipal services.
  const systemPrompt = `You are a helpful AI assistant for Sparrow Softech Pvt Ltd. Your primary goal is to assist users with information about municipal services.Provide concise answers without unnecessary greetings or closing statements.
STRICT RULES:
1. ONLY use information from the provided context below.
2. If the context contains relevant information, answer naturally and provide a direct, concise answer without extra greetings, even if the question is phrased differently. Also include contact details when always. 
3. If the context does NOT contain ANY relevant information for the query then respond with:"Please contact on:-info@sparrowsoftech.com or +91 6201998080 for more details, I don't have information "}"
4. Be conversational and helpful.

${isMenuItemQuery ? menuItemInfo : ""}

Context (this is ALL the information you can use):
${contextText}

Remember: If you find relevant information in the context above, answer the question naturally even if it's phrased differently than the original FAQ. , especially contact details when available.`


  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        //model: "llama3-8b-8192",
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.4,
        max_tokens: 500,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get AI response")
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."
  } catch (error) {
    console.error("Error generating AI response:", error)
    return "I'm sorry, I'm having trouble processing your request right now."
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, language } = await req.json() // Now receiving language from widget

    if (!message) {
      const response = NextResponse.json({ error: "Message is required" }, { status: 400 })
      response.headers.set("Access-Control-Allow-Origin", "*")
      response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type")
      return response
    }

    // Find relevant content from database
    const context = await findRelevantContent(message)

    // Generate AI response
    const response = await generateResponse(message, context, language || "english") // Pass language to generateResponse

    const jsonResponse = NextResponse.json({ response })
    jsonResponse.headers.set("Access-Control-Allow-Origin", "*")
    jsonResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
    jsonResponse.headers.set("Access-Control-Allow-Headers", "Content-Type")

    return jsonResponse
  } catch (error) {
    console.error("Chat API error:", error)
    const errorResponse = NextResponse.json({ error: "Internal server error" }, { status: 500 })
    errorResponse.headers.set("Access-Control-Allow-Origin", "*")
    errorResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
    errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type")
    return errorResponse
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
