import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const { jobId } = await request.json();

        if (!jobId) {
            return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
        }

        // Update all applications for this job with status 'Pending' to 'Approved'
        await Application.updateMany(
            { jobId: jobId, status: 'Pending' },
            { $set: { status: 'Approved' } }
        );

        return NextResponse.json({ success: true, message: 'All candidates have been shortlisted.' });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}