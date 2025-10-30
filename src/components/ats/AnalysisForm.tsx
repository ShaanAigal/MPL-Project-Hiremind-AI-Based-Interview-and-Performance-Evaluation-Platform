"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Briefcase, File, FileText, Loader2, X } from 'lucide-react'

// Zod Schema
const resumeUploadSchema = z.object({
  jobRole: z.string().optional(),
  jobDescription: z.string().optional(),
  resumeFile: z
    .any()
    .refine((file) => file, 'Please select a file.')
    .refine((file) => file?.size <= 10 * 1024 * 1024, 'File size must be less than 10MB.')
    .refine(
      (file) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file?.type),
      'Only .pdf and .docx formats are supported.'
    ),
})

type ResumeUploadForm = z.infer<typeof resumeUploadSchema>

interface AnalysisFormProps {
  onSubmit: (data: ResumeUploadForm) => void
  isPending: boolean
  error?: string
}

export default function AnalysisForm({ onSubmit, isPending, error }: AnalysisFormProps) {
  const [selectedFileName, setSelectedFileName] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ResumeUploadForm>({
    resolver: zodResolver(resumeUploadSchema),
  })

  const selectedFile = watch('resumeFile')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFileName(file.name)
      setValue('resumeFile', file)
    }
  }

  const clearSelectedFile = () => {
    setSelectedFileName('')
    reset({ resumeFile: undefined, jobRole: watch('jobRole'), jobDescription: watch('jobDescription') })
  }

  const handleFormSubmit = (data: ResumeUploadForm) => {
    onSubmit(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analyze Your Resume
        </CardTitle>
        <CardDescription>
            Upload your resume and provide job details for a targeted analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jobRole">Job Role (Optional)</Label>
            <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="jobRole" placeholder="e.g., Senior Software Engineer" className="pl-10" {...register('jobRole')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description (Optional)</Label>
            <Textarea id="jobDescription" placeholder="Paste the job description here..." className="min-h-[120px]" {...register('jobDescription')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumeFile">Upload Resume *</Label>
            <Input id="resumeFile" type="file" accept=".pdf,.docx" onChange={handleFileChange} />
             {selectedFileName && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md text-sm">
                    <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-primary" />
                        <span className="font-medium">{selectedFileName}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={clearSelectedFile} className="h-6 w-6 p-0"><X className="h-3 w-3" /></Button>
                </div>
            )}
            {errors.resumeFile && <p className="text-sm text-red-600">{errors.resumeFile.message as string}</p>}
             <p className="text-xs text-muted-foreground">PDF and DOCX files accepted, max 10MB.</p>
          </div>
          
           {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
            </div>
            )}


          <Button type="submit" disabled={isPending || !selectedFile} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
               "Analyze Resume"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}