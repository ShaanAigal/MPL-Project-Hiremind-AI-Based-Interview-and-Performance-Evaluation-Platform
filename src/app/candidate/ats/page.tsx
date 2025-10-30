// "use client"

// import { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import { useMutation } from '@tanstack/react-query'
// import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
// import 'react-circular-progressbar/dist/styles.css'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { 
//   Upload, 
//   FileText, 
//   Briefcase, 
//   File, 
//   X, 
//   CheckCircle, 
//   XCircle, 
//   AlertCircle,
//   Loader2,
//   Star,
//   TrendingUp,
//   Target,
//   Lightbulb,
//   PlusCircle
// } from 'lucide-react'
// import Link from 'next/link'

// // Zod schema for form validation
// const resumeUploadSchema = z.object({
//   jobRole: z.string().optional(),
//   jobDescription: z.string().optional(),
//   resumeFile: z
//     .any()
//     .refine((file) => file && typeof file === 'object' && 'name' in file && 'size' in file && 'type' in file, {
//       message: 'Please select a file',
//     })
//     .refine((file) => file && file.size <= 10 * 1024 * 1024, {
//       message: 'File size must be less than 10MB',
//     })
//     .refine((file) => file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), {
//       message: 'Only PDF and DOCX files are allowed',
//     }),
// })

// type ResumeUploadForm = z.infer<typeof resumeUploadSchema>

// interface AnalysisResult {
//   score: number
//   atsScore: number
//   toneScore: number
//   contentScore: number
//   structureScore: number
//   skillsScore: number
//   toneDetails: {
//     checks: string[]
//     warnings: string[]
//   }
//   contentDetails: {
//     checks: string[]
//     warnings: string[]
//   }
//   structureDetails: {
//     checks: string[]
//     warnings: string[]
//   }
//   skillsDetails: {
//     checks: string[]
//     warnings: string[]
//   }
// }

// interface AnalysisRequest {
//   resumeFile: File
//   jobRole?: string
//   jobDescription?: string
// }

// // API function for resume analysis
// const analyzeResume = async (data: AnalysisRequest): Promise<AnalysisResult> => {
//   const formData = new FormData()
//   formData.append('resumeFile', data.resumeFile)
//   if (data.jobRole) {
//     formData.append('jobRole', data.jobRole)
//   }
//   if (data.jobDescription) {
//     formData.append('jobDescription', data.jobDescription)
//   }

//   const response = await fetch('/api/ats/analyze', {
//     method: 'POST',
//     body: formData,
//   })

//   if (!response.ok) {
//     const errorData = await response.json()
//     throw new Error(errorData.error || 'Something went wrong')
//   }

//   const result = await response.json()
//   if (!result.success || !result.analysis) {
//     throw new Error('Invalid response from server')
//   }
//   return result.analysis
// }

// // Helper function to get color based on score
// const getScoreColor = (score: number) => {
//   if (score >= 75) return '#10b981' // green
//   if (score >= 50) return '#f59e0b' // yellow
//   return '#ef4444' // red
// }

// // Helper function to get score description
// const getScoreDescription = (score: number) => {
//   if (score >= 90) return 'Excellent'
//   if (score >= 75) return 'Good'
//   if (score >= 50) return 'Fair'
//   return 'Needs Improvement'
// }

// export default function ATSDashboard() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [selectedFileName, setSelectedFileName] = useState<string>('')
//   const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     watch,
//     setValue,
//   } = useForm<ResumeUploadForm>({
//     resolver: zodResolver(resumeUploadSchema),
//   })

//   const selectedFile = watch('resumeFile')

//   const analysisMutation = useMutation({
//     mutationFn: analyzeResume,
//     onSuccess: () => {
//       setIsDialogOpen(false)
//       reset()
//       setSelectedFileName('')
//     },
//   })

//   const toggleSection = (sectionName: string) => {
//     setExpandedSections(prev => {
//       const newSet = new Set(prev)
//       if (newSet.has(sectionName)) {
//         newSet.delete(sectionName)
//       } else {
//         newSet.add(sectionName)
//       }
//       return newSet
//     })
//   }

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
//         alert('Only PDF and DOCX files are allowed.')
//         return
//       }
//       if (file.size > 10 * 1024 * 1024) {
//         alert('File size must be less than 10MB.')
//         return
//       }
//       setSelectedFileName(file.name)
//       setValue('resumeFile', file)
//     }
//   }

//   const clearSelectedFile = () => {
//     setSelectedFileName('')
//     setValue('resumeFile', undefined as any)
//     const fileInput = document.getElementById('resumeFile') as HTMLInputElement;
//     if (fileInput) fileInput.value = '';
//   }

//   const onSubmit = (data: ResumeUploadForm) => {
//     analysisMutation.mutate({
//       resumeFile: data.resumeFile,
//       jobRole: data.jobRole,
//       jobDescription: data.jobDescription,
//     })
//   }

//   const handleDialogClose = () => {
//     setIsDialogOpen(false)
//     reset()
//     setSelectedFileName('')
//     analysisMutation.reset()
//   }

//   return (
//     <div className="p-6 h-full overflow-y-auto">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-foreground mb-2">ATS Dashboard</h1>
//         <p className="text-muted-foreground">Analyze your resume or create a new one from scratch.</p>
//       </div>

//       <div className="grid md:grid-cols-2 gap-6 mb-8">
//         {/* Resume Analysis Card */}
//         <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
//             <Card className="hover:shadow-lg transition-shadow">
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <FileText className="h-5 w-5" />
//                         Resume Analysis
//                     </CardTitle>
//                     <CardDescription>Upload your resume to get an AI-powered ATS analysis.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <DialogTrigger asChild>
//                         <Button className="w-full">
//                             <Upload className="h-4 w-4 mr-2" />
//                             Analyze Resume
//                         </Button>
//                     </DialogTrigger>
//                 </CardContent>
//             </Card>
//             <DialogContent className="max-w-md">
//                 <DialogHeader>
//                     <DialogTitle>Resume Analysis</DialogTitle>
//                     <DialogDescription>Upload your resume and optionally provide job details for targeted analysis.</DialogDescription>
//                 </DialogHeader>
//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                     {/* Form fields... */}
//                     <div className="space-y-2">
//                         <Label htmlFor="jobRole">Job Role (Optional)</Label>
//                         <Input id="jobRole" placeholder="e.g., Senior Software Engineer" {...register('jobRole')} />
//                     </div>
//                     <div className="space-y-2">
//                         <Label htmlFor="jobDescription">Job Description (Optional)</Label>
//                         <Textarea id="jobDescription" placeholder="Paste job description..." {...register('jobDescription')} />
//                     </div>
//                     <div className="space-y-2">
//                         <Label htmlFor="resumeFile">Upload Resume *</Label>
//                         <Input id="resumeFile" type="file" accept=".pdf,.docx" onChange={handleFileChange} />
//                         {selectedFileName && (
//                             <div className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
//                                 <span>{selectedFileName}</span>
//                                 <Button variant="ghost" size="sm" onClick={clearSelectedFile}><X className="h-4 w-4" /></Button>
//                             </div>
//                         )}
//                         {errors.resumeFile && <p className="text-sm text-red-600">{errors.resumeFile.message?.toString()}</p>}
//                     </div>
//                     {analysisMutation.error && <p className="text-sm text-red-600">{analysisMutation.error.message}</p>}
//                     <DialogFooter>
//                         <Button type="button" variant="outline" onClick={handleDialogClose}>Cancel</Button>
//                         <Button type="submit" disabled={analysisMutation.isPending || !selectedFileName}>
//                             {analysisMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                             Analyze
//                         </Button>
//                     </DialogFooter>
//                 </form>
//             </DialogContent>
//         </Dialog>

//         {/* Create New Resume Card */}
//         <Link href="/candidate/ats/create">
//             <Card className="hover:shadow-lg transition-shadow">
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <PlusCircle className="h-5 w-5" />
//                         Create New Resume
//                     </CardTitle>
//                     <CardDescription>Build a professional resume from scratch with our guided editor.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <Button className="w-full" variant="secondary">
//                         <PlusCircle className="h-4 w-4 mr-2" />
//                         Create Resume
//                     </Button>
//                 </CardContent>
//             </Card>
//         </Link>
//       </div>

//       {/* Analysis Results */}
//       {(analysisMutation.data || analysisMutation.isPending) && (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Analysis Report</CardTitle>
//                 <CardDescription>Here's the breakdown of your resume's ATS performance.</CardDescription>
//             </CardHeader>
//             <CardContent>
//                 {analysisMutation.isPending ? (
//                     <div className="flex justify-center items-center py-12">
//                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                         <p className="ml-4 text-muted-foreground">Analyzing your resume...</p>
//                     </div>
//                 ) : analysisMutation.data && (
//                     <div className="space-y-6">
//                         {/* Overall Scores */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
//                             <div>
//                                 <div className="w-32 h-32 mx-auto">
//                                     <CircularProgressbar value={analysisMutation.data.score} text={`${analysisMutation.data.score}%`} styles={buildStyles({ pathColor: getScoreColor(analysisMutation.data.score), textColor: 'hsl(var(--foreground))' })} />
//                                 </div>
//                                 <h3 className="text-lg font-semibold mt-2">Overall Score</h3>
//                                 <p className="text-sm text-muted-foreground">{getScoreDescription(analysisMutation.data.score)}</p>
//                             </div>
//                             <div>
//                                 <div className="w-32 h-32 mx-auto">
//                                     <CircularProgressbar value={analysisMutation.data.atsScore} text={`${analysisMutation.data.atsScore}%`} styles={buildStyles({ pathColor: getScoreColor(analysisMutation.data.atsScore), textColor: 'hsl(var(--foreground))' })} />
//                                 </div>
//                                 <h3 className="text-lg font-semibold mt-2">ATS Compatibility</h3>
//                                 <p className="text-sm text-muted-foreground">{getScoreDescription(analysisMutation.data.atsScore)}</p>
//                             </div>
//                         </div>

//                         {/* Detailed Sections */}
//                         <div className="space-y-4">
//                             {Object.entries({
//                                 'Tone & Style': analysisMutation.data.toneDetails,
//                                 'Content': analysisMutation.data.contentDetails,
//                                 'Structure': analysisMutation.data.structureDetails,
//                                 'Skills': analysisMutation.data.skillsDetails,
//                             }).map(([category, details]) => (
//                                 <div key={category} className="border rounded-lg">
//                                     <h4 className="text-md font-semibold p-4 border-b bg-muted/50">{category}</h4>
//                                     <div className="p-4 grid md:grid-cols-2 gap-4">
//                                         <div>
//                                             <h5 className="font-semibold text-green-600 flex items-center mb-2"><CheckCircle className="h-4 w-4 mr-2" />Strong Points</h5>
//                                             <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
//                                                 {details.checks.map((check, i) => <li key={i}>{check}</li>)}
//                                             </ul>
//                                         </div>
//                                         <div>
//                                             <h5 className="font-semibold text-red-600 flex items-center mb-2"><XCircle className="h-4 w-4 mr-2" />Weak Points</h5>
//                                             <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
//                                                 {details.warnings.map((warning, i) => <li key={i}>{warning}</li>)}
//                                             </ul>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Key Improvements */}
//                         <div className="border rounded-lg">
//                              <h4 className="text-md font-semibold p-4 border-b bg-muted/50 flex items-center"><Lightbulb className="h-4 w-4 mr-2" />Key Improvement Points</h4>
//                              <div className="p-4">
//                                 <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
//                                     {/* Combining warnings from all sections for improvement points */}
//                                     {Object.values(analysisMutation.data).flatMap((details: any) => details.warnings || []).slice(0, 5).map((warning: any, i) => (
//                                         <li key={i}>{warning}</li>
//                                     ))}
//                                 </ul>
//                              </div>
//                         </div>
//                     </div>
//                 )}
//             </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }


"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, PlusCircle, Upload } from 'lucide-react'
import Link from 'next/link'

export default function ATSDashboard() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">ATS Dashboard</h1>
        <p className="text-muted-foreground">Analyze your resume or create a new one from scratch.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Resume Analysis Card */}
        <Link href="/candidate/ats/analyze">
            <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Resume Analysis
                    </CardTitle>
                    <CardDescription>Upload your resume to get an AI-powered ATS analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Analyze Resume
                    </Button>
                </CardContent>
            </Card>
        </Link>

        {/* Create New Resume Card */}
        <Link href="/candidate/ats/create">
            <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5" />
                        Create New Resume
                    </CardTitle>
                    <CardDescription>Build a professional resume from scratch with our guided editor.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Resume
                    </Button>
                </CardContent>
            </Card>
        </Link>
      </div>
    </div>
  )
}