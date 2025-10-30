"use client"

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

export default function MockInterviewIntroPage() {
  const router = useRouter();

  const handleStartSetup = () => {
    router.push('/candidate/mock-interview/setup');
  };

  return (
    <div className="flex items-center justify-center p-4 h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
            <Video className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4 text-3xl">Mock Interview</CardTitle>
          <CardDescription className="text-base text-muted-foreground px-6">
            Give a mock interview according to your timing you require to analyze and evaluate yourself to be job-ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleStartSetup} size="lg" className="w-full max-w-xs">
            Give The Mock Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}