import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Notification from '@/models/Notification';
import Job from '@/models/Job';

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

        // Create a notification for the candidate
        let message = '';
        if (status === 'Selected') {
            message = `Congratulations! You have been selected for the role of ${(application.jobId as any).title} at ${(application.jobId as any).company}.`;
        } else if (status === 'Rejected') {
            message = `Thank you for your interest in the ${ (application.jobId as any).title} role. We have decided not to move forward with your application at this time.`;
        }

        if (message) {
            await Notification.create({
                candidateEmail: application.candidateEmail,
                message: message,
                applicationId: application._id,
            });
            console.log(`Notification created for ${application.candidateEmail}: ${message}`);
        }

        // Return updated application with populated jobId
        const updatedApplication = await Application.findById(applicationId).populate('jobId');

        return NextResponse.json({ success: true, data: updatedApplication, message: status === 'Selected' || status === 'Rejected' ? 'Status updated successfully and notification sent' : 'Status updated successfully' });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}