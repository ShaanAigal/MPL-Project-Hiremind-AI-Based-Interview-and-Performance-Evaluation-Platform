import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import { sendApplicationStatusEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const { jobId } = await request.json();

        if (!jobId) {
            return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
        }

        const applicationsToUpdate = await Application.find({ jobId: jobId, status: 'Approved' }).populate('jobId', 'title');

        if (applicationsToUpdate.length > 0) {
            const applicationIds = applicationsToUpdate.map(app => app._id);
            
            // Bulk update applications
            await Application.updateMany(
                { _id: { $in: applicationIds } },
                { $set: { status: 'Interviewing' } }
            );

            // Send email notifications for each updated application
            for (const app of applicationsToUpdate) {
                await sendApplicationStatusEmail({
                    to: app.candidateEmail,
                    jobTitle: (app.jobId as any).title,
                    companyName: (app.jobId as any).company,
                    candidateName: app.candidateName,
                    status: 'approved'
                });
            }
        }

        return NextResponse.json({ success: true, message: 'All approved candidates moved to interviewing stage.' });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}