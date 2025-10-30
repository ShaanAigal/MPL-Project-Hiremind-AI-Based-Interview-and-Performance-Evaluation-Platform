"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, ThumbsUp, ArrowUp, Loader2 } from 'lucide-react';
import { StarRating } from '@/components/feedback/star-rating';
import { IInterviewReport } from '@/models/InterviewReport';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function FeedbackPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<IInterviewReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/interview/reports/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch report');
        const result = await response.json();
        setReport(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-8rem)]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!report) {
    return <div className="text-center p-8">Feedback report not found.</div>;
  }

  const { feedback, jobRole, conversation } = report;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{jobRole} - Interview Feedback</CardTitle>
          <CardDescription>{feedback.overallImpression}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <p className="text-6xl font-bold text-primary">{feedback.overallScore}</p>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Technical Skills</h4>
              <StarRating rating={feedback.ratings.technicalSkills} />
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Communication</h4>
              <StarRating rating={feedback.ratings.communication} />
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Problem Solving</h4>
              <StarRating rating={feedback.ratings.problemSolving} />
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Culture Fit</h4>
              <StarRating rating={feedback.ratings.cultureFit} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ThumbsUp className="h-5 w-5 text-green-500" /> Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
              {feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowUp className="h-5 w-5 text-orange-500" /> Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
              {feedback.improvements.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Full Interview Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] p-4 bg-muted rounded-lg">
            <div className="space-y-4">
              {conversation.map((entry, index) => (
                <div key={index} className={`flex items-start gap-3 ${entry.role === 'user' ? 'justify-end' : ''}`}>
                  {entry.role === 'ai' && <Avatar className="w-8 h-8"><AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback></Avatar>}
                  <div className={`rounded-lg px-4 py-2 max-w-[80%] ${entry.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    <p className="text-sm">{entry.text}</p>
                  </div>
                  {entry.role === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button onClick={() => router.push('/candidate')} size="lg">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}