import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InterviewReport from '@/models/InterviewReport';

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');

    const query: any = { applicationId: { $exists: false } };
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;
    const total = await InterviewReport.countDocuments(query);
    const reports = await InterviewReport.find(query).sort({ interviewDate: -1 }).skip(skip).limit(limit).lean();

    return NextResponse.json({ success: true, data: reports, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), total, limit } });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}