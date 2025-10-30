import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InterviewReport from '@/models/InterviewReport';
import Application from '@/models/Application';
import { IInterviewReport } from '@/models/InterviewReport';

type Params = {
  params: {
    applicationId: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
    await dbConnect();
    try {
        const report = await InterviewReport.findOne({ applicationId: params.applicationId }).lean() as IInterviewReport | null;
        if (!report) {
            return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
        }

        const application = await Application.findById(params.applicationId).lean();
        const appData = Array.isArray(application) ? application[0] : application;

        return NextResponse.json({ success: true, data: { ...report, candidateName: appData?.candidateName } });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}