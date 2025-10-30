"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Calendar, CheckCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import { Job } from '@/components/jobs/types';

const fetchJobs = async () => {
  const res = await fetch('/api/jobs');
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
};

export default function JobApplicationsOverview() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({ queryKey: ['recruiterJobs'], queryFn: fetchJobs, staleTime: 5 * 60 * 1000 });
  const jobs: Job[] = data?.data ?? [];

  const getStatus = (expiryDate: string) => {
    return dayjs().isAfter(dayjs(expiryDate)) ? "Expired" : "Active";
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto text-destructive mb-2" />
        <p className="text-muted-foreground">Failed to load jobs.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Job Applications</h1>
        <p className="text-muted-foreground">Review and manage candidate applications by job posting.</p>
      </div>

      <div className="space-y-6">
        {jobs.map((job) => (
          <Card key={job._id}>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>{job.company}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{job.applications} Applicants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Expires: {dayjs(job.expiryDate).format('MMMM D, YYYY')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatus(job.expiryDate) === 'Active' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-red-500" />
                    )}
                    <span>{getStatus(job.expiryDate)}</span>
                  </div>
                </div>
                <Button onClick={() => router.push(`/recruiter/applications/${job._id}`)}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}