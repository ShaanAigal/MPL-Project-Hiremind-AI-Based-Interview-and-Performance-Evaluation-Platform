import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
    await dbConnect();
    try {
        const applications = await Application.find({ jobId: params.jobId });
        return NextResponse.json({ success: true, data: applications });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}