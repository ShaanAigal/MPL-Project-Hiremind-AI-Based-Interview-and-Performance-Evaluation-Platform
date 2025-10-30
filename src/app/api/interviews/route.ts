import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import InterviewReport, { IInterviewReport } from '@/models/InterviewReport';
import { Job as IJob } from '@/components/jobs/types';
import { Document } from 'mongoose';

interface IApplication {
    _id: string;
    jobId: IJob;
    candidateEmail: string;
    candidateName: string;
    status: string;
    interviewScore?: number;
    interviewDate?: Date;
    createdAt?: Date;
}

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const role = searchParams.get('role'); // 'candidate' or 'recruiter'
        const email = searchParams.get('email');

        let baseQuery: any = { status: { $in: ['Interviewing', 'Completed-Interview', 'Selected', 'Rejected'] } };
        // Demo filtering by role/email
        if (role === 'candidate' && email) {
            baseQuery.candidateEmail = email;
        }

        const skip = (page - 1) * limit;

        const applications = await Application.find(baseQuery)
            .populate({ path: 'jobId', model: Job })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const populatedApplications = await Promise.all(applications.map(async (app: any) => {
            const report = await InterviewReport.findOne({ applicationId: app._id }).lean() as IInterviewReport | null;
            return {
                ...app,
                interviewScore: report && report.status === 'completed' ? report.feedback.overallScore : (app.interviewScore || 0),
                interviewDate: app.interviewStartDate || null,
                hasCompletedInterview: !!(report && report.status === 'completed'),
            };
        }));

        const jobsWithInterviewCandidates = populatedApplications.reduce((acc, app: any) => {
            const job = app.jobId;
            if (!job) return acc;

            const jobId = job._id.toString();
            if (!acc[jobId]) {
                acc[jobId] = {
                    ...job,
                    candidates: [],
                };
            }
            acc[jobId].candidates.push(app);
            return acc;
        }, {} as Record<string, any>);

        for (const jobId in jobsWithInterviewCandidates) {
            jobsWithInterviewCandidates[jobId].candidates.sort((a: any, b: any) => b.interviewScore - a.interviewScore);
        }

        return NextResponse.json({ success: true, data: Object.values(jobsWithInterviewCandidates) });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}