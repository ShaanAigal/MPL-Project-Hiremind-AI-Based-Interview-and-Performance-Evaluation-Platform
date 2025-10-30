import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InterviewReport from '@/models/InterviewReport';

type Params = {
  params: {
    id: string;
  };
};

// GET function (already exists)
export async function GET(request: NextRequest, { params }: Params) {
  await dbConnect();
  try {
    const report = await InterviewReport.findById(params.id);
    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// NEW: DELETE function 
export async function DELETE(request: NextRequest, { params }: Params) {
  await dbConnect();
  try {
    const deletedReport = await InterviewReport.deleteOne({ _id: params.id });
    if (deletedReport.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}