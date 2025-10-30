"use client"

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle2, XCircle, Video } from 'lucide-react';

export default function InterviewInstructionsPage({ params }: { params: { applicationId: string } }) {
    const router = useRouter();

    const handleStartInterview = () => {
        // In a real app, you'd pass job details to the session page
        router.push(`/candidate/interview/${params.applicationId}/session`);
    };

    return (
        <div className="p-6 h-[calc(100vh-8rem)] flex items-center justify-center">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Interview Instructions</CardTitle>
                    <CardDescription>Please read these guidelines before starting your interview.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between">
                         <div className="space-y-3">
                            <h4 className="font-semibold text-green-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Do's</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                                <li>Find a quiet, well-lit environment.</li>
                                <li>Speak clearly and maintain eye contact.</li>
                                <li>Treat this as a real professional interview.</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-semibold text-red-600 flex items-center gap-2"><XCircle className="h-4 w-4" />Don'ts</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                                <li>Don't have distractions in your background.</li>
                                <li>Don't read answers from a script.</li>
                                <li>Don't use your phone during the session.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                        <h4 className="font-semibold mb-2">Interview Details</h4>
                        <p><strong>Duration:</strong> 15 minutes</p>
                        <p><strong>Format:</strong> Video interview with an AI interviewer</p>
                        <p><strong>Questions:</strong> A mix of technical and behavioral questions</p>
                    </div>
                    <Button onClick={handleStartInterview} className="w-full bg-green-600 hover:bg-green-700">
                        <Video className="h-4 w-4 mr-2" /> Start Interview
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}