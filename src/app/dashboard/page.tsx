import { AuthWrapper } from '@/components/auth-wrapper'

export default function DashboardPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-8">Welcome to your Dashboard</h1>
          <p className="text-muted-foreground">
            Choose your role to access the appropriate dashboard.
          </p>
        </div>
      </div>
    </AuthWrapper>
  )
}