import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

// This would typically use a session to get the user's email
const FAKE_USER_EMAIL = "john.doe@example.com"; // Replace with real user session logic

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const email = searchParams.get('email') || 'john.doe@example.com'; // replace with real session/email

        const skip = (page - 1) * limit;
        const total = await Notification.countDocuments({ candidateEmail: email });
        const notifications = await Notification.find({ candidateEmail: email }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
        return NextResponse.json({ success: true, data: notifications, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), total, limit } });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
        return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// START: New DELETE handler
export async function DELETE(request: NextRequest) {
    await dbConnect();
    try {
        // In a real app, you would filter by the user's email or ID from their session.
        // For now, we delete all notifications.
        await Notification.deleteMany({});
        return NextResponse.json({ success: true, message: 'All notifications cleared.' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}