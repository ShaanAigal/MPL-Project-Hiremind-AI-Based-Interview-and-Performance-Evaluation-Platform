"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Calendar, CheckCircle, Clock, Users, Loader2, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';

interface JobWithCandidates {
    _id: string;
    title: string;
    company: string;
    applications: number;
    expiryDate: string;
    candidates: any[];
}

const getStatus = (expiryDate: string) => {
    return dayjs().isAfter(dayjs(expiryDate)) ? 'Expired' : 'Active';
};

const fetchInterviewDetails = async () => {
    const res = await fetch('/api/interviews');
    if (!res.ok) throw new Error('Failed to fetch interviews');
    return res.json();
};

export default function Candidates() {
    const router = useRouter();
    const { data, isLoading, error } = useQuery({ queryKey: ['interviews'], queryFn: fetchInterviewDetails, staleTime: 5 * 60 * 1000 });
    const interviewDetails: JobWithCandidates[] = data?.data ?? [];

    if (isLoading) return (<div className="p-6 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>);
    if (error) return (<div className="p-6 text-center"><AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" /> <p className="text-muted-foreground">Failed to load interview details.</p></div>);

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Interview Round Details</h1>
                <p className="text-muted-foreground">Track and manage candidates who have been approved for interviews.</p>
            </div>

            <div className="space-y-6">
                {interviewDetails.map((job) => (
                    <Card key={job._id}>
                        <CardHeader>
                            <CardTitle>{job.title} | {job.company}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{job.candidates.length} Candidates</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>Expires: {dayjs(job.expiryDate).format('MMMM D, YYYY')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatus(job.expiryDate) === 'Active' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-red-500" />}
                                        <span>{getStatus(job.expiryDate)}</span>
                                    </div>
                                </div>
                                <Button onClick={() => router.push(`/recruiter/candidates/${job._id}`)}>View Details</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}