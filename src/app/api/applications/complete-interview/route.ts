import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import InterviewReport from '@/models/InterviewReport';

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const { applicationId } = await request.json();

        if (!applicationId) {
            return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
        }

        const updateData: any = { status: 'Completed-Interview' };
        
        // Note: Interview score will be updated later when analysis completes
        // The analysis is triggered in the background from the session page

        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            { $set: updateData },
            { new: true }
        );

        if (!updatedApplication) {
            return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedApplication });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}