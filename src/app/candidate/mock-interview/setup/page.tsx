"use client"

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  User,
  Briefcase,
  FileText,
  Video,
  Mic,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  File,
  X,
  Camera,
  MicIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


// Step 1: Candidate Info Schema
const candidateInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  jobRole: z.string().min(1, 'Job role is required'),
  jobDescription: z.string().optional(),
  resumeFile: z
    .any()
    .optional()
    .refine((file) => !file || (file && typeof file === 'object' && 'name' in file && 'size' in file && 'type' in file), {
      message: 'Please select a valid file',
    })
    .refine((file) => !file || (file && file.size <= 10 * 1024 * 1024), {
      message: 'File size must be less than 10MB',
    })
    .refine((file) => !file || (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')), {
      message: 'Only PDF and DOCX files are allowed',
    }),
})

type CandidateInfoForm = z.infer<typeof candidateInfoSchema>

interface OnboardingData {
  candidateInfo: CandidateInfoForm
  permissionsGranted: boolean
  webcamWorking: boolean
  microphoneWorking: boolean
  interviewDuration: number
}

export default function MockInterviewOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    candidateInfo: {
      name: '',
      jobRole: '',
      jobDescription: '',
      resumeFile: undefined
    },
    permissionsGranted: false,
    webcamWorking: false,
    microphoneWorking: false,
    interviewDuration: 10, 
  })
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameId = useRef<number | null>(null);


  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<CandidateInfoForm>({
    resolver: zodResolver(candidateInfoSchema),
  })

  const selectedFile = watch('resumeFile')

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.includes('pdf') && !file.type.includes('wordprocessingml')) {
        alert('Please select a PDF or DOCX file only.')
        event.target.value = ''
        setSelectedFileName('')
        setValue('resumeFile', undefined as any)
        return
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.')
        event.target.value = ''
        setSelectedFileName('')
        setValue('resumeFile', undefined as any)
        return
      }

      setSelectedFileName(file.name)
      setValue('resumeFile', file)
    }
  }

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFileName('')
    setValue('resumeFile', undefined as any)
    const fileInput = document.getElementById('resumeFile') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

    // Stop audio test
    const stopAudioTest = () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
    };

  // Request media permissions
  const requestMediaPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      setStream(mediaStream)
      setOnboardingData(prev => ({
        ...prev,
        permissionsGranted: true,
        webcamWorking: true,
        microphoneWorking: true
      }))

      // Test audio levels
      testAudioLevels(mediaStream)

    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Unable to access camera and microphone. Please check your permissions and try again.')
    }
  }

  // Test audio levels
  const testAudioLevels = (mediaStream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(mediaStream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    microphone.connect(analyser);
    analyser.fftSize = 256;

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    microphoneRef.current = microphone;


    const checkAudioLevel = () => {
        if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            setAudioLevel(average);

            if (average > 5) {
                setOnboardingData(prev => ({ ...prev, microphoneWorking: true }));
            }
        }
        animationFrameId.current = requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
};


  // Handle step 1 submission
  const onStep1Submit = (data: CandidateInfoForm) => {
    setOnboardingData(prev => ({
      ...prev,
      candidateInfo: data
    }))
    setCurrentStep(2)
  }

  // Handle step 2 completion
  const handleStep2Complete = () => {
    if (onboardingData.permissionsGranted && onboardingData.webcamWorking && onboardingData.microphoneWorking) {
      setCurrentStep(3)
    } else {
      alert('Please ensure both camera and microphone are working before proceeding.')
    }
  }

  // Handle step 3 completion
  const handleStartInterview = () => {
    // Store onboarding data in sessionStorage for the interview session
    sessionStorage.setItem('mockInterviewData', JSON.stringify(onboardingData))
    router.push('/candidate/mock-interview/session')
  }
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

// Cleanup stream when component unmounts
const cleanup = () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
    }
    stopAudioTest();
    if (microphoneRef.current) {
        microphoneRef.current.disconnect();
        microphoneRef.current = null;
    }
    if (analyserRef.current) {
        analyserRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
};

useEffect(() => {
    return () => {
      cleanup()
    };
}, []);
  // Render step 1: Candidate Info
  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Step 1: Candidate Information
        </CardTitle>
        <CardDescription>
          Tell us about yourself and the position you're interviewing for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Job Role */}
          <div className="space-y-2">
            <Label htmlFor="jobRole">Job Role *</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="jobRole"
                placeholder="e.g., Senior Software Engineer"
                className="pl-10"
                {...register('jobRole')}
              />
            </div>
            {errors.jobRole && (
              <p className="text-sm text-red-600">{errors.jobRole.message}</p>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description (Optional)</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here for better interview preparation..."
              className="min-h-[100px]"
              {...register('jobDescription')}
            />
            {errors.jobDescription && (
              <p className="text-sm text-red-600">{errors.jobDescription.message}</p>
            )}
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resumeFile">Resume Upload (Optional)</Label>
            <div className="relative">
              <File className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="resumeFile"
                type="file"
                accept=".pdf,.docx"
                className="pl-10 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:file:bg-accent"
                onChange={handleFileChange}
              />
            </div>

            {/* Selected File Display */}
            {selectedFileName && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{selectedFileName}</span>
                  {selectedFile && (
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedFile}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {errors.resumeFile && (
              <p className="text-sm text-red-600">{errors.resumeFile.message?.toString()}</p>
            )}
            <p className="text-xs text-muted-foreground">
              PDF and DOCX files accepted, max 10MB
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="flex items-center gap-2">
              Next: Permissions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  // Render step 2: Permissions
  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Step 2: Camera & Microphone Setup
        </CardTitle>
        <CardDescription>
          We need access to your camera and microphone for the interview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!onboardingData.permissionsGranted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Grant Permissions</h3>
            <p className="text-muted-foreground mb-6">
              Click the button below to allow access to your camera and microphone
            </p>
            <Button onClick={requestMediaPermissions} className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Allow Camera & Microphone Access
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Webcam Preview */}
            <div className="space-y-2">
              <Label>Camera Preview</Label>
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-82 object-cover"
                  muted
                  autoPlay
                  playsInline
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  <Camera className="h-3 w-3" />
                  {onboardingData.webcamWorking ? (
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-400" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {onboardingData.webcamWorking ? 'Camera is working properly' : 'Camera not detected'}
              </p>
            </div>

            {/* Microphone Test */}
            <div className="space-y-2">
              <Label>Microphone Test</Label>
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <MicIcon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Audio Level:</span>
                    <div className="flex-1 bg-background rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-100"
                        style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(audioLevel)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Speak into your microphone...
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {onboardingData.microphoneWorking ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Setup Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">Camera:</span>
                  {onboardingData.webcamWorking ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {onboardingData.webcamWorking ? 'Working' : 'Not working'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MicIcon className="h-4 w-4" />
                  <span className="text-sm">Microphone:</span>
                  {onboardingData.microphoneWorking ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {onboardingData.microphoneWorking ? 'Working' : 'Not working'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleStep2Complete}
                disabled={!onboardingData.webcamWorking || !onboardingData.microphoneWorking}
                className="flex items-center gap-2"
              >
                Next: Instructions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Render step 3: Instructions
  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Step 3: Interview Instructions
        </CardTitle>
        <CardDescription>
          Please read these guidelines before starting your mock interview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Do's */}
        <div className="space-y-3">
          <h4 className="font-semibold text-green-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Do's
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Maintain good eye contact with the camera</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Speak clearly and at a moderate pace</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Dress professionally as you would for a real interview</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Find a quiet, well-lit environment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Have your resume and notes ready for reference</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Take your time to think before answering questions</span>
            </li>
          </ul>
        </div>

        {/* Don'ts */}
        <div className="space-y-3">
          <h4 className="font-semibold text-red-600 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Don'ts
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Don't look at your phone or other devices during the interview</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Avoid reading directly from notes or scripts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Don't interrupt the interviewer while they're speaking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Avoid negative body language or slouching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Don't rush through your answers</span>
            </li>
          </ul>
        </div>

        {/* Interview Details */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Interview Details</h4>
          <div className="space-y-1 text-sm text-muted-foreground">

            <div className="flex items-center space-x-2">
              <Label htmlFor="interview-duration">Duration:</Label>
              <Select
                value={onboardingData.interviewDuration.toString()}
                onValueChange={(value) => setOnboardingData(prev => ({ ...prev, interviewDuration: parseInt(value, 10) }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p><strong>Format:</strong> Video interview with AI interviewer</p>
            <p><strong>Questions:</strong> Mix of technical and behavioral questions</p>
            <p><strong>Recording:</strong> This session will be recorded for review</p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleStartInterview}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Video className="h-4 w-4" />
            Start Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Mock Interview Setup
        </h1>
        <p className="text-muted-foreground">
          Complete the setup process to begin your AI-powered mock interview
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of 3
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  )
}