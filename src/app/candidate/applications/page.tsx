"use client"

import { useEffect, useState, useMemo } from 'react'; // Added useMemo
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Briefcase, Star, Calendar, Loader2, Trash2, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'; // Added more icons
import { IInterviewReport } from '@/models/InterviewReport';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge"; 

// Define interfaces
interface JobInfo {
  _id: string;
  title: string;
  company: string;
}
interface Application {
  _id: string;
  jobId: JobInfo;
  status: string;
  createdAt: string;
}

// Define the order and labels for status tabs
import { useUser } from '@clerk/nextjs';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Reviewed', label: 'Reviewed' }, // Added Reviewed
  { value: 'Interviewing', label: 'Interviewing' },
  { value: 'Completed-Interview', label: 'Interviewed' },
  { value: 'Selected', label: 'Selected' },
  { value: 'Rejected', label: 'Rejected' },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [reports, setReports] = useState<IInterviewReport[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all'); // State for nested tabs

  const getStatusUI = (status: string) => {
    switch (status) {
      case 'Selected':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="mr-1 h-3 w-3" />Selected</Badge>;
      case 'Interviewing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Calendar className="mr-1 h-3 w-3" />Interviewing</Badge>;
      case 'Completed-Interview':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100"><CheckCircle className="mr-1 h-3 w-3" />Interviewed</Badge>;
      case 'Rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      case 'Approved': // You might want this status too
         return <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'Reviewed':
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Eye className="mr-1 h-3 w-3" />Reviewed</Badge>;
      default: // Pending
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    }
  };

  const fetchAllData = async () => {
    const [appsRes, reportsRes] = await Promise.all([
      fetch(`/api/applications?email=${user?.emailAddresses[0]?.emailAddress || ''}`),
      fetch('/api/interview/reports')
    ]);
    if (!appsRes.ok || !reportsRes.ok) {
      const aText = !appsRes.ok ? await appsRes.text() : null;
      const rText = !reportsRes.ok ? await reportsRes.text() : null;
      throw new Error(`Failed to fetch data. Apps: ${aText}, Reports: ${rText}`);
    }
    const appsResult = await appsRes.json();
    const reportsResult = await reportsRes.json();
    const validApplications = appsResult.success ? appsResult.data.filter((app: Application)=> app.jobId).sort((a: Application, b: Application) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
    const reportsArr = reportsResult.success ? reportsResult.data : [];
    return { applications: validApplications, reports: reportsArr };
  };

  const { data, isLoading: queryLoading, error } = useQuery({ queryKey: ['myApplicationsPage'], queryFn: fetchAllData, staleTime: 3 * 60 * 1000 } as any);

  // update local states when query resolves
  useEffect(() => {
    if (data) {
      setApplications((data as any).applications);
      setReports((data as any).reports);
    }
    setLoading(queryLoading);
  }, [data, queryLoading]);

  const handleDelete = async (reportId: string) => {
    try {
        await fetch(`/api/interview/reports/${reportId}`, { method: 'DELETE' });
        // Refetch reports after deletion
        const res = await fetch('/api/interview/reports');
        const result = await res.json();
        if (result.success) setReports(result.data);
    } catch (error) {
        console.error("Failed to delete report:", error);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Filter applications based on the active status tab
  const filteredApplications = useMemo(() => {
    if (activeStatusTab === 'all') {
      return applications;
    }
    return applications.filter(app => app.status === activeStatusTab);
  }, [applications, activeStatusTab]);

  // Component to render the application table (avoids repetition)
  const ApplicationTable = ({ apps }: { apps: Application[] }) => (
    <div className="overflow-x-auto">
      {apps.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          No applications found with status "{STATUS_TABS.find(t => t.value === activeStatusTab)?.label || activeStatusTab}".
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="p-3 font-medium">Job Title</th>
              <th className="p-3 font-medium">Company</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Applied Date</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app._id} className="border-t hover:bg-muted/50">
                <td className="p-3 font-medium">{app.jobId.title}</td>
                <td className="p-3">{app.jobId.company}</td>
                <td className="p-3">{getStatusUI(app.status)}</td>
                <td className="p-3 text-muted-foreground">{formatDate(app.createdAt)}</td>
                <td className="p-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/jobs/${app.jobId._id}`)}>
                       <Eye className="h-3 w-3 mr-1" /> View Job
                    </Button>
                    {app.status === 'Interviewing' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/candidate/interview/${app._id}/setup`)}
                      >
                         <Calendar className="h-3 w-3 mr-1" /> Start Interview
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>

      {/* Outer Tabs: Real Jobs vs Mock Interviews */}
      <Tabs defaultValue="real-jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mb-4">
          <TabsTrigger value="real-jobs">Real Job Applications</TabsTrigger>
          <TabsTrigger value="mock-interviews">Mock Interview Evaluations</TabsTrigger>
        </TabsList>

        {/* Real Jobs Content Area */}
        <TabsContent value="real-jobs">
          <Card>
            <CardHeader className="border-b">
              {/* Nested Tabs: Status Filter */}
              <Tabs
                value={activeStatusTab}
                onValueChange={setActiveStatusTab}
                className="w-full"
              >
                <TabsList className="h-auto flex flex-wrap justify-start bg-transparent p-0">
                  {STATUS_TABS.map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="text-xs sm:text-sm px-3 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md mr-1 mb-1"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0"> {/* Remove padding for table */}
              {loading ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <ApplicationTable apps={filteredApplications} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mock Interviews Content Area */}
        <TabsContent value="mock-interviews">
          <Card>
            <CardHeader><CardTitle>Mock Interview Evaluations</CardTitle></CardHeader>
            <CardContent>
              {loading && reports.length === 0 ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : reports.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">You haven't completed any mock interviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={String(report._id)} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="font-semibold text-lg text-primary">{report.jobRole}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>Overall Score: {report.feedback.overallScore}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>Date: {formatDate(report.interviewDate.toString())}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => router.push(`/candidate/mock-interview/feedback/${report._id}`)} size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Analysis
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"> {/* Use icon-sm */}
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your interview report.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(String(report._id))} className="bg-destructive hover:bg-destructive/90">
                                Yes, Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}