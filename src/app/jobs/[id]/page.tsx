import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, DollarSign, Calendar, Briefcase, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { ShareJobButton } from '@/components/jobs/share-job-button';
import { JobStatus } from '@/components/jobs/types';

async function getJob(id: string) {
  try {
    await dbConnect();
    const job = await Job.findById(id).lean();
    if (!job) {
      notFound();
    }
    return JSON.parse(JSON.stringify(job));
  } catch (error) {
    console.error("Failed to get job:", error);
    notFound();
  }
}

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);

  // Determine status on the server
  const isExpired = dayjs().isAfter(dayjs(job.expiryDate));
  const status: JobStatus = isExpired ? "Expired" : "Active";

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground pt-2 flex items-center gap-2">
                <Building className="h-5 w-5" /> {job.company}
              </CardDescription>
            </div>
            <ShareJobButton job={job} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* <DollarSign className="h-4 w-4" /> */}
              <span className="font-semibold text-sm">Rs</span>
              <span>{job.salaryRange || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Apply by: {dayjs(job.expiryDate).format('MMMM D, YYYY')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{job.applications} applications</span>
            </div>
             <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-md font-semibold text-card-foreground">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold text-card-foreground">Job Description</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-2 whitespace-pre-wrap">
              {job.description}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}