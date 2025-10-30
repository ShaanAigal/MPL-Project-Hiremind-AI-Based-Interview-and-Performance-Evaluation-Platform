// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import { 
//   Home, 
//   Briefcase, 
//   FileText, 
//   Users, 
//   Settings, 
//   Bell,
//   Search,
//   User
// } from 'lucide-react'

// export default function RecruiterLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <div className="min-h-screen bg-background">
//       {/* Top Navbar */}
//       <header className="border-b bg-card sticky top-0 z-50">
//         <div className="flex items-center justify-between px-4 py-3">
//           <div className="flex items-center space-x-4">
//             <Link href="/">
//               <div className="flex items-center space-x-2">
//                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
//                   <span className="text-primary-foreground font-bold text-lg">H</span>
//                 </div>
//                 <h1 className="text-xl font-bold">Hiremind</h1>
//               </div>
//             </Link>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <input
//                 type="text"
//                 placeholder="Search candidates, jobs..."
//                 className="pl-10 pr-4 py-2 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
            
//             {/* Notifications */}
//             <Button variant="ghost" size="sm" className="relative">
//               <Bell className="h-5 w-5" />
//               <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
//             </Button>
            
//             {/* User Menu */}
//             <Button variant="ghost" size="sm">
//               <User className="h-5 w-5 mr-2" />
//               Admin
//             </Button>
//           </div>
//         </div>
//       </header>

//       <div className="flex">
//         {/* Sidebar */}
//         <aside className="w-64 bg-card border-r min-h-screen">
//           <nav className="p-4">
//             <div className="space-y-2">
//               <Link href="/recruiter">
//                 <Button 
//                   variant="ghost" 
//                   className="w-full justify-start"
//                 >
//                   <Home className="h-4 w-4 mr-3" />
//                   Dashboard
//                 </Button>
//               </Link>
              
//               <Link href="/recruiter/jobs">
//                 <Button 
//                   variant="ghost" 
//                   className="w-full justify-start"
//                 >
//                   <Briefcase className="h-4 w-4 mr-3" />
//                   Job Listings
//                 </Button>
//               </Link>
              
//               <Link href="/recruiter/applications">
//                 <Button 
//                   variant="ghost" 
//                   className="w-full justify-start"
//                 >
//                   <FileText className="h-4 w-4 mr-3" />
//                   Job Applications
//                 </Button>
//               </Link>
              
//               <Link href="/recruiter/candidates">
//                 <Button 
//                   variant="ghost" 
//                   className="w-full justify-start"
//                 >
//                   <Users className="h-4 w-4 mr-3" />
//                   Candidates
//                 </Button>
//               </Link>
//             </div>
            
//             {/* Bottom section */}
//             <div className="mt-8 pt-4 border-t">
//               <Link href="/recruiter/settings">
//                 <Button 
//                   variant="ghost" 
//                   className="w-full justify-start"
//                 >
//                   <Settings className="h-4 w-4 mr-3" />
//                   Settings
//                 </Button>
//               </Link>
//             </div>
//           </nav>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1">
//           {children}
//         </main>
//       </div>
//     </div>
//   )
// } 


import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Briefcase, 
  FileText, 
  Users, 
  Settings, 
  Bell,
  Search,
  User
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthWrapper } from '@/components/auth-wrapper'
import { UserButton } from '@clerk/nextjs'

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper userType="recruiter">
      <div className="flex flex-col h-screen bg-background">
      {/* Top Navbar */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">H</span>
                </div>
                <h1 className="text-xl font-bold">Hiremind</h1>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3"></span>
            </Button>

            <ThemeToggle />
            
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-background border border-border",
                  userButtonPopoverActionButton: "text-foreground hover:bg-muted",
                }
              }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r h-full">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Recruiter Dashboard</h2>
                <p className="text-sm text-muted-foreground">Manage your Jobs</p>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Link href="/recruiter">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                >
                  <Home className="h-4 w-4 mr-3" />
                  Dashboard
                </Button>
              </Link>
              
              <Link href="/recruiter/jobs">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                >
                  <Briefcase className="h-4 w-4 mr-3" />
                  Job Listings
                </Button>
              </Link>
              
              <Link href="/recruiter/applications">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Job Applications
                </Button>
              </Link>
              
              <Link href="/recruiter/candidates">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-3" />
                  Candidates
                </Button>
              </Link>
            
              {/* Bottom section */}
              <div className="!mt-auto pt-4 border-t">
                <Link href="/recruiter/settings">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </AuthWrapper>
  )
}