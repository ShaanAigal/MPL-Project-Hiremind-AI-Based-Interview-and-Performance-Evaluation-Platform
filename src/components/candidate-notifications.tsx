"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

interface Notification {
    _id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export function CandidateNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.success) {
            setNotifications(data.data);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Add auto-refresh for notifications every 3 seconds
        const interval = setInterval(fetchNotifications, 3000);
        return () => clearInterval(interval);
    }, []);

    const markAllAsRead = async () => {
        await fetch('/api/notifications', { method: 'POST' });
        fetchNotifications();
    };

    const handleClearAll = async () => {
        await fetch('/api/notifications', { method: 'DELETE' });
        setNotifications([]); // Immediately clear notifications from the UI
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="flex justify-between items-center mb-2 pb-2 border-b">
                    <h4 className="font-medium">Notifications</h4>
                    <div className="flex items-center">
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-1"/> Mark all as read
                        </Button>
                        {/* START: Clear All Button with Confirmation */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all of your notifications.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">
                                        Yes, Clear All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        {/* END: Clear All Button with Confirmation */}
                    </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                        <div key={n._id} className={`p-2 rounded-md ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                    )) : <p className="text-sm text-muted-foreground text-center py-4">No new notifications.</p>}
                </div>
            </PopoverContent>
        </Popover>
    );
}