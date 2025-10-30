// Comprehensive job-specific keyword database for ATS analysis

export const JOB_KEYWORDS = {
  // Software Development
  'software engineer': [
    'programming', 'coding', 'debugging', 'testing', 'algorithms', 'data structures',
    'object-oriented', 'agile', 'scrum', 'version control', 'git', 'code review',
    'software development lifecycle', 'api', 'database', 'web development'
  ],
  
  'frontend developer': [
    'html', 'css', 'javascript', 'react', 'vue', 'angular', 'typescript',
    'responsive design', 'ui/ux', 'sass', 'webpack', 'npm', 'dom manipulation',
    'cross-browser compatibility', 'mobile-first', 'accessibility', 'seo'
  ],
  
  'backend developer': [
    'server-side', 'api development', 'database design', 'sql', 'nosql',
    'microservices', 'rest api', 'graphql', 'authentication', 'authorization',
    'caching', 'performance optimization', 'scalability', 'security'
  ],
  
  'full stack developer': [
    'frontend', 'backend', 'database', 'api integration', 'responsive design',
    'version control', 'deployment', 'cloud services', 'devops', 'testing',
    'agile development', 'problem solving', 'technical documentation'
  ],
  
  'devops engineer': [
    'ci/cd', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp',
    'infrastructure as code', 'terraform', 'ansible', 'monitoring', 'logging',
    'automation', 'deployment', 'containerization', 'orchestration'
  ],
  
  // Data & Analytics
  'data scientist': [
    'machine learning', 'statistics', 'python', 'r', 'sql', 'data analysis',
    'data visualization', 'pandas', 'numpy', 'scikit-learn', 'tensorflow',
    'pytorch', 'jupyter', 'hypothesis testing', 'predictive modeling'
  ],
  
  'data analyst': [
    'data analysis', 'sql', 'excel', 'tableau', 'power bi', 'statistics',
    'data visualization', 'reporting', 'dashboard', 'kpi', 'metrics',
    'business intelligence', 'data mining', 'trend analysis'
  ],
  
  'machine learning engineer': [
    'machine learning', 'deep learning', 'neural networks', 'ai', 'python',
    'tensorflow', 'pytorch', 'scikit-learn', 'model deployment', 'mlops',
    'feature engineering', 'model optimization', 'computer vision', 'nlp'
  ],
  
  // Design & Creative
  'ui/ux designer': [
    'user experience', 'user interface', 'wireframing', 'prototyping',
    'figma', 'sketch', 'adobe creative suite', 'user research', 'usability testing',
    'information architecture', 'interaction design', 'visual design'
  ],
  
  'graphic designer': [
    'adobe creative suite', 'photoshop', 'illustrator', 'indesign',
    'visual design', 'branding', 'typography', 'color theory', 'layout design',
    'print design', 'digital design', 'creative thinking', 'brand identity'
  ],
  
  // Marketing & Sales
  'digital marketing': [
    'seo', 'sem', 'social media marketing', 'content marketing', 'email marketing',
    'google analytics', 'ppc', 'conversion optimization', 'marketing automation',
    'brand management', 'campaign management', 'roi analysis'
  ],
  
  'sales representative': [
    'sales', 'lead generation', 'prospecting', 'closing deals', 'negotiation',
    'customer relationship management', 'crm', 'sales targets', 'pipeline management',
    'product knowledge', 'presentation skills', 'customer service'
  ],
  
  // Project Management
  'project manager': [
    'project management', 'agile', 'scrum', 'waterfall', 'risk management',
    'stakeholder management', 'budget management', 'timeline management',
    'team leadership', 'communication', 'problem solving', 'pmp', 'jira'
  ],
  
  'product manager': [
    'product strategy', 'roadmap', 'user stories', 'market research',
    'competitive analysis', 'product lifecycle', 'agile development',
    'stakeholder management', 'data-driven decisions', 'user feedback'
  ],
  
  // Business & Finance
  'business analyst': [
    'business analysis', 'requirements gathering', 'process improvement',
    'data analysis', 'stakeholder management', 'documentation', 'sql',
    'business intelligence', 'process mapping', 'gap analysis'
  ],
  
  'financial analyst': [
    'financial analysis', 'financial modeling', 'budgeting', 'forecasting',
    'excel', 'financial reporting', 'variance analysis', 'investment analysis',
    'risk assessment', 'valuation', 'accounting principles'
  ],
  
  // HR & Operations
  'human resources': [
    'recruitment', 'talent acquisition', 'employee relations', 'performance management',
    'compensation', 'benefits', 'hr policies', 'compliance', 'training',
    'organizational development', 'conflict resolution', 'hris'
  ],
  
  'operations manager': [
    'operations management', 'process optimization', 'supply chain', 'logistics',
    'inventory management', 'quality control', 'cost reduction', 'efficiency',
    'team management', 'vendor management', 'continuous improvement'
  ],
  
  // Healthcare
  'nurse': [
    'patient care', 'clinical skills', 'medical procedures', 'healthcare',
    'nursing assessment', 'medication administration', 'patient safety',
    'electronic health records', 'infection control', 'emergency response'
  ],
  
  'healthcare administrator': [
    'healthcare management', 'medical records', 'hipaa compliance',
    'healthcare regulations', 'patient services', 'quality assurance',
    'budget management', 'staff coordination', 'healthcare systems'
  ],
  
  // Education
  'teacher': [
    'curriculum development', 'lesson planning', 'classroom management',
    'student assessment', 'educational technology', 'differentiated instruction',
    'parent communication', 'professional development', 'learning objectives'
  ],
  
  // Customer Service
  'customer service': [
    'customer support', 'problem resolution', 'communication skills',
    'active listening', 'empathy', 'patience', 'conflict resolution',
    'product knowledge', 'crm systems', 'customer satisfaction'
  ]
};

// Industry-specific technical skills
export const INDUSTRY_SKILLS = {
  technology: [
    'agile', 'scrum', 'devops', 'cloud computing', 'cybersecurity', 'blockchain',
    'artificial intelligence', 'internet of things', 'big data', 'automation'
  ],
  
  finance: [
    'financial modeling', 'risk management', 'compliance', 'audit', 'taxation',
    'investment banking', 'portfolio management', 'derivatives', 'accounting'
  ],
  
  healthcare: [
    'hipaa', 'clinical research', 'medical devices', 'patient safety',
    'quality assurance', 'regulatory compliance', 'electronic health records'
  ],
  
  marketing: [
    'brand management', 'market research', 'digital marketing', 'analytics',
    'content strategy', 'lead generation', 'customer acquisition', 'roi'
  ],
  
  manufacturing: [
    'lean manufacturing', 'six sigma', 'quality control', 'supply chain',
    'inventory management', 'process improvement', 'safety protocols'
  ]
};

// Soft skills that are universally valuable
export const UNIVERSAL_SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking',
  'creativity', 'adaptability', 'time management', 'attention to detail',
  'critical thinking', 'collaboration', 'initiative', 'reliability', 'flexibility',
  'emotional intelligence', 'conflict resolution', 'mentoring', 'training',
  'presentation skills', 'negotiation', 'customer focus', 'results-oriented'
];

// Function to get relevant keywords for a job role
export function getJobKeywords(jobRole: string): string[] {
  const normalizedRole = jobRole.toLowerCase();
  
  // Direct match
  if (JOB_KEYWORDS[normalizedRole as keyof typeof JOB_KEYWORDS]) {
    return JOB_KEYWORDS[normalizedRole as keyof typeof JOB_KEYWORDS];
  }
  
  // Partial matches
  const keywords: string[] = [];
  
  Object.entries(JOB_KEYWORDS).forEach(([role, roleKeywords]) => {
    if (normalizedRole.includes(role) || role.includes(normalizedRole)) {
      keywords.push(...roleKeywords);
    }
  });
  
  // Add universal soft skills
  keywords.push(...UNIVERSAL_SOFT_SKILLS.slice(0, 10));
  
  return Array.from(new Set(keywords)); // Remove duplicates
}

// Function to get industry-specific skills
export function getIndustrySkills(jobDescription: string): string[] {
  const normalizedDesc = jobDescription.toLowerCase();
  const skills: string[] = [];
  
  Object.entries(INDUSTRY_SKILLS).forEach(([industry, industrySkills]) => {
    if (normalizedDesc.includes(industry)) {
      skills.push(...industrySkills);
    }
  });
  
  return Array.from(new Set(skills));
}
