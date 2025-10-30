"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Calendar,
    BarChart3,
    Briefcase,
    FileText,
    Eye,
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    Inbox,
    AlertTriangle
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Job } from '@/components/jobs/types';

dayjs.extend(relativeTime);

interface Application {
    _id: string;
    candidateName: string;
    jobId?: { _id: string; title: string; company: string } | null;
    createdAt: string;
    status: string;
    score?: number;
}

interface DashboardStats {
    activeJobs: number;
    totalApplications: number;
    successRate: number;
    pendingApplications: number;
}

const fetchRecruiterDashboardData = async () => {
    const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/applications')
    ]);

    if (!jobsRes.ok || !appsRes.ok) {
        const jobsError = !jobsRes.ok ? await jobsRes.text() : null;
        const appsError = !appsRes.ok ? await appsRes.text() : null;
        throw new Error(`Failed to fetch dashboard data. Jobs: ${jobsError}, Apps: ${appsError}`);
    }

    const jobsData = await jobsRes.json();
    const appsData = await appsRes.json();

    const fetchedJobs: Job[] = jobsData.success ? jobsData.data : [];
    const fetchedApplications: Application[] = appsData.success
        ? appsData.data.filter((app: any): app is Application =>
                app.jobId && typeof app.jobId === 'object' && app.jobId._id && app.jobId.title
            )
        : [];

    const activeJobsCount = fetchedJobs.filter(job => !dayjs().isAfter(dayjs(job.expiryDate))).length;
    const totalAppsCount = fetchedApplications.length;
    const selectedAppsCount = fetchedApplications.filter(app => app.status === 'Selected').length;
    const pendingAppsCount = fetchedApplications.filter(app => app.status === 'Pending').length;
    const successRateCalc = totalAppsCount > 0 ? Math.round((selectedAppsCount / totalAppsCount) * 100) : 0;

    const stats: DashboardStats = {
        activeJobs: activeJobsCount,
        totalApplications: totalAppsCount,
        successRate: successRateCalc,
        pendingApplications: pendingAppsCount,
    };

    const recentApplications = [...fetchedApplications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return { applications: fetchedApplications, jobs: fetchedJobs, stats, recentApplications };
};

export default function RecruiterDashboard() {
    const router = useRouter();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['recruiterDashboard'],
        queryFn: fetchRecruiterDashboardData,
        staleTime: 5 * 60 * 1000,
    });

    const applications = data?.applications ?? [];
    const jobs = data?.jobs ?? [];
    const stats = data?.stats ?? { activeJobs: 0, totalApplications: 0, successRate: 0, pendingApplications: 0 };
    const recentApplications = data?.recentApplications ?? [];

    const formatRelativeDate = (dateString: string) => dayjs(dateString).fromNow();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Selected':
                return <span className="flex items-center gap-1.5 px-1 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200"><CheckCircle className="h-3 w-3" />Selected</span>;
            case 'Interviewing':
                return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200"><Calendar className="h-3 w-3" />Interviewing</span>;
            case 'Completed-Interview':
                return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 border border-purple-200"><CheckCircle className="h-3 w-3" />Interviewed</span>;
            case 'Rejected':
                return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200"><XCircle className="h-3 w-3" />Rejected</span>;
            case 'Approved':
                return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200"><CheckCircle className="h-3 w-3" />Approved</span>;
            case 'Reviewed':
                return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"><Eye className="h-3 w-3" />Reviewed</span>;
            default:
                return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-200"><Clock className="h-3 w-3" />Pending</span>;
        }
    };

    const renderScore = (score?: number) => {
        if (score === undefined || score === null) return <span className="text-muted-foreground text-xs">N/A</span>;
        const colorClass = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-semibold ${colorClass}`}>{score}%</span>;
    };

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        // @ts-ignore - error message may be on the Error object
        return (
            <div className="p-6 flex flex-col justify-center items-center h-[calc(100vh-4rem)] text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Failed to Load Dashboard</h2>
                {/* @ts-ignore */}
                <p className="text-muted-foreground mb-4">{(error as any)?.message || 'An error occurred.'}</p>
                <Button onClick={() => refetch()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">Recruiter Dashboard</h1>
                <p className="text-muted-foreground">Overview of your hiring pipeline and recent activity.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeJobs}</div>
                        <p className="text-xs text-muted-foreground">Currently accepting applications</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">Received across all jobs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                        <p className="text-xs text-muted-foreground">Applications awaiting review</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Selection Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.successRate}%</div>
                        <p className="text-xs text-muted-foreground">% of applications marked 'Selected'</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle>Recent Applications</CardTitle>
                            <CardDescription>Latest 5 candidates who applied to your jobs.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push('/recruiter/applications')}>View All Applications</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {recentApplications.length === 0 ? (
                        <div className="text-center p-10 text-muted-foreground">
                            <Inbox className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            No recent applications found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Candidate</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Position</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Applied</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Score</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplications.map((app) => (
                                        <tr key={app._id} className="border-b last:border-b-0 hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="font-medium">{app.candidateName}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium">{app.jobId?.title ?? 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">{app.jobId?.company ?? 'N/A'}</div>
                                            </td>
                                            <td className="p-3 text-muted-foreground">{formatRelativeDate(app.createdAt)}</td>
                                            <td className="p-3">{getStatusBadge(app.status)}</td>
                                            <td className="p-3">{renderScore(app.score)}</td>
                                            <td className="p-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title="View Application Details"
                                                    onClick={() => app.jobId?._id && router.push(`/recruiter/applications/${app.jobId._id}/${app._id}`)}
                                                    disabled={!app.jobId?._id}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}