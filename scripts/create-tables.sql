-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_faqs_question ON faqs USING gin(to_tsvector('english', question));
CREATE INDEX IF NOT EXISTS idx_faqs_answer ON faqs USING gin(to_tsvector('english', answer));
CREATE INDEX IF NOT EXISTS idx_knowledge_title ON knowledge_base USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_knowledge_content ON knowledge_base USING gin(to_tsvector('english', content));

-- Enable Row Level Security (optional)
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on faqs" ON faqs FOR ALL USING (true);
CREATE POLICY "Allow all operations on knowledge_base" ON knowledge_base FOR ALL USING (true);
