"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Send, 
  Calendar, 
  TrendingUp, 
  Video, 
  Loader2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react'

// Define interfaces for our data
interface Job {
  _id: string;
  title: string;
  company: string;
}

interface Application {
  _id: string;
  jobId: Job;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  submitted: number;
  scheduled: number;
  successRate: number;
  mockInterviews: number;
}

export default function CandidateDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({ submitted: 0, scheduled: 0, successRate: 0, mockInterviews: 0 });

  const fetchDashboardData = async () => {
    const [appsRes, reportsRes] = await Promise.all([
      fetch('/api/applications'),
      fetch('/api/interview/reports')
    ]);
    if (!appsRes.ok || !reportsRes.ok) {
      const appsText = !appsRes.ok ? await appsRes.text() : null;
      const repText = !reportsRes.ok ? await reportsRes.text() : null;
      throw new Error(`Failed to fetch dashboard data. Apps: ${appsText}, Reports: ${repText}`);
    }
    const appsResult = await appsRes.json();
    const reportsResult = await reportsRes.json();
    const applications: Application[] = appsResult.success ? appsResult.data.filter((app: any) => app.jobId) : [];
    const mockReportsCount = reportsResult.success ? reportsResult.data.length : 0;

    const totalSubmitted = applications.length;
    const interviewsScheduled = applications.filter(app => ['Interviewing', 'Completed-Interview', 'Selected'].includes(app.status)).length;
    const applicationsSelected = applications.filter(app => app.status === 'Selected').length;
    const successRate = totalSubmitted > 0 ? (applicationsSelected / totalSubmitted) * 100 : 0;

    return {
      stats: {
        submitted: totalSubmitted,
        scheduled: interviewsScheduled,
        successRate: Math.round(successRate),
        mockInterviews: mockReportsCount
      },
      recentApplications: applications.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,3),
      upcomingInterviews: applications.filter(a=> a.status === 'Interviewing')
    };
  };

  const { data, isLoading, error } = useQuery({ queryKey: ['candidateDashboard'], queryFn: fetchDashboardData, staleTime: 3 * 60 * 1000 });
  const recentApplications = data?.recentApplications ?? [];
  const upcomingInterviews = data?.upcomingInterviews ?? [];
  const statsFromQuery = data?.stats ?? stats;

  const getStatusUI = (status: string) => {
    switch (status) {
      case 'Selected':
        return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" />Selected</span>;
      case 'Interviewing':
        return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"><Calendar className="h-3 w-3" />Interview</span>;
      case 'Completed-Interview':
        return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800"><CheckCircle className="h-3 w-3" />Interviewed</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800"><XCircle className="h-3 w-3" />Rejected</span>;
      case 'Approved':
         return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3" />Approved</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"><Clock className="h-3 w-3" />Pending</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    // @ts-ignore
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground ml-4">{(error as any)?.message || 'Failed to load dashboard.'}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.firstName || 'Candidate'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your job search today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">Total real job applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Includes all active interview stages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application Success</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Based on applications "Selected"</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mock Interviews</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mockInterviews}</div>
            <p className="text-xs text-muted-foreground">Total practice sessions completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your 3 most recent job applications.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No Applications Found</p>
                  <p className="text-sm mb-4">You haven't applied to any jobs yet.</p>
                  <Button onClick={() => router.push('/candidate/jobs')}>Find Jobs</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30">
                      <div>
                        <h4 className="font-medium">{app.jobId.title}</h4>
                        <p className="text-sm text-muted-foreground">{app.jobId.company}</p>
                        <p className="text-xs text-muted-foreground mt-1">Applied: {formatDate(app.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusUI(app.status)}
                        <Button variant="outline" size="sm" onClick={() => router.push(`/jobs/${app.jobId._id}`)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Interviews */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Your scheduled interviews.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No upcoming interviews</p>
                  <p className="text-sm">When you're approved, interviews will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviews.map((app) => (
                    <div key={app._id} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-medium">{app.jobId.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{app.jobId.company}</p>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={() => router.push(`/candidate/interview/${app._id}/setup`)}
                      >
                        Start Interview
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}