"use client"

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { size } from 'zod';

interface Application {
    _id: string;
    candidateName: string;
    atsScore: number;
    score: number; // Add overall score
    createdAt: string;
    status: string;
}

interface Job {
    _id: string;
    title: string;
    company: string;
}

// Helper function for status colors
const getStatusClass = (status: string) => {
    switch (status) {
        case 'Approved':
            return 'bg-blue-100 text-blue-800';
        case 'Interviewing':
            return 'bg-green-100 text-green-800';
        case 'Rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function ApplicantDetailsPage({ params }: { params: { jobId: string } }) {
    const [applications, setApplications] = useState<Application[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [shortlistCount, setShortlistCount] = useState<number>(0);
    const [isShortlistDialogOpen, setIsShortlistDialogOpen] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        const [jobRes, appsRes] = await Promise.all([
            fetch(`/api/jobs/${params.jobId}`),
            fetch(`/api/applications/job/${params.jobId}`)
        ]);
        const jobData = await jobRes.json();
        const appsData = await appsRes.json();
        if (jobData.success) setJob(jobData.data);
        if (appsData.success) {
            const sortedApps = appsData.data.sort((a: Application, b: Application) => (b.score ?? b.atsScore) - (a.score ?? a.atsScore));
            setApplications(sortedApps);
        }
    };

    useEffect(() => {
        fetchData();
    }, [params.jobId]);

    const hasApprovedCandidates = useMemo(() => {
        return applications.some(app => app.status === 'Approved');
    }, [applications]);
    
    const handleShortlist = async () => {
        await fetch('/api/applications/bulk-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: params.jobId, shortlistCount }),
        });
        fetchData(); // Refresh data
        setIsShortlistDialogOpen(false);
    };
    
    const handleShortlistAll = async () => {
        await fetch('/api/applications/shortlist-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: params.jobId }),
        });
        fetchData(); // Refresh data
    };

    const handleApproveAll = async () => {
        await fetch('/api/applications/approve-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: params.jobId }),
        });
        fetchData(); // Refresh data
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{job?.title} - Applicants</h1>
                <p className="text-muted-foreground">Manage and shortlist candidates for {job?.company}.</p>
            </div>
            
            <div className="flex justify-end gap-4 mb-4">
                 <Dialog open={isShortlistDialogOpen} onOpenChange={setIsShortlistDialogOpen}>
                    <DialogTrigger asChild><Button>Shortlist Candidates</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Shortlist Top Candidates</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <Label htmlFor="shortlist-count">Number of candidates to shortlist</Label>
                            <Input id="shortlist-count" type="number" value={shortlistCount} onChange={(e) => setShortlistCount(Math.max(0, parseInt(e.target.value, 10)))}/>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button>Apply Shortlist</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will approve the top {shortlistCount} candidate(s) and reject all others for this job.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleShortlist}>Yes, Proceed</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={handleShortlistAll}>Shortlist All</Button>
                {hasApprovedCandidates && (
                    <Button variant="secondary" onClick={handleApproveAll} className="bg-green-600 hover:bg-green-700 text-white">Approve for Interview</Button>
                )}
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-4 text-left font-medium">Sr No</th>
                                    <th className="p-4 text-left font-medium">Candidate</th>
                                    <th className="p-4 text-left font-medium">ATS Score</th>
                                    <th className="p-4 text-left font-medium">Applied Date</th>
                                    <th className="p-4 text-left font-medium">Status</th>
                                    <th className="p-4 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app, index) => (
                                    <tr key={app._id} className="border-b">
                                        <td className="p-4">{index + 1}</td>
                                        <td className="p-4 font-medium">{app.candidateName}</td>
                                        <td className="p-4 font-semibold text-primary">{app.score ?? app.atsScore}%</td>
                                        <td className="p-4">{new Date(app.createdAt).toLocaleDateString('en-GB')}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Button variant="outline" size="sm" onClick={() => router.push(`/recruiter/applications/${params.jobId}/${app._id}`)}>View Details</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}