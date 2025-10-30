"use client"

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export default function InterviewCompletedPage() {
  const router = useRouter();
  const [jobRole, setJobRole] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);
  const analysisTriggered = useRef(false);

  // On page load, get data from sessionStorage and trigger analysis
  useEffect(() => {
    const role = sessionStorage.getItem('lastInterviewJobRole');
    const convoString = sessionStorage.getItem('lastInterviewConversation');

    if (role) setJobRole(role);

    // Ensure analysis runs only once
    if (convoString && !analysisTriggered.current) {
      analysisTriggered.current = true; 
      const conversation = JSON.parse(convoString);
      
      const analyze = async () => {
        try {
          const response = await fetch('/api/interview/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobRole: role,
              conversation,
            }),
          });

          if (!response.ok) throw new Error('Analysis request failed');
          
          const result = await response.json();
          if (result.success && result.reportId) {
            setReportId(result.reportId);
          } else {
            throw new Error(result.error || 'Failed to get report ID');
          }
        } catch (error) {
          console.error("Error during interview analysis:", error);
          alert("There was an error analyzing your interview. Please try again later.");
        } finally {
          setIsProcessing(false); // Analysis complete, regardless of outcome
          // Clean up session storage
          sessionStorage.removeItem('lastInterviewJobRole');
          sessionStorage.removeItem('lastInterviewConversation');
        }
      };
      
      analyze();
    } else if (!convoString) {
        // If there's no conversation, no need to process
        setIsProcessing(false);
    }
  }, []);

  const handleContinue = () => {
    if (isProcessing) {
      alert("Please wait, analysis is still in process.");
      return;
    }
    
    if (reportId) {
      router.push(`/candidate/mock-interview/feedback/${reportId}`);
    } else {
      // If there's no report ID, go to the main applications page
      router.push('/candidate/applications');
    }
  };

  return (
    <div className="flex items-center justify-center p-4 h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl">Interview Completed</CardTitle>
          <CardDescription className="text-base">
            Thank you for completing your mock interview for the <span className="font-semibold text-primary">{jobRole}</span> position.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-left bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
              <li>Our AI is processing your interview to generate detailed, personalized feedback.</li>
              <li>You can view your scores, ratings, and a full transcript once the analysis is complete.</li>
            </ul>
          </div>
          <Button onClick={handleContinue} size="lg" disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? "Analyzing..." : "Continue to Feedback"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}