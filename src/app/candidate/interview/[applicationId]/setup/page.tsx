"use client"

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Video, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Camera, 
  MicIcon, 
  CheckCircle2
} from 'lucide-react';

export default function RealInterviewSetupPage({ params }: { params: { applicationId: string } }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    
    // State and Refs
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const [webcamWorking, setWebcamWorking] = useState(false);
    const [microphoneWorking, setMicrophoneWorking] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameId = useRef<number | null>(null);

    const stopAudioTest = () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
    };

    const testAudioLevels = (mediaStream: MediaStream) => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(mediaStream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            microphone.connect(analyser);
            analyser.fftSize = 256;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            microphoneRef.current = microphone;

            // Check if audio track exists and is enabled
            const audioTracks = mediaStream.getAudioTracks();
            if (audioTracks.length > 0 && audioTracks[0].enabled) {
                console.log('Audio track found and enabled:', audioTracks[0].label);
                // Set microphone as working immediately if track is available
                setMicrophoneWorking(true);
            }

            const checkAudioLevel = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                    setAudioLevel(average);

                    // Keep microphone working status if audio track is active
                    if (audioTracks.length > 0 && audioTracks[0].enabled) {
                        setMicrophoneWorking(true);
                    }
                }
                animationFrameId.current = requestAnimationFrame(checkAudioLevel);
            };
            checkAudioLevel();
        } catch (error) {
            console.error('Error setting up audio test:', error);
        }
    };

    const requestMediaPermissions = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            console.log('Media stream obtained');
            console.log('Video tracks:', mediaStream.getVideoTracks());
            console.log('Audio tracks:', mediaStream.getAudioTracks());
            
            setStream(mediaStream);
            setPermissionsGranted(true);
            
            // Check video tracks
            const videoTracks = mediaStream.getVideoTracks();
            if (videoTracks.length > 0 && videoTracks[0].enabled) {
                setWebcamWorking(true);
                console.log('Webcam working');
            }
            
            // Check audio tracks
            const audioTracks = mediaStream.getAudioTracks();
            if (audioTracks.length > 0 && audioTracks[0].enabled) {
                setMicrophoneWorking(true);
                console.log('Microphone working');
            }
            
            // Start audio level monitoring
            testAudioLevels(mediaStream);
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Unable to access camera and microphone. Please check your browser permissions and try again.');
        }
    };
    
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const cleanup = () => {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
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
          cleanup();
        };
    }, []);

    const renderStep1 = () => (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Step 1: Camera & Microphone Setup
                </CardTitle>
                <CardDescription>
                    Let's check your devices to ensure a smooth interview experience.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!permissionsGranted ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Camera className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Grant Permissions</h3>
                        <p className="text-muted-foreground mb-6">
                            Click the button below to allow access to your camera and microphone.
                        </p>
                        <Button onClick={requestMediaPermissions}>
                            <Video className="h-4 w-4 mr-2" />
                            Allow Camera & Mic
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Camera Preview</Label>
                            <div className="relative bg-muted rounded-lg overflow-hidden">
                                <video 
                                    ref={videoRef} 
                                    className="w-full h-80 object-cover" 
                                    muted 
                                    autoPlay 
                                    playsInline 
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Microphone Test</Label>
                            <p className="text-sm text-muted-foreground">
                                Speak to test your microphone. The bar will move when sound is detected.
                            </p>
                            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                <MicIcon className="h-5 w-5" />
                                <div className="flex-1 bg-background rounded-full h-2">
                                    <div 
                                        className="bg-primary h-2 rounded-full transition-all duration-100" 
                                        style={{ width: `${Math.min(audioLevel * 2, 100)}%` }} 
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground min-w-[40px]">
                                    {Math.round(audioLevel)}%
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                <span>Camera Status:</span>
                                {webcamWorking ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className={webcamWorking ? "text-green-600" : "text-red-600"}>
                                    {webcamWorking ? "Working" : "Not Detected"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MicIcon className="h-4 w-4" />
                                <span>Microphone Status:</span>
                                {microphoneWorking ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className={microphoneWorking ? "text-green-600" : "text-red-600"}>
                                    {microphoneWorking ? "Working" : "Not Detected"}
                                </span>
                            </div>
                        </div>
                        
                        {(!webcamWorking || !microphoneWorking) && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>Tip:</strong> If your microphone isn't detected, try speaking into it. 
                                    The microphone is working if you see the green checkmark.
                                </p>
                            </div>
                        )}
                        
                        <div className="flex justify-end">
                            <Button 
                                onClick={() => setCurrentStep(2)} 
                                disabled={!webcamWorking || !microphoneWorking}
                            >
                                Next: Instructions
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderStep2 = () => (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Step 2: Interview Instructions
                </CardTitle>
                <CardDescription>
                    Please read these guidelines before starting your interview.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <h4 className="font-semibold text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Do's
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                        <li>Find a quiet, well-lit environment.</li>
                        <li>Speak clearly and at a moderate pace.</li>
                        <li>Treat this as a real professional interview.</li>
                    </ul>
                </div>
                
                <div className="space-y-3">
                    <h4 className="font-semibold text-red-600 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Don'ts
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                        <li>Don't have distractions in your background.</li>
                        <li>Avoid reading answers directly from notes.</li>
                        <li>Don't use your phone or other devices.</li>
                    </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Interview Details</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Duration:</strong> 15 minutes</p>
                        <p><strong>Format:</strong> Video interview with AI interviewer</p>
                        <p><strong>Questions:</strong> Mix of technical and behavioral questions</p>
                    </div>
                </div>
                
                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <Button 
                        onClick={() => router.push(`/candidate/interview/${params.applicationId}/session`)} 
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Video className="h-4 w-4 mr-2" />
                        Start Interview
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Interview Setup</h1>
                <p className="text-muted-foreground">
                    Complete the setup process to begin your AI-powered interview.
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center justify-center space-x-4">
                    {[1, 2].map((step) => (
                        <div key={step} className="flex items-center">
                            <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    currentStep >= step 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {step}
                            </div>
                            {step < 2 && (
                                <div 
                                    className={`w-16 h-1 mx-2 ${
                                        currentStep > step ? 'bg-primary' : 'bg-muted'
                                    }`} 
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
        </div>
    );
}