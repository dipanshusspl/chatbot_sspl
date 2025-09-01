"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Plus, Trash2, Code, Bot, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FAQ {
  id: string
  question: string
  answer: string
  created_at: string
}

interface KnowledgeBase {
  id: string
  title: string
  content: string
  created_at: string
}

export default function AdminDashboard() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([])
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" })
  const [newKnowledge, setNewKnowledge] = useState({ title: "", content: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { toast } = useToast()

  // Load existing data when component mounts
  useEffect(() => {
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    setIsLoadingData(true)
    try {
      // Load FAQs
      const faqResponse = await fetch("/api/faqs")
      if (faqResponse.ok) {
        const faqData = await faqResponse.json()
        setFaqs(faqData || [])
        console.log("Loaded FAQs:", faqData?.length || 0)
      }

      // Load Knowledge Base
      const knowledgeResponse = await fetch("/api/knowledge")
      if (knowledgeResponse.ok) {
        const knowledgeData = await knowledgeResponse.json()
        setKnowledgeBase(knowledgeData || [])
        console.log("Loaded Knowledge Base entries:", knowledgeData?.length || 0)
      }
    } catch (error) {
      console.error("Error loading existing data:", error)
      toast({
        title: "Error",
        description: "Failed to load existing data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const addFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both question and answer fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      })

      if (response.ok) {
        const faq = await response.json()
        setFaqs([faq, ...faqs]) // Add to beginning of array
        setNewFaq({ question: "", answer: "" })
        toast({
          title: "Success",
          description: "FAQ added successfully!",
        })
      } else {
        throw new Error("Failed to add FAQ")
      }
    } catch (error) {
      console.error("Error adding FAQ:", error)
      toast({
        title: "Error",
        description: "Failed to add FAQ. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addKnowledge = async () => {
    if (!newKnowledge.title.trim() || !newKnowledge.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newKnowledge),
      })

      if (response.ok) {
        const knowledge = await response.json()
        setKnowledgeBase([knowledge, ...knowledgeBase]) // Add to beginning of array
        setNewKnowledge({ title: "", content: "" })
        toast({
          title: "Success",
          description: "Knowledge base entry added successfully!",
        })
      } else {
        throw new Error("Failed to add knowledge base entry")
      }
    } catch (error) {
      console.error("Error adding knowledge:", error)
      toast({
        title: "Error",
        description: "Failed to add knowledge base entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFaq = async (id: string) => {
    try {
      const response = await fetch(`/api/faqs/${id}`, { method: "DELETE" })
      if (response.ok) {
        setFaqs(faqs.filter((faq) => faq.id !== id))
        toast({
          title: "Success",
          description: "FAQ deleted successfully!",
        })
      } else {
        throw new Error("Failed to delete FAQ")
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error)
      toast({
        title: "Error",
        description: "Failed to delete FAQ.",
        variant: "destructive",
      })
    }
  }

  const deleteKnowledge = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge/${id}`, { method: "DELETE" })
      if (response.ok) {
        setKnowledgeBase(knowledgeBase.filter((kb) => kb.id !== id))
        toast({
          title: "Success",
          description: "Knowledge base entry deleted successfully!",
        })
      } else {
        throw new Error("Failed to delete knowledge base entry")
      }
    } catch (error) {
      console.error("Error deleting knowledge:", error)
      toast({
        title: "Error",
        description: "Failed to delete knowledge base entry.",
        variant: "destructive",
      })
    }
  }

  const widgetScript = `<!-- AI Chatbot Widget -->
<script>
  (function() {
    var chatbotConfig = {
      apiUrl: '${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/chat',
      theme: {
        primaryColor: '#3b82f6',
        fontFamily: 'system-ui, sans-serif'
      }
    };
    
    var script = document.createElement('script');
    script.src = '${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/widget.js';
    script.async = true;
    script.onload = function() {
      if (window.AIChatbot) {
        window.AIChatbot.init(chatbotConfig);
      }
    };
    document.head.appendChild(script);
  })();
</script>`

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your chatbot data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            AI Chatbot Platform
          </h1>
          <p className="text-gray-600 mt-2">Manage your AI chatbot's knowledge base and get the embed code</p>
          <div className="mt-2 text-sm text-gray-500">
            📊 {faqs.length} FAQs • {knowledgeBase.length} Knowledge Base entries
          </div>
        </div>

        <Tabs defaultValue="faqs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              FAQs ({faqs.length})
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Knowledge Base ({knowledgeBase.length})
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Embed Code
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Test Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New FAQ</CardTitle>
                <CardDescription>
                  Add frequently asked questions and their answers to train your chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    placeholder="What is your return policy?"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Our return policy allows returns within 30 days..."
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button onClick={addFaq} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add FAQ
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {faqs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No FAQs added yet. Add your first FAQ above!</p>
                  </CardContent>
                </Card>
              ) : (
                faqs.map((faq) => (
                  <Card key={faq.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                          <p className="text-gray-600 text-sm">{faq.answer}</p>
                          <Badge variant="secondary" className="mt-2">
                            {new Date(faq.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFaq(faq.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Knowledge Base Content</CardTitle>
                <CardDescription>
                  Add detailed content that your chatbot can reference to answer questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Product Features Overview"
                    value={newKnowledge.title}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Our product offers comprehensive features including..."
                    value={newKnowledge.content}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
                    rows={6}
                  />
                </div>
                <Button onClick={addKnowledge} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add to Knowledge Base
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {knowledgeBase.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No knowledge base entries yet. Add your first entry above!</p>
                  </CardContent>
                </Card>
              ) : (
                knowledgeBase.map((kb) => (
                  <Card key={kb.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{kb.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-3">{kb.content}</p>
                          <Badge variant="secondary" className="mt-2">
                            {new Date(kb.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteKnowledge(kb.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="embed">
            <Card>
              <CardHeader>
                <CardTitle>Embed Your Chatbot</CardTitle>
                <CardDescription>
                  Copy and paste this code into your website's HTML to add the chatbot widget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{widgetScript}</pre>
                </div>
                <Button
                  className="mt-4"
                  onClick={() => {
                    navigator.clipboard.writeText(widgetScript)
                    toast({
                      title: "Copied!",
                      description: "Embed code copied to clipboard",
                    })
                  }}
                >
                  Copy Embed Code
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Test Your Chatbot</CardTitle>
                <CardDescription>Try out your chatbot here before embedding it on your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg min-h-[400px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Bot className="h-12 w-12 mx-auto mb-4" />
                    <p>Chatbot widget will appear here</p>
                    <p className="text-sm mt-2">
                      {faqs.length === 0 && knowledgeBase.length === 0
                        ? "Add some FAQs and knowledge base content first"
                        : `Ready to test with ${faqs.length + knowledgeBase.length} entries`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
