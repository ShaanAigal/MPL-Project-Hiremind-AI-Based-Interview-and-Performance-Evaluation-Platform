"use client"

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function InterviewCompletedPage() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center p-4 h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-2xl text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full p-3 w-fit"><CheckCircle className="h-10 w-10 text-green-600" /></div>
                    <CardTitle className="mt-4 text-2xl">Interview Completed</CardTitle>
                    <CardDescription className="text-base">
                        Thank you for completing your interview. The hiring team will review your session. Please wait for the result.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/candidate/applications')} size="lg">
                        Return to My Applications
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}