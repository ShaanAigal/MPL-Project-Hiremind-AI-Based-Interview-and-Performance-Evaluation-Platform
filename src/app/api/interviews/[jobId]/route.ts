import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import InterviewReport, { IInterviewReport } from '@/models/InterviewReport';
import { Job as IJob } from '@/components/jobs/types';
import { Document } from 'mongoose';

interface IApplication {
    _id: string;
    jobId: string;
    candidateEmail: string;
    candidateName: string;
    status: string;
    interviewScore?: number;
    interviewDate?: Date;
    createdAt?: Date;
}

type Params = {
  params: {
    jobId: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const email = searchParams.get('email');

        const job = await Job.findById(params.jobId).lean() as IJob | null;
        if (!job) {
            return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        }

        const query: any = {
            jobId: params.jobId,
            status: { $in: ['Interviewing', 'Completed-Interview', 'Selected', 'Rejected'] }
        };
        if (email) query.candidateEmail = email;

        const skip = (page - 1) * limit;
        const applications = await Application.find(query).lean().skip(skip).limit(limit);

        const populatedApplications = await Promise.all(applications.map(async (app: any) => {
            const report = await InterviewReport.findOne({ applicationId: app._id }).lean() as IInterviewReport | null;
            return {
                ...app,
                interviewScore: report && report.status === 'completed' ? report.feedback.overallScore : app.interviewScore || 0,
                interviewDate: app.interviewStartDate || null,
                hasCompletedInterview: !!(report && report.status === 'completed'),
            };
        }));

        populatedApplications.sort((a, b) => b.interviewScore - a.interviewScore);

        const jobWithInterviewCandidates = {
            ...job,
            candidates: populatedApplications,
        };

        return NextResponse.json({ success: true, data: jobWithInterviewCandidates });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}