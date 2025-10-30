"use client"

import { useState } from 'react'
import AnalysisForm from '@/components/ats/AnalysisForm'
import AnalysisReport from '@/components/ats/AnalysisReport'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Target } from 'lucide-react'

// Define types directly in the page
interface SkillProficiency {
  estimated_level: string;
  evidence: string[];
}

interface InferredSoftSkill {
  evidence: string[];
}

interface DepthAnalysis {
  skill_proficiency?: Record<string, SkillProficiency>;
  inferred_soft_skills?: Record<string, InferredSoftSkill>;
  error?: string;
  warning?: string;
}

interface AnalysisResult {
  score: number;
  atsScore: number;
  toneScore: number;
  contentScore: number;
  structureScore: number;
  skillsScore: number;
  analysisSummary?: string;
  toneDetails: { checks: string[]; warnings: string[] };
  contentDetails: { checks: string[]; warnings: string[] };
  structureDetails: { checks: string[]; warnings: string[] };
  skillsDetails: { checks: string[]; warnings: string[] };
  actionableRecommendations?: string[];
  keywordAnalysis?: { matchedKeywords: string[]; missingKeywords: string[] };
  depth_analysis?: DepthAnalysis;
}

interface AnalysisRequest {
  resumeFile: File
  jobRole?: string
  jobDescription?: string
}

// API function for resume analysis
const analyzeResume = async (data: AnalysisRequest): Promise<AnalysisResult> => {
  const formData = new FormData()
  formData.append('resumeFile', data.resumeFile)
  if (data.jobRole) formData.append('jobRole', data.jobRole)
  if (data.jobDescription) formData.append('jobDescription', data.jobDescription)

  const response = await fetch('/api/ats/analyze', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Something went wrong')
  }

  const result = await response.json()
  if (!result.success || !result.analysis) {
    throw new Error('Invalid response from server')
  }
  return result.analysis
}

export default function AnalyzeResumePage() {
  const analysisMutation = useMutation({
    mutationFn: analyzeResume,
  })

  const handleAnalysis = (data: AnalysisRequest) => {
    analysisMutation.mutate(data)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">ATS Resume Analyzer</h1>
        <p className="text-muted-foreground">
          Optimize your resume for Applicant Tracking Systems with AI-powered analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <AnalysisForm
          onSubmit={handleAnalysis}
          isPending={analysisMutation.isPending}
          error={analysisMutation.error?.message}
        />

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Analysis Report
                </CardTitle>
                <CardDescription>
                    Your resume analysis and optimization suggestions will appear here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {analysisMutation.isPending ? (
                    <div className="text-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-2">Analyzing your resume...</h3>
                        <p className="text-muted-foreground">
                            This may take a moment. Please don't leave the page.
                        </p>
                    </div>
                ) : analysisMutation.data ? (
                    <AnalysisReport data={analysisMutation.data} />
                ) : (
                     <div className="text-center py-12 text-muted-foreground">
                        <p>Your report will be generated here after you submit your resume.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}