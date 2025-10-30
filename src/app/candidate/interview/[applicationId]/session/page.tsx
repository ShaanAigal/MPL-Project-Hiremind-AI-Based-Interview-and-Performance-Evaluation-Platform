"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Mic, Phone, PhoneOff, Clock, User, Bot, Loader2, Square, Send } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger,AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";

interface ConversationEntry {
  role: 'user' | 'ai';
  text: string;
}

export default function RealInterviewSessionPage({ params }: { params: { applicationId: string } }) {
    const router = useRouter();
    const [interviewContext, setInterviewContext] = useState<any>(null);
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(15 * 60);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [conversation, setConversation] = useState<ConversationEntry[]>([]);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [textInput, setTextInput] = useState("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                const res = await fetch(`/api/applications/interview-context/${params.applicationId}`);
                const data = await res.json();
                if (!data.success) throw new Error('Failed to fetch interview context');
                setInterviewContext(data.data);
            } catch (error) {
                alert('Error: Could not load interview details.');
                router.push('/candidate/applications');
            }
        };
        fetchContext();
    }, [params.applicationId, router]);

    useEffect(() => {
        if (isInterviewStarted && timeRemaining > 0) {
            timerIntervalRef.current = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
        } else if (timeRemaining <= 0 && isInterviewStarted) {
            endInterview();
        }
        return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
    }, [isInterviewStarted, timeRemaining]);

    useEffect(() => {
        scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }, [conversation]);

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsAiTyping(true);
        utterance.onend = () => setIsAiTyping(false);
        speechSynthesis.speak(utterance);
    };

    const getNextQuestion = async (currentConversation: ConversationEntry[]) => {
        setIsAiTyping(true);
        try {
            const response = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: interviewContext.candidateName, ...interviewContext, conversationHistory: currentConversation }),
            });
            const result = await response.json();
            const aiResponse = result.question;
            setConversation(prev => [...prev, { role: 'ai', text: aiResponse }]);
            speak(aiResponse);
        } catch (error) {
            speak("I'm sorry, I encountered an error.");
        }
    };

    const startInterview = async () => {
        setIsInterviewStarted(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
            await fetch('/api/applications/start-interview', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ applicationId: params.applicationId }) });
            getNextQuestion([]);
        } catch (error) {
            alert("Could not access camera and microphone. Please check your browser permissions.");
            setIsInterviewStarted(false);
        }
    };

    const endInterview = async () => {
        setIsInterviewStarted(false);
        if(isRecording) mediaRecorderRef.current?.stop();
        stream?.getTracks().forEach(track => track.stop());
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        speechSynthesis.cancel();
        
        fetch('/api/interview/analyze', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ applicationId: params.applicationId, jobRole: interviewContext.jobRole, conversation }) }).catch(console.error);
        await fetch('/api/applications/complete-interview', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ applicationId: params.applicationId }) });
        
        router.push(`/candidate/interview/${params.applicationId}/completed`);
    };

    const handleSendTextAnswer = () => {
        if (!textInput.trim()) return;
        const newConversation = [...conversation, { role: 'user' as const, text: textInput }];
        setConversation(newConversation);
        setTextInput("");
        getNextQuestion(newConversation);
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
        } else if (stream && stream.active) {
            try {
                // FIX: Let the browser choose the mimeType for better compatibility
                mediaRecorderRef.current = new MediaRecorder(stream);
                
                mediaRecorderRef.current.ondataavailable = (event) => {
                    if(event.data.size > 0) {
                        audioChunksRef.current.push(event.data)
                    }
                };
                
                mediaRecorderRef.current.onstop = async () => {
                    setIsRecording(false);
                    setIsTranscribing(true);
                    
                    if (audioChunksRef.current.length === 0) {
                        setIsTranscribing(false);
                        speak("I didn't hear anything. Could you please try again?");
                        return;
                    }
                    
                    const mimeType = audioChunksRef.current[0].type;
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                    audioChunksRef.current = [];
                    
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');
                    
                    try {
                        const res = await fetch('/api/interview/transcribe', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (!data.success || !data.transcription) throw new Error(data.error || "Empty transcription");
                        const newConversation = [...conversation, { role: 'user' as const, text: data.transcription }];
                        setConversation(newConversation);
                        getNextQuestion(newConversation);
                    } catch (error) {
                        console.error(error);
                        speak("Sorry, I couldn't quite catch that. Could you please repeat?");
                    } finally {
                        setIsTranscribing(false);
                    }
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);

            } catch(error) {
                console.error("Failed to start MediaRecorder:", error);
                alert("Could not start recording. Please ensure your microphone is connected and permissions are allowed.");
                setIsRecording(false);
            }
        }
    };

    const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    if (!interviewContext) return <div className="p-6 text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="flex h-[calc(100vh-8rem)] w-full p-4 gap-4 bg-background">
            <div className="flex flex-col flex-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 flex-1 gap-4">
                    <Card className="flex flex-col items-center justify-center p-4 bg-muted/30"><Avatar className="w-24 h-24 mb-4"><AvatarImage src="https://placehold.co/128x128/222/fff?text=AI" /></Avatar><h3 className="text-xl font-semibold">HireMind AI</h3><p className="text-muted-foreground">{interviewContext.jobRole}</p>{isAiTyping && <div className="mt-2 text-sm text-blue-400">Speaking...</div>}</Card>
                    <Card className="relative overflow-hidden bg-black flex items-center justify-center"><video ref={videoRef} className="w-full h-full object-cover" muted autoPlay playsInline /><div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">{interviewContext.candidateName}</div></Card>
                </div>
                <div className="flex justify-center items-center gap-4 p-2 bg-card rounded-full border">
                     {!isInterviewStarted ? (
                        <Button size="lg" className="rounded-full w-48" onClick={startInterview}><Phone className="h-5 w-5 mr-2" />Start Interview</Button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Button
                                size="lg"
                                className={`rounded-full w-48 transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={handleToggleRecording}
                                disabled={isAiTyping || isTranscribing}
                            >
                                {isRecording ? <Square className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                                {isRecording ? 'Stop Speaking' : 'Speak Answer'}
                            </Button>
                            <div className="flex items-center gap-2 text-lg font-semibold font-mono"><Clock className="h-5 w-5 text-primary" />{formatTime(timeRemaining)}</div>
                            <AlertDialog><AlertDialogTrigger asChild><Button size="icon" variant="destructive" className="rounded-full"><PhoneOff className="h-5 w-5" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={endInterview}>End Interview</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                        </div>
                    )}
                </div>
            </div>
            <Card className="w-full md:w-1/3 flex flex-col">
                <CardHeader><CardTitle className="text-center">Interview Transcript</CardTitle></CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {conversation.map((entry, index) => (<div key={index} className={`flex items-start gap-3 ${entry.role === 'user' ? 'justify-end' : ''}`}>{entry.role === 'ai' && <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>}<div className={`rounded-lg px-4 py-2 max-w-[80%] ${entry.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><p className="text-sm">{entry.text}</p></div>{entry.role === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><User /></AvatarFallback></Avatar>}</div>))}
                            {isTranscribing && <div className="flex justify-end"><div className="rounded-lg px-4 py-2 bg-primary/80 text-primary-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
                        </div>
                    </ScrollArea>
                    <div className="flex items-center gap-2 border-t pt-4">
                        <Input placeholder="Type your answer..." value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendTextAnswer()} disabled={!isInterviewStarted || isAiTyping || isRecording || isTranscribing} />
                        <Button size="icon" onClick={handleSendTextAnswer} disabled={!isInterviewStarted || isAiTyping || isRecording || isTranscribing || !textInput.trim()}><Send className="h-4 w-4" /></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}