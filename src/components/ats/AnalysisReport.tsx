"use client"

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import 'react-circular-progressbar/dist/styles.css'
import { CheckCircle, XCircle, Lightbulb, Radar, TrendingUp } from 'lucide-react' // Updated Icon
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell // Import Cell for coloring bars
} from 'recharts';

interface AnalysisResult {
  score: number;
  atsScore: number;
  toneScore: number;
  contentScore: number;
  structureScore: number;
  skillsScore: number;
  analysisSummary?: string;
  toneDetails: { checks: string[]; warnings: string[] };
  contentDetails: { checks: string[]; warnings: string[] };
  structureDetails: { checks: string[]; warnings: string[] };
  skillsDetails: { checks: string[]; warnings: string[] };
  actionableRecommendations?: string[];
  keywordAnalysis?: { matchedKeywords: string[]; missingKeywords: string[] };
  depth_analysis?: DepthAnalysis;
}

interface AnalysisReportProps {
  data: AnalysisResult
}

// <<< Copied DepthAnalysis related interfaces >>>
interface SkillProficiency {
  estimated_level: string;
  evidence: string[];
}
interface InferredSoftSkill {
  evidence: string[];
}
interface DepthAnalysis {
  skill_proficiency?: Record<string, SkillProficiency>;
  inferred_soft_skills?: Record<string, InferredSoftSkill>;
  error?: string; // To show if the python call failed
  warning?: string; // To show if skipped
}
// <<< End copied interfaces >>>

const getScoreColor = (score: number): string => { // Added return type
  if (score >= 75) return '#10b981' // green-500
  if (score >= 50) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

const getScoreDescription = (score: number) => {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Needs Improvement'
}

// <<< Copied ProficiencyBadge component >>>
const ProficiencyBadge = ({ level }: { level: string }) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    if (level === 'Intermediate') {
        bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800';
    } else if (level === 'Advanced/Expert') {
        bgColor = 'bg-green-100'; textColor = 'text-green-800';
    }
    return <span className={`px-2 py-0.5 text-xs font-medium rounded ${bgColor} ${textColor}`}>{level}</span>;
};
// <<< End copied component >>>


// Removed checkColor and warningColor

export default function AnalysisReport({ data }: AnalysisReportProps) {
  const allWarnings = [
    ...data.toneDetails.warnings,
    ...data.contentDetails.warnings,
    ...data.structureDetails.warnings,
    ...data.skillsDetails.warnings,
  ];
  const allChecks = [
    ...data.toneDetails.checks,
    ...data.contentDetails.checks,
    ...data.structureDetails.checks,
    ...data.skillsDetails.checks,
  ];

  // <<< Copied depthData variable >>>
  const depthData = data.depth_analysis;

  // Data for Radar Chart (Category Scores)
  const radarChartData = [
    { subject: 'Content', score: data.contentScore, fullMark: 100 },
    { subject: 'Skills', score: data.skillsScore, fullMark: 100 },
    { subject: 'Structure', score: data.structureScore, fullMark: 100 },
    { subject: 'ATS Comp.', score: data.atsScore, fullMark: 100 },
    { subject: 'Tone', score: data.toneScore, fullMark: 100 },
  ];

  // --- NEW: Data for Metric Bar Chart ---
  const metricBarData = [
      { name: 'Content', score: data.contentScore },
      { name: 'Skills', score: data.skillsScore },
      { name: 'Structure', score: data.structureScore },
      { name: 'ATS', score: data.atsScore },
      { name: 'Tone', score: data.toneScore },
  ];
  // --- END NEW CHART DATA ---


  return (
    <div className="space-y-8">
      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center border-b pb-6">
        <div>
          <div className="w-32 h-32 mx-auto mb-2">
            <CircularProgressbar
              value={data.score}
              text={`${data.score}%`}
              styles={buildStyles({ pathColor: getScoreColor(data.score), textColor: 'hsl(var(--foreground))', trailColor: 'hsl(var(--muted))' })}
            />
          </div>
          <h3 className="text-lg font-semibold">Overall Score</h3>
          <p className="text-sm text-muted-foreground">{getScoreDescription(data.score)}</p>
        </div>
        <div>
          <div className="w-32 h-32 mx-auto mb-2">
            <CircularProgressbar
              value={data.atsScore}
              text={`${data.atsScore}%`}
              styles={buildStyles({ pathColor: getScoreColor(data.atsScore), textColor: 'hsl(var(--foreground))', trailColor: 'hsl(var(--muted))' })}
            />
          </div>
          <h3 className="text-lg font-semibold">ATS Compatibility</h3>
          <p className="text-sm text-muted-foreground">{getScoreDescription(data.atsScore)}</p>
        </div>
      </div>

       {/* Analysis Summary */}
       {data.analysisSummary && (
            <div className="p-4 bg-muted/50 border rounded-lg">
                <h4 className="font-semibold text-md mb-2">AI Summary</h4>
                <p className="text-sm text-muted-foreground">{data.analysisSummary}</p>
            </div>
       )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-b pb-6">
          {/* Radar Chart (Category Scores) - Remains the same */}
          <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center"><Radar className="h-5 w-5 mr-2 text-primary" /> Category Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                      <PolarGrid stroke="hsl(var(--border))"/>
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}/>
                      <RechartsRadar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                       <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                  </RadarChart>
              </ResponsiveContainer>
          </div>
           {/* --- UPDATED: Metric Bar Chart --- */}
           <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" /> Resume Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={metricBarData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}> {/* Adjust margins */}
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                  {/* Single Bar component for scores */}
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                     {/* Use Cell to color each bar individually based on its score */}
                    {metricBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
          </div>
          {/* --- END UPDATED CHART --- */}
      </div>

      {/* Key Actionable Recommendations */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800/50">
        <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center mb-2"><Lightbulb className="h-5 w-5 mr-2" /> Key Actionable Recommendations</h4>
        {data.actionableRecommendations && data.actionableRecommendations.length > 0 ? (
          <ul className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              {data.actionableRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
          </ul>
        ) : allWarnings.length > 0 ? (
           <ul className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
             {allWarnings.slice(0, 5).map((warning, i) => <li key={i}>{warning}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No specific recommendations provided. Your resume looks good!</p>
        )}
      </div>

       {/* <<< Copied Depth Analysis Section >>> */}
       {depthData && !depthData.error && !depthData.warning && (
         <div className="space-y-6 border-t pt-6">
           <h3 className="text-xl font-semibold mb-4">In-Depth Analysis</h3>
           {/* Skill Proficiency */}
           {depthData.skill_proficiency && Object.keys(depthData.skill_proficiency).length > 0 && (
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg">Estimated Skill Proficiency</CardTitle>
                 <CardDescription>Based on context like projects, experience, and action verbs.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-3">
                 {Object.entries(depthData.skill_proficiency).map(([skill, details]) => (
                   <div key={skill} className="p-3 border rounded-md bg-muted/30">
                     <div className="flex justify-between items-center mb-1">
                       <h4 className="font-medium capitalize">{skill}</h4>
                       <ProficiencyBadge level={details.estimated_level} />
                     </div>
                     {details.evidence && details.evidence.length > 0 && (
                       <details className="text-xs text-muted-foreground mt-1">
                         <summary className="cursor-pointer hover:text-foreground">Show Evidence ({details.evidence.length})</summary>
                         <ul className="list-disc pl-4 mt-1 space-y-1">
                           {details.evidence.map((ev, i) => <li key={i} className="leading-snug">{ev}</li>)}
                         </ul>
                       </details>
                     )}
                   </div>
                 ))}
               </CardContent>
             </Card>
           )}
           {/* Inferred Soft Skills */}
           {depthData.inferred_soft_skills && Object.keys(depthData.inferred_soft_skills).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inferred Soft Skills</CardTitle>
                <CardDescription>Detected potential soft skills from experience descriptions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(depthData.inferred_soft_skills).map(([skill, details]) => (
                  <div key={skill} className="p-3 border rounded-md bg-muted/30">
                    <h4 className="font-medium mb-1">{skill}</h4>
                    {details.evidence && details.evidence.length > 0 && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">Show Evidence ({details.evidence.length})</summary>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          {details.evidence.map((ev, i) => <li key={i} className="leading-snug">{ev}</li>)}
                        </ul>
                      </details>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
           )}
         </div>
       )}
       {/* Show error/warning if depth analysis failed or was skipped */}
       {depthData && (depthData.error || depthData.warning) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:text-yellow-300">
               {depthData.error ? `Could not perform in-depth analysis: ${depthData.error}` : depthData.warning}
          </div>
       )}
       {/* <<< End copied section >>> */}

      {/* Strong/Weak Points */}
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800/50">
          <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center mb-2"><CheckCircle className="h-5 w-5 mr-2" /> Strong Points ({allChecks.length})</h4>
          <ScrollArea className="h-32">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground pr-4">
              {allChecks.length > 0 ? allChecks.map((check, i) => <li key={`check-${i}`}>{check}</li>) : <li>No specific strong points highlighted.</li>}
            </ul>
          </ScrollArea>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800/50">
          <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center mb-2"><XCircle className="h-5 w-5 mr-2" /> Areas for Improvement ({allWarnings.length})</h4>
           <ScrollArea className="h-32">
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground pr-4">
                {allWarnings.length > 0 ? allWarnings.map((warning, i) => <li key={`warn-${i}`}>{warning}</li>) : <li>No specific areas for improvement highlighted.</li>}
              </ul>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}