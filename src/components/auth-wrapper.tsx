"use client"

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck } from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
  userType?: 'candidate' | 'recruiter'
}

export function AuthWrapper({ children, userType }: AuthWrapperProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [showRoleSelection, setShowRoleSelection] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    } else if (isLoaded && isSignedIn && !userType) {
      // If user is signed in but no specific role is required, show role selection
      setShowRoleSelection(true)
    }
  }, [isLoaded, isSignedIn, userType, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null // Will redirect to sign-in
  }

  if (showRoleSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName || 'there'}!</h1>
            <p className="text-muted-foreground">Choose your role to continue</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50"
              onClick={() => router.push('/candidate')}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>I'm a Candidate</CardTitle>
                </div>
                <CardDescription>
                  Looking for opportunities and want to showcase my skills through AI interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Continue as Candidate
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50"
              onClick={() => router.push('/recruiter')}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>I'm a Recruiter</CardTitle>
                </div>
                <CardDescription>
                  Looking to hire top talent using AI-powered interviews and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Continue as Recruiter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
