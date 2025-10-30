// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import Notification from '@/models/Notification';
// import { EventEmitter } from 'events';

// // --- Simple In-Memory Event Emitter for Broadcasting ---
// // NOTE: This basic emitter won't work across multiple server instances (e.g., Vercel serverless functions).
// // For production scalability, replace this with Redis Pub/Sub or similar.
// export const notificationEmitter = new EventEmitter();
// notificationEmitter.setMaxListeners(0); // Allow unlimited listeners

// // --- GET Handler for SSE Stream ---
// export async function GET(request: NextRequest) {
//     // --- Authentication Check ---
//     // IMPORTANT: Add authentication here to get the user's email or ID.
//     // For now, using a placeholder. Replace with your actual auth logic (e.g., Clerk).
//     const FAKE_USER_EMAIL = "john.doe@example.com";
//     if (!FAKE_USER_EMAIL) {
//         return new NextResponse('Unauthorized', { status: 401 });
//     }
//     const userEmail = FAKE_USER_EMAIL;
//     // --- End Authentication ---

//     const stream = new ReadableStream({
//         start(controller) {
//             console.log(`SSE: Client connected for user ${userEmail}`);

//             const sendNotification = (notification: any) => {
//                 // Only send if the notification matches the connected user
//                 if (notification.candidateEmail === userEmail) {
//                     const message = `data: ${JSON.stringify(notification)}\n\n`;
//                     try {
//                          controller.enqueue(new TextEncoder().encode(message));
//                          console.log(`SSE: Sent notification ${notification._id} to user ${userEmail}`);
//                     } catch (e) {
//                          console.error(`SSE: Error enqueuing data for user ${userEmail}:`, e);
//                          // Handle potential stream closure errors
//                     }
//                 }
//             };

//             // Register listener for new notifications
//             notificationEmitter.on('newNotification', sendNotification);

//             // Send a connection confirmation message (optional)
//             controller.enqueue(new TextEncoder().encode(`event: open\ndata: Connection established\n\n`));

//             // Cleanup on client disconnect
//             request.signal.addEventListener('abort', () => {
//                 console.log(`SSE: Client disconnected for user ${userEmail}`);
//                 notificationEmitter.off('newNotification', sendNotification);
//                 try {
//                     controller.close();
//                 } catch (e) {
//                      console.error(`SSE: Error closing stream for user ${userEmail}:`, e);
//                 }
//             });
//         },
//         cancel() {
//              console.log(`SSE: Stream cancelled for user (likely disconnected)`);
//              // Ensure listener is removed if cancel is called directly
//              notificationEmitter.off('newNotification', (notification: any) => { /* find and remove specific listener if needed */ });
//         }
//     });

//     return new NextResponse(stream, {
//         headers: {
//             'Content-Type': 'text/event-stream',
//             'Cache-Control': 'no-cache',
//             'Connection': 'keep-alive',
//             // Optional: CORS headers if needed (though usually handled by framework/proxy)
//             // 'Access-Control-Allow-Origin': '*',
//         },
//     });
// }

// // Ensure dynamic execution
// export const dynamic = 'force-dynamic';