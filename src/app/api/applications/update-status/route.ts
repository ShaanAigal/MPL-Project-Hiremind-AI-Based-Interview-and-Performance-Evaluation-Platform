import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import { sendApplicationStatusEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const { applicationId, status } = await request.json();

        if (!applicationId || !status) {
            return NextResponse.json({ success: false, error: 'Application ID and status are required' }, { status: 400 });
        }

        const application = await Application.findById(applicationId).populate('jobId');

        if (!application) {
            return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
        }

        // Update application status
        application.status = status;
        await application.save();

        // Send email notification based on status
        if (['Approved', 'Selected', 'Rejected'].includes(status)) {
            const emailStatus = status === 'Selected' ? 'selected' : 
                              status === 'Rejected' ? 'rejected' : 'approved';
            
            const job = application.jobId as any;
            if (!job?.title || !job?.company) {
                console.error('Missing job details:', { job, applicationId });
                throw new Error('Missing required job details for email notification');
            }

            const emailResult = await sendApplicationStatusEmail({
                to: application.candidateEmail,
                jobTitle: job.title,
                companyName: job.company,
                candidateName: application.candidateName,
                status: emailStatus as 'approved' | 'selected' | 'rejected'
            });

            if (!emailResult.success) {
                console.error('Failed to send email notification:', emailResult.error);
                throw new Error('Failed to send email notification');
            }
        }

        // Return updated application with populated jobId
        const updatedApplication = await Application.findById(applicationId).populate('jobId');

        const message = ['Approved', 'Selected', 'Rejected'].includes(status)
            ? 'Status updated successfully and email notification sent'
            : 'Status updated successfully';

        return NextResponse.json({ 
            success: true, 
            data: updatedApplication, 
            message 
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}