import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';

type Params = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
    await dbConnect();
    try {
        const application = await Application.findById(params.id);
        if (!application) {
            return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: application });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
  await dbConnect();
  try {
    const body = await request.json();
    const { status } = body;

    const application = await Application.findByIdAndUpdate(params.id, { status }, {
      new: true,
      runValidators: true,
    });
    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}