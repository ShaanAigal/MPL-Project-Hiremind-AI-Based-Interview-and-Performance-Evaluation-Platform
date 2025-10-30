import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const { jobId, shortlistCount } = await request.json();

        // Get all applications for the job, sorted by ATS score
        const applications = await Application.find({ jobId }).sort({ atsScore: -1 });

        // Update status for each application
        const updates = applications.map((app, index) => {
            const newStatus = index < shortlistCount ? 'Approved' : 'Rejected';
            return Application.updateOne({ _id: app._id }, { $set: { status: newStatus } });
        });
        
        await Promise.all(updates);

        return NextResponse.json({ success: true, message: 'Bulk update successful' });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}