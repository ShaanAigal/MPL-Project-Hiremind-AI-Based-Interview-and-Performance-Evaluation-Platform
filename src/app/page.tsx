"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, UserCheck, Bot, BarChart2, CheckCircle, Sparkles, ShieldCheck, Gauge, ArrowRight, Zap, Target, TrendingUp, Orbit, LogIn } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@clerk/nextjs'

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const { isSignedIn } = useAuth()

  useEffect(() => {
    setIsVisible(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--primary)/0.08),transparent_50%),radial-gradient(ellipse_at_bottom,rgb(var(--primary)/0.05),transparent_50%)]" />

        {/* Floating Orbs with Parallax */}
        <div
          className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-float"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div
          className="absolute bottom-40 left-20 w-80 h-80 bg-primary/8 rounded-full blur-[100px] animate-float-delayed"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border/5)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/5)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>

      {/* Navbar with Glass Effect */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/30">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-110">
              <span className="text-primary-foreground font-bold text-lg">H</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-transparent opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text transition-all duration-300">Hiremind</span>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="hidden sm:flex group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/sign-in">
                  <Button variant="outline" size="lg" className="hidden sm:flex">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="hidden sm:flex group relative overflow-hidden">
                      <span className="relative z-10 flex items-center">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </Button>
                  </DialogTrigger>
              <DialogContent className="max-w-md border-border/40 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Choose your path</DialogTitle>
                  <DialogDescription>Sign up to get started with Hiremind</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 pt-4">
                  <Link href="/sign-up?role=recruiter" className="w-full">
                    <Card className="cursor-pointer border-border/40 bg-background/50 backdrop-blur hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/50 hover:scale-[1.02] group">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-300">
                            <Users className="h-6 w-6 text-primary" />
                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Recruiter</h3>
                            <p className="text-sm text-muted-foreground">Hire top talent with AI interviews</p>
                          </div>
                          <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/sign-up?role=candidate" className="w-full">
                    <Card className="cursor-pointer border-border/40 bg-background/50 backdrop-blur hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/50 hover:scale-[1.02] group">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-300">
                            <UserCheck className="h-6 w-6 text-primary" />
                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Candidate</h3>
                            <p className="text-sm text-muted-foreground">Showcase your skills in AI interviews</p>
                          </div>
                          <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Stagger Animation */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 lg:py-32 relative">
          <div className={`max-w-5xl mx-auto text-center space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">AI-Powered Hiring Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="inline-block bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent animate-fade-in-up">
                Hire Smarter with
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent animate-fade-in-up animation-delay-200 animate-gradient">
                AI Interviews
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Transform your hiring process with intelligent interviews, data-driven insights, and unbiased candidate evaluation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up animation-delay-600">
              {isSignedIn ? (
                <>
                  <Link href="/recruiter" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full text-lg h-14 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group relative overflow-hidden">
                      <span className="relative z-10 flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Recruiter Dashboard
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </Button>
                  </Link>
                  <Link href="/candidate" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full text-lg h-14 px-8 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 group">
                      <UserCheck className="mr-2 h-5 w-5 transition-transform group-hover:scale-110 duration-300" />
                      Candidate Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/sign-up?role=recruiter" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full text-lg h-14 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group relative overflow-hidden">
                      <span className="relative z-10 flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Start Hiring
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </Button>
                  </Link>
                  <Link href="/sign-up?role=candidate" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full text-lg h-14 px-8 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 group">
                      <UserCheck className="mr-2 h-5 w-5 transition-transform group-hover:scale-110 duration-300" />
                      Join as Candidate
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground animate-fade-in-up animation-delay-800">
              <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-300">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Reduces hiring process</span>
              </div>
              <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-300">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Free to explore</span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-10 w-2 h-2 bg-primary rounded-full animate-ping opacity-50" />
          <div className="absolute top-1/3 right-20 w-2 h-2 bg-primary rounded-full animate-ping opacity-50 animation-delay-1000" />
          <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping opacity-50 animation-delay-2000" />
        </section>

        {/* Animated Stats Section */}
        <section className="border-y border-border/40 bg-muted/30 backdrop-blur relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          <div className="container mx-auto px-6 py-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { value: 'Swift', label: 'Hiring, made faster' },
                { value: 'Fairness', label: 'Eliminate bias in every step' },
                { value: '24/7', label: 'Interview availability' }
              ].map((stat, i) => (
                <div key={i} className="text-center space-y-2 group cursor-default">
                  <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-110">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features with Hover Effects */}
        <section className="container mx-auto px-6 py-24 relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Why Choose Hiremind?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revolutionary features that transform how you hire and evaluate talent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              { icon: Bot, title: 'AI-Powered Interviews', desc: 'Intelligent conversations that adapt to candidates in real-time with context-aware follow-ups' },
              { icon: BarChart2, title: 'Deep Analytics', desc: 'Comprehensive performance metrics, skills breakdown, and benchmark comparisons' },
              { icon: Target, title: 'Zero Bias', desc: 'Structured, objective evaluations that focus purely on skills and competencies' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Conduct interviews and receive detailed reports in minutes, not days' },
              { icon: ShieldCheck, title: 'Secure & Private', desc: 'Enterprise-grade security with role-based access and data encryption' },
              { icon: Gauge, title: 'Infinitely Scalable', desc: 'From startup to enterprise, handle any volume with consistent quality' }
            ].map((feature, i) => (
              <Card
                key={i}
                className="group relative overflow-hidden border-border/40 bg-background/50 backdrop-blur hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 cursor-default"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10">
                  <div className="relative p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl w-fit mb-4 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works with Timeline */}
        <section className="bg-muted/30 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border/3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to revolutionize your hiring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-32 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {[
                { num: '01', icon: Briefcase, title: 'Create a Job', desc: 'Define roles, required skills, and interview focus areas', detail: 'Our AI generates tailored interview flows and scoring rubrics based on your requirements' },
                { num: '02', icon: Bot, title: 'AI Interviews', desc: 'Candidates engage in structured, adaptive conversations', detail: 'Real-time analysis of responses, communication style, and technical competency' },
                { num: '03', icon: TrendingUp, title: 'Get Insights', desc: 'Receive detailed reports with actionable recommendations', detail: 'Compare candidates side-by-side with comprehensive dashboards and analytics' }
              ].map((step, i) => (
                <Card
                  key={i}
                  className="relative overflow-hidden border-border/40 bg-background/80 backdrop-blur group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
                  <CardHeader className="relative z-10">
                    <div className="text-7xl font-bold text-primary/10 mb-4 group-hover:text-primary/20 transition-colors duration-500">
                      {step.num}
                    </div>
                    <CardTitle className="text-2xl flex items-center gap-3 group-hover:text-primary transition-colors duration-300">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:rotate-6 transition-all duration-300">
                        <step.icon className="h-6 w-6" />
                      </div>
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {step.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground relative z-10">
                    {step.detail}
                  </CardContent>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA with Animated Border */}
        <section className="container mx-auto px-6 py-24">
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgb(var(--primary)/0.1),transparent_70%)] animate-pulse-slow" />
            <CardContent className="relative z-10 p-12 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur mb-4">
                <Orbit className="h-4 w-4 text-primary animate-spin-slow" />
                <span className="text-sm font-medium">Join the Future of Hiring</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Ready to Transform Your Hiring?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join forward-thinking companies using AI to build exceptional teams
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                {isSignedIn ? (
                  <>
                    <Link href="/recruiter">
                      <Button size="lg" className="text-lg h-14 px-8 shadow-lg shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 group relative overflow-hidden">
                        <span className="relative z-10 flex items-center">
                          Recruiter Dashboard
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      </Button>
                    </Link>
                    <Link href="/candidate">
                      <Button variant="outline" size="lg" className="text-lg h-14 px-8 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300">
                        Candidate Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/sign-up?role=recruiter">
                      <Button size="lg" className="text-lg h-14 px-8 shadow-lg shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 group relative overflow-hidden">
                        <span className="relative z-10 flex items-center">
                          Get Started Free
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      </Button>
                    </Link>
                    <Link href="/sign-up?role=candidate">
                      <Button variant="outline" size="lg" className="text-lg h-14 px-8 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300">
                        Explore as Candidate
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
            <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/30 rounded-lg transition-all duration-700 animate-border-glow" />
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 backdrop-blur relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-50" />

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="grid gap-12 md:grid-cols-4 mb-12">
            {/* Brand Section */}
            <div className="space-y-6 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 group w-fit">
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-primary-foreground font-bold text-xl">H</span>
                  <div className="absolute inset-0 rounded-xl bg-primary/30 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <span className="font-bold text-2xl">Hiremind</span>
              </Link>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                AI-powered interviews and performance insights for modern hiring teams. Build exceptional teams faster.
              </p>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </div>

            {/* Links Sections */}
            {[
              { title: 'Product', items: ['Features', 'How it works', 'Pricing', 'Security'] },
              { title: 'Company', items: ['About', 'Careers', 'Contact', 'Blog'] },
              { title: 'Resources', items: ['Documentation', 'Help Center', 'Privacy Policy', 'Terms of Service'] }
            ].map((section, i) => (
              <div key={i} className="space-y-5">
                <h3 className="font-semibold text-lg text-foreground">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j}>
                      <Link
                        href="#"
                        className="text-muted-foreground hover:text-primary cursor-pointer transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                      >
                        <span className="w-0 h-px bg-primary group-hover:w-4 transition-all duration-300" />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border/40 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Hiremind. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-primary transition-colors duration-300">
                  Privacy
                </Link>
                <span className="w-px h-4 bg-border/40" />
                <Link href="#" className="hover:text-primary transition-colors duration-300">
                  Terms
                </Link>
                <span className="w-px h-4 bg-border/40" />
                <Link href="#" className="hover:text-primary transition-colors duration-300">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(var(--primary), 0.2); }
          50% { box-shadow: 0 0 40px rgba(var(--primary), 0.4); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 3s infinite; }
        .animate-gradient { animation: gradient 3s ease infinite; background-size: 200% 200%; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-border-glow { animation: border-glow 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  )
}