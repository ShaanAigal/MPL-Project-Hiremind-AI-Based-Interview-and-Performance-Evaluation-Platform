"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, ThumbsUp, ArrowUp, Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { StarRating } from '@/components/feedback/star-rating';
import { IInterviewReport } from '@/models/InterviewReport';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

interface Candidate {
    _id: string;
    candidateName: string;
    status: string;
    interviewScore: number;
    interviewDate: string | null;
    hasCompletedInterview?: boolean;
}

export default function CandidateInterviewAnalysisPage({ params }: { params: { applicationId: string; jobId: string } }) {
    const [report, setReport] = useState<(IInterviewReport & { candidateName?: string }) | null>(null);
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [jobDetails, setJobDetails] = useState<{ title: string; company: string } | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/interviews/report/${params.applicationId}`);
            if (!response.ok) throw new Error('Failed to fetch report');
            const result = await response.json();
            setReport(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidatesData = async () => {
        try {
            const response = await fetch(`/api/interviews/${params.jobId}`);
            const result = await response.json();
            if (result.success) {
                setJobDetails({ title: result.data.title, company: result.data.company });
                setCandidates(result.data.candidates);
                const currentCandidate = result.data.candidates.find((c: Candidate) => c._id === params.applicationId);
                setCandidate(currentCandidate || null);
            }
        } catch (error) {
            console.error("Failed to fetch candidates data:", error);
        }
    };

    useEffect(() => {
        if (params.applicationId && params.jobId) {
            fetchReport();
            fetchCandidatesData();
        }
    }, [params.applicationId, params.jobId]);

    const handleUpdateStatus = async (status: 'Selected' | 'Rejected') => {
        try {
            const response = await fetch('/api/applications/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: params.applicationId, status }),
            });
            
            if (response.ok) {
                setMessage({ type: 'success', text: `Candidate has been ${status.toLowerCase()}.` });
                // Refresh both report and candidates data to show updated status
                setTimeout(async () => {
                    await fetchReport();
                    await fetchCandidatesData();
                }, 500); 
            } else {
                setMessage({ type: 'error', text: `Failed to update status to ${status}.` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to update status to ${status}.` });
            console.error(`Failed to update status to ${status}:`, error);
        }
    };


    if (loading) {
        return <div className="flex justify-center items-center h-[calc(100vh-8rem)]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!report) {
        return <div className="text-center p-8">Interview analysis report not found.</div>;
    }

    const { feedback, jobRole, conversation, candidateName } = report;

    return (
        <div className="p-6 space-y-6">
            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Job Title and Description */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">{jobDetails?.title} - {jobDetails?.company}</h1>
                <p className="text-muted-foreground">Interview Analysis and Candidate Selection</p>
            </div>

            {/* Current Candidate Interview Analysis */}
            {report && (
                <>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">{report.jobRole} - Interview Feedback for {report.candidateName}</CardTitle>
                                <CardDescription>{report.feedback.overallImpression}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleUpdateStatus('Selected')} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Select Candidate
                                </Button>
                                <Button onClick={() => handleUpdateStatus('Rejected')} variant="destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Candidate
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center justify-center text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                        <p className="text-6xl font-bold text-primary">{report.feedback.overallScore}</p>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Technical Skills</h4>
                            <StarRating rating={report.feedback.ratings.technicalSkills} />
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Communication</h4>
                            <StarRating rating={report.feedback.ratings.communication} />
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Problem Solving</h4>
                            <StarRating rating={report.feedback.ratings.problemSolving} />
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Culture Fit</h4>
                            <StarRating rating={report.feedback.ratings.cultureFit} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ThumbsUp className="h-5 w-5 text-green-500" /> Strengths</CardTitle></CardHeader>
                    <CardContent><ul className="space-y-2 list-disc pl-5 text-muted-foreground">{report.feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ArrowUp className="h-5 w-5 text-orange-500" /> Areas for Improvement</CardTitle></CardHeader>
                    <CardContent><ul className="space-y-2 list-disc pl-5 text-muted-foreground">{report.feedback.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Full Interview Transcript</CardTitle></CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] p-4 bg-muted rounded-lg">
                        <div className="space-y-4">
                            {report.conversation.map((entry, index) => (
                                <div key={index} className={`flex items-start gap-3 ${entry.role === 'user' ? 'justify-end' : ''}`}>
                                    {entry.role === 'ai' && <Avatar className="w-8 h-8"><AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback></Avatar>}
                                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${entry.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}><p className="text-sm">{entry.text}</p></div>
                                    {entry.role === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
                </>
            )}

            {/* Candidates Table - Real-time Status Updates */}
            <Card>
                <CardHeader>
                    <CardTitle>Candidates in the interview stage</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left">
                                    <th className="p-2">Sr No</th>
                                    <th className="p-2">Candidate Name</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Interview Score</th>
                                    <th className="p-2">Interview Date</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map((candidate, index) => (
                                    <tr key={candidate._id} className={candidate._id === params.applicationId ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                                        <td className="p-2">{index + 1}</td>
                                        <td className="p-2 font-medium">{candidate.candidateName}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${candidate.status === 'Completed-Interview' ? 'bg-purple-100 text-purple-800' : candidate.status === 'Selected' ? 'bg-green-100 text-green-800' : candidate.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {candidate.status === 'Completed-Interview' ? 'Selected' : candidate.status}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            {candidate.hasCompletedInterview && candidate.interviewScore > 0 
                                                ? `${candidate.interviewScore}%` 
                                                : candidate.status === 'Completed-Interview' ? 'Processing...' : 'N/A'
                                            }
                                        </td>
                                        <td className="p-2">
                                            {candidate.interviewDate 
                                                ? dayjs(candidate.interviewDate).format('MMMM D, YYYY')
                                                : 'N/A'
                                            }
                                        </td>
                                        <td className="p-2">
                                            <Button
                                                variant={candidate._id === params.applicationId ? "secondary" : "outline"}
                                                size="sm"
                                                onClick={() => router.push(`/recruiter/candidates/${params.jobId}/${candidate._id}`)}
                                                disabled={!candidate.hasCompletedInterview}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                {candidate._id === params.applicationId ? 'Current View' : 'View Details'}
                                            </Button>
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