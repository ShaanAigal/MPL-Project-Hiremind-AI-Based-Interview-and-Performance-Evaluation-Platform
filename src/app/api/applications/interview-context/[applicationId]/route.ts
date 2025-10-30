import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function GET(request: NextRequest, { params }: { params: { applicationId: string } }) {
    await dbConnect();
    try {
        const application = await Application.findById(params.applicationId).populate('jobId');

        if (!application) {
            return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
        }

        const context = {
            candidateName: application.candidateName,
            jobRole: (application.jobId as any).title,
            jobDescription: (application.jobId as any).description,
            // In a real scenario, you might pass a resume summary here
            resumeText: "The candidate's resume is on file." 
        };

        return NextResponse.json({ success: true, data: context });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}