// import { NextRequest, NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { analyzeResumeWithFallback } from '@/lib/ats-analyzer'; // Rule-based logic and basic fallback

// // Initialize Gemini AI (only if API key is provided)
// let genAI: GoogleGenerativeAI | null = null;
// if (process.env.GEMINI_API_KEY) {
//   try {
//     genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     console.log("Gemini AI initialized successfully.");
//   } catch (error) {
//     console.error("Failed to initialize GoogleGenerativeAI:", error);
//     genAI = null; // Ensure genAI is null if initialization fails
//   }
// } else {
//   console.warn("GEMINI_API_KEY not found. AI analysis will rely solely on the rule-based analyzer if Gemini is prioritized but fails or is skipped.");
// }

// export const runtime = 'nodejs'; // Ensure Node.js runtime for Buffer, pdf-parse, mammoth
// export const dynamic = 'force-dynamic'; // Ensures the route is not statically optimized

// // Define the Python API URL (use environment variable ideally)
// const PYTHON_API_URL = process.env.PYTHON_ANALYSIS_API_URL || 'http://localhost:5001/analyze-resume-depth';

// // --- Helper: Robust JSON Parsing ---
// function parseGeminiJson(rawText: string): any {
//   let cleanedText = rawText.trim();
//   // Remove potential markdown fences
//   if (cleanedText.startsWith('```json')) {
//     cleanedText = cleanedText.substring(7); // Remove ```json
//     if (cleanedText.endsWith('```')) {
//       cleanedText = cleanedText.substring(0, cleanedText.length - 3);
//     }
//   } else if (cleanedText.startsWith('```')) {
//      cleanedText = cleanedText.substring(3);
//      if (cleanedText.endsWith('```')) {
//        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
//      }
//   }

//   try {
//     // First, try parsing directly
//     return JSON.parse(cleanedText);
//   } catch (e1) {
//     console.warn("Direct JSON parsing failed, attempting regex match...");
//     // If direct parse fails, try regex match (fallback for malformed responses)
//     try {
//         const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
//         if (jsonMatch) {
//             return JSON.parse(jsonMatch[0]);
//         } else {
//             throw new Error("No JSON object found in the response text.");
//         }
//     } catch(e2){
//         console.error("Failed to parse JSON from Gemini response even after cleaning:", cleanedText);
//         throw new Error(`Failed to parse AI analysis response. Raw text: ${rawText.substring(0, 200)}...`); // Include snippet for debugging
//     }
//   }
// }

// // --- Main POST Handler ---
// export async function POST(request: NextRequest) {
//   console.log(`[${new Date().toISOString()}] Received ATS analysis request.`);
//   let analysis: any | null = null; // Initialize analysis as null
//   let analysisMethod = 'unknown'; // Start with unknown
//   let depthAnalysis: any = {}; // Initialize depth analysis object

//   try {
//     // 1. Parse FormData
//     const formData = await request.formData();
//     const file = formData.get('resumeFile') as File | null;
//     const jobRole = formData.get('jobRole') as string | undefined;
//     const jobDescription = formData.get('jobDescription') as string | undefined;

//     // 2. Validate File Existence
//     if (!file) {
//       console.error('Validation Error: No file provided.');
//       return NextResponse.json({ success: false, error: 'No resume file provided.' }, { status: 400 });
//     }
//     console.log(`Processing file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

//     // 3. Validate File Type
//     const validTypes = [
//       'application/pdf',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//     ];
//     if (!validTypes.includes(file.type)) {
//       console.error(`Validation Error: Invalid file type - ${file.type}`);
//       return NextResponse.json(
//         { success: false, error: `Invalid file type: ${file.type}. Only PDF (.pdf) and Word (.docx) files are allowed.` },
//         { status: 400 }
//       );
//     }

//     // 4. Validate File Size
//     const maxSize = 10 * 1024 * 1024;
//     if (file.size > maxSize) {
//       console.error(`Validation Error: File size exceeds limit - ${file.size} bytes`);
//       return NextResponse.json(
//         { success: false, error: `File size exceeds the 10MB limit. Please upload a smaller file.` },
//         { status: 400 }
//       );
//     }

//     // 5. Extract Text from File
//     let resumeText = '';
//     let skillsFromRuleBased: string[] = []; // Store skills found by rule-based system
//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);
//       console.log('Buffer created, size:', buffer.length, 'bytes');

//       if (file.type === 'application/pdf') {
//         console.log('Attempting PDF parsing...');
//         const pdfParse = (await import('pdf-parse')).default;
//         const pdfData = await pdfParse(buffer);
//         resumeText = pdfData.text;
//         console.log('PDF parsed successfully.');
//       } else { // Must be docx based on earlier validation
//         console.log('Attempting DOCX parsing...');
//         const mammoth = (await import('mammoth')).default;
//         const docxResult = await mammoth.extractRawText({ buffer });
//         resumeText = docxResult.value;
//         console.log('DOCX parsed successfully.');
//       }
//     } catch (parseError: any) {
//       console.error('File Parsing Error:', parseError.message, parseError.stack);
//       return NextResponse.json(
//         { success: false, error: 'Failed to read the content of the uploaded file. It might be corrupted or in an unsupported format variant. Please try saving it again or using a different format (PDF/DOCX).' },
//         { status: 400 }
//       );
//     }

//     // 6. Validate Extracted Text
//     if (!resumeText || resumeText.trim().length === 0) {
//       console.error('Text Extraction Error: No text could be extracted from the file.');
//       return NextResponse.json(
//         { success: false, error: 'Could not extract any text from the resume file. Please ensure the file is not empty or image-based.' },
//         { status: 400 }
//       );
//     }
//     console.log(`Text extracted successfully. Length: ${resumeText.length} characters.`);

//     // --- NEW: Run rule-based analysis first to extract skills for proficiency check ---
//     let preliminaryAnalysis: any = {};
//     try {
//         console.log('Running preliminary rule-based analysis to extract skills...');
//         preliminaryAnalysis = analyzeResumeWithFallback(resumeText, jobRole, jobDescription);
        
//         // Extract potential skills from the checks (improved extraction logic)
//         if (preliminaryAnalysis?.skillsDetails?.checks) {
//             preliminaryAnalysis.skillsDetails.checks.forEach((check: string) => {
//                 // Example: Extract skills mentioned like "Lists key required skills like React and Node.js"
//                 const skillMatch = check.match(/skills like ([\w\s.,]+)/i);
//                 if (skillMatch && skillMatch[1]) {
//                     skillsFromRuleBased.push(...skillMatch[1].split(',').map(s => s.trim().replace(/\.$/, '')));
//                 } else if (check.includes('skill alignment') || check.includes('skill set') || check.includes('technical skills')) {
//                     // Try extracting skills mentioned directly in checks
//                     const mentioned = check.match(/(\b[A-Za-z.#+]+(?:[\s-][A-Za-z.#+]+)*\b)/g) || [];
//                     // Filter common words - basic filtering
//                     const commonWords = new Set(['skills', 'like', 'good', 'strong', 'excellent', 'alignment', 'found', 'set', 'technical', 'uses', 'includes', 'demonstrates', 'shows', 'has']);
//                     mentioned.forEach(m => {
//                         if (!commonWords.has(m.toLowerCase()) && m.length > 1) {
//                             skillsFromRuleBased.push(m);
//                         }
//                     });
//                 }
//             });
            
//             // Also extract from matched keywords if available
//             if (preliminaryAnalysis?.keywordAnalysis?.matchedKeywords) {
//                 skillsFromRuleBased.push(...preliminaryAnalysis.keywordAnalysis.matchedKeywords);
//             }
            
//             // Deduplicate and normalize
//             skillsFromRuleBased = Array.from(new Set(skillsFromRuleBased.map(s => s.toLowerCase())));
//             console.log("Extracted skills for proficiency check:", skillsFromRuleBased.slice(0, 10), `(${skillsFromRuleBased.length} total)`);
//         }
//     } catch (error) {
//         console.warn("Preliminary rule-based analysis failed, proceeding without skill list for proficiency:", error);
//     }
//     // --- END SKILL EXTRACTION ---

//     // 7. Attempt Gemini AI Analysis FIRST (if available)
//     if (genAI) {
//       console.log('Attempting Gemini AI analysis as primary method...');
//       try {
//           const prompt = `Act as an expert ATS (Applicant Tracking System) and professional resume reviewer. Analyze the provided resume text thoroughly, considering the target job context if available.

// **Resume Text:**
// \`\`\`
// ${resumeText}
// \`\`\`

// **Target Job Context (if provided):**
// - Job Role: ${jobRole || 'Not specified'}
// - Job Description: ${jobDescription || 'Not specified'}

// **Analysis Task:**
// Provide a detailed, critical analysis focusing on ATS compatibility and overall professional presentation. Score each category strictly based on the resume content and its relevance to the job context (if provided). Generate actionable feedback.

// **Output Format (Strict JSON):**
// Return ONLY a valid JSON object with the following structure. Do not include markdown formatting like \`\`\`json.

// {
//   "score": <Overall score (0-100), weighted average: Skills(30%), Content(30%), Structure(15%), ATS(15%), Tone(10%)>,
//   "atsScore": <ATS compatibility score (0-100), focusing on keywords, formatting, sections>,
//   "toneScore": <Professional Tone score (0-100), considering active voice, conciseness, avoiding jargon/cliches>,
//   "contentScore": <Content relevance score (0-100), focusing on quantifiable achievements, action verbs, impact, relevance to job context>,
//   "structureScore": <Resume Structure score (0-100), considering clarity, sections (Contact, Experience, Education, Skills), length, readability, use of bullet points>,
//   "skillsScore": <Skills relevance score (0-100), focusing on matching technical and soft skills to job context, proficiency indicators>,
//   "analysisSummary": "<A concise (2-3 sentence) summary of the resume's main strengths and weaknesses regarding the target job>",
//   "toneDetails": {
//     "checks": ["<Positive feedback on tone, e.g., 'Uses active voice effectively'>", "..."],
//     "warnings": ["<Specific, actionable feedback on tone, e.g., 'Reduce passive voice in experience section'>", "..."]
//   },
//   "contentDetails": {
//     "checks": ["<Positive feedback on content, e.g., 'Includes quantified results (e.g., improved performance by 40%)'>", "..."],
//     "warnings": ["<Specific, actionable feedback on content, e.g., 'Quantify impact of leading the team (e.g., delivered X projects ahead of schedule)'>", "..."]
//   },
//   "structureDetails": {
//     "checks": ["<Positive feedback on structure, e.g., 'Clear separation of sections (Experience, Education, Skills)'>", "..."],
//     "warnings": ["<Specific, actionable feedback on structure, e.g., 'Consider adding a brief professional summary section'>", "..."]
//   },
//   "skillsDetails": {
//     "checks": ["<Positive feedback on skills, e.g., 'Lists key required skills like React and Node.js'>", "..."],
//     "warnings": ["<Specific, actionable feedback on skills, e.g., 'Add specific cloud platform experience (AWS/Azure/GCP) mentioned in job description'>", "..."]
//   },
//   "keywordAnalysis": {
//      "matchedKeywords": ["<List of important keywords from job context found in resume>", "..."],
//      "missingKeywords": ["<List of important keywords from job context NOT found in resume>", "..."]
//   },
//   "actionableRecommendations": [
//      "<Concrete suggestion 1, e.g., 'Rephrase bullet point X under Tech Company using the STAR method'>",
//      "<Concrete suggestion 2, e.g., 'Incorporate keywords like 'microservices' and 'agile development' into your experience descriptions'>",
//      "<Concrete suggestion 3, e.g., 'Ensure contact information includes a LinkedIn profile URL'>"
//      // Up to 5 specific recommendations
//   ]
// }
// `;
//           const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
//           console.log("Sending prompt to Gemini...");
//           const result = await model.generateContent(prompt);
//           const response = await result.response;
//           const analysisText = response.text();
//           console.log("Received response from Gemini.");

//           analysis = parseGeminiJson(analysisText); // Use robust parser

//           // Validate Gemini analysis result structure
//           if (!analysis || typeof analysis.score !== 'number' || !analysis.toneDetails) {
//               console.error("Gemini response parsing yielded invalid structure:", analysis);
//               throw new Error("AI analysis response was incomplete or malformed."); // Trigger fallback
//           }

//           analysisMethod = 'gemini'; // Mark as successful Gemini analysis
//           console.log(`Gemini AI analysis successful. Overall Score: ${analysis?.score}, ATS Score: ${analysis?.atsScore}`);

//       } catch (geminiError: any) {
//         console.warn(`Gemini AI analysis failed: ${geminiError.message}. Falling back to rule-based analyzer.`);
//         // Analysis remains null, will proceed to fallback
//       }
//     } else {
//         console.log("Gemini AI not available (no API key). Proceeding directly to rule-based analyzer.");
//     }

//     // 8. Fallback to Rule-Based Analyzer (if Gemini failed or wasn't available)
//     if (analysisMethod !== 'gemini') {
//       try {
//         console.log('Running rule-based ATS analyzer as primary/fallback method...');
//         // Use the already run preliminary analysis if available to avoid duplicate work
//         analysis = preliminaryAnalysis && preliminaryAnalysis.score ? preliminaryAnalysis : analyzeResumeWithFallback(resumeText, jobRole, jobDescription);
        
//         // Basic validation of the fallback result
//         if (!analysis || typeof analysis.score !== 'number') {
//              throw new Error("Rule-based fallback analyzer returned invalid structure.");
//         }
//         analysisMethod = 'free'; // Mark as free/fallback analysis
//         console.log(`Rule-based analysis completed. Overall Score: ${analysis.score}, ATS Score: ${analysis.atsScore}`);
//       } catch (fallbackError: any) {
//           console.error("Critical Error: Rule-based fallback analyzer also failed:", fallbackError.message);
//           // If even the basic fallback fails, we must return an error
//           throw new Error("All analysis methods failed. Unable to process the resume.");
//       }
//     }

//     // --- NEW: Call Python API for In-Depth Analysis ---
//     if (resumeText && skillsFromRuleBased.length > 0) { 
//         try {
//             console.log(`Calling Python depth analysis API at ${PYTHON_API_URL}...`);
//             console.log(`Sending ${skillsFromRuleBased.length} skills for proficiency analysis`);
            
//             const depthResponse = await fetch(PYTHON_API_URL, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     resume_text: resumeText,
//                     skills_list: skillsFromRuleBased // Send the extracted skills
//                 }),
//             });

//             if (!depthResponse.ok) {
//                 const errorBody = await depthResponse.text();
//                 console.error(`Python API error (${depthResponse.status}): ${errorBody}`);
//                 // Don't throw error, just log it, analysis can proceed without depth info
//                 depthAnalysis = { 
//                     error: `Python API failed with status ${depthResponse.status}`,
//                     skill_proficiency: [],
//                     inferred_soft_skills: []
//                 };
//             } else {
//                 const depthData = await depthResponse.json();
//                 if (depthData.success) {
//                     depthAnalysis = {
//                         skill_proficiency: depthData.skill_proficiency || [],
//                         inferred_soft_skills: depthData.inferred_soft_skills || [],
//                     };
//                     console.log(`Successfully received depth analysis: ${depthData.skill_proficiency?.length || 0} skills analyzed, ${depthData.inferred_soft_skills?.length || 0} soft skills inferred`);
//                 } else {
//                     console.error("Python API returned success=false:", depthData.error);
//                     depthAnalysis = { 
//                         error: depthData.error || "Python API reported an error.",
//                         skill_proficiency: [],
//                         inferred_soft_skills: []
//                     };
//                 }
//             }
//         } catch (fetchError: any) {
//             console.error(`Failed to fetch from Python API: ${fetchError.message}`);
//             depthAnalysis = { 
//                 error: `Network error calling Python API: ${fetchError.message}`,
//                 skill_proficiency: [],
//                 inferred_soft_skills: []
//             };
//              // Don't throw, proceed without depth info
//         }
//     } else {
//          console.warn("Skipping depth analysis call: No resume text or no skills extracted.");
//          depthAnalysis = { 
//              warning: "Skipped: No text or skills for depth analysis.",
//              skill_proficiency: [],
//              inferred_soft_skills: []
//          };
//     }
//     // --- END PYTHON API INTEGRATION ---

//     // 9. Return Successful Response (using the result from either Gemini or fallback + depth analysis)
//     console.log(`Analysis completed using method: ${analysisMethod}`);
//     return NextResponse.json({
//       success: true,
//       // Provide default empty structures if fields are missing from analysis result
//       analysis: {
//         score: analysis.score ?? 0,
//         atsScore: analysis.atsScore ?? 0,
//         toneScore: analysis.toneScore ?? 0,
//         contentScore: analysis.contentScore ?? 0,
//         structureScore: analysis.structureScore ?? 0,
//         skillsScore: analysis.skillsScore ?? 0,
//         analysisSummary: analysis.analysisSummary ?? '',
//         toneDetails: analysis.toneDetails ?? { checks: [], warnings: [] },
//         contentDetails: analysis.contentDetails ?? { checks: [], warnings: [] },
//         structureDetails: analysis.structureDetails ?? { checks: [], warnings: [] },
//         skillsDetails: analysis.skillsDetails ?? { checks: [], warnings: [] },
//         keywordAnalysis: analysis.keywordAnalysis ?? { matchedKeywords: [], missingKeywords: [] },
//         actionableRecommendations: analysis.actionableRecommendations ?? [],
//         // NEW: Add depth analysis results
//         depth_analysis: depthAnalysis,
//       },
//       analysisMethod: analysisMethod,
//     }, { status: 200 });

//   } catch (error: any) {
//     // 10. Catch-All Error Handler
//     console.error(`[${new Date().toISOString()}] Unhandled ATS analysis error:`, error.message);
//     if (error.stack) console.error('Error Stack:', error.stack);
//     // Ensure analysisMethod reflects the state if an error occurred before completion
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: error.message || 'An unexpected internal server error occurred during analysis. Please try again later.', 
//         analysisMethod: analysisMethod === 'unknown' ? 'failed_before_attempt' : analysisMethod 
//       },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyzeResumeWithFallback } from '@/lib/ats-analyzer'; // Rule-based logic and basic fallback

// Initialize Gemini AI (only if API key is provided)
let genAI: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Gemini AI initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI:", error);
    genAI = null; // Ensure genAI is null if initialization fails
  }
} else {
  console.warn("GEMINI_API_KEY not found. AI analysis will rely solely on the rule-based analyzer if Gemini is prioritized but fails or is skipped.");
}

export const runtime = 'nodejs'; // Ensure Node.js runtime for Buffer, pdf-parse, mammoth
export const dynamic = 'force-dynamic'; // Ensures the route is not statically optimized

// Define the Python API URL (use environment variable ideally)
const PYTHON_API_URL = process.env.PYTHON_ANALYSIS_API_URL || 'http://localhost:5001/analyze-resume-depth';
// Feature flag: enable/disable calling the external Python depth analysis service.
// Default: disabled to remove Python dependency from Next.js runtime.
const ENABLE_PYTHON_ANALYSIS = process.env.ENABLE_PYTHON_ANALYSIS === 'true';

// --- Helper: Robust JSON Parsing ---
function parseGeminiJson(rawText: string): any {
  let cleanedText = rawText.trim();
  // Remove potential markdown fences
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.substring(7); // Remove ```json
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
  } else if (cleanedText.startsWith('```')) {
     cleanedText = cleanedText.substring(3);
     if (cleanedText.endsWith('```')) {
       cleanedText = cleanedText.substring(0, cleanedText.length - 3);
     }
  }

  try {
    // First, try parsing directly
    return JSON.parse(cleanedText);
  } catch (e1) {
    console.warn("Direct JSON parsing failed, attempting regex match...");
    // If direct parse fails, try regex match (fallback for malformed responses)
    try {
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("No JSON object found in the response text.");
        }
    } catch(e2){
        console.error("Failed to parse JSON from Gemini response even after cleaning:", cleanedText);
        throw new Error(`Failed to parse AI analysis response. Raw text: ${rawText.substring(0, 200)}...`); // Include snippet for debugging
    }
  }
}

// --- Main POST Handler ---
export async function POST(request: NextRequest) {
  console.log(`[${new Date().toISOString()}] Received ATS analysis request.`);
  let analysis: any | null = null; // Initialize analysis as null
  let analysisMethod = 'unknown'; // Start with unknown
  let depthAnalysis: any = {}; // Initialize depth analysis object

  try {
    // 1. Parse FormData
    const formData = await request.formData();
    const file = formData.get('resumeFile') as File | null;
    const jobRole = formData.get('jobRole') as string | undefined;
    const jobDescription = formData.get('jobDescription') as string | undefined;

    // 2. Validate File Existence
    if (!file) {
      console.error('Validation Error: No file provided.');
      return NextResponse.json({ success: false, error: 'No resume file provided.' }, { status: 400 });
    }
    console.log(`Processing file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

    // 3. Validate File Type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(file.type)) {
      console.error(`Validation Error: Invalid file type - ${file.type}`);
      return NextResponse.json(
        { success: false, error: `Invalid file type: ${file.type}. Only PDF (.pdf) and Word (.docx) files are allowed.` },
        { status: 400 }
      );
    }

    // 4. Validate File Size
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error(`Validation Error: File size exceeds limit - ${file.size} bytes`);
      return NextResponse.json(
        { success: false, error: `File size exceeds the 10MB limit. Please upload a smaller file.` },
        { status: 400 }
      );
    }

    // 5. Extract Text from File
    let resumeText = '';
    let skillsFromRuleBased: string[] = []; // Store skills found by rule-based system
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log('Buffer created, size:', buffer.length, 'bytes');

      if (file.type === 'application/pdf') {
        console.log('Attempting PDF parsing...');
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(buffer);
        resumeText = pdfData.text;
        console.log('PDF parsed successfully.');
      } else { // Must be docx based on earlier validation
        console.log('Attempting DOCX parsing...');
        const mammoth = (await import('mammoth')).default;
        const docxResult = await mammoth.extractRawText({ buffer });
        resumeText = docxResult.value;
        console.log('DOCX parsed successfully.');
      }
    } catch (parseError: any) {
      console.error('File Parsing Error:', parseError.message, parseError.stack);
      return NextResponse.json(
        { success: false, error: 'Failed to read the content of the uploaded file. It might be corrupted or in an unsupported format variant. Please try saving it again or using a different format (PDF/DOCX).' },
        { status: 400 }
      );
    }

    // 6. Validate Extracted Text
    if (!resumeText || resumeText.trim().length === 0) {
      console.error('Text Extraction Error: No text could be extracted from the file.');
      return NextResponse.json(
        { success: false, error: 'Could not extract any text from the resume file. Please ensure the file is not empty or image-based.' },
        { status: 400 }
      );
    }
    console.log(`Text extracted successfully. Length: ${resumeText.length} characters.`);

    // --- NEW: Run rule-based analysis first to extract skills for proficiency check ---
    let preliminaryAnalysis: any = {};
    try {
        console.log('Running preliminary rule-based analysis to extract skills...');
        preliminaryAnalysis = analyzeResumeWithFallback(resumeText, jobRole, jobDescription);
        
        // Extract potential skills from the checks (improved extraction logic)
        if (preliminaryAnalysis?.skillsDetails?.checks) {
            preliminaryAnalysis.skillsDetails.checks.forEach((check: string) => {
                // Example: Extract skills mentioned like "Lists key required skills like React and Node.js"
                const skillMatch = check.match(/skills like ([\w\s.,]+)/i);
                if (skillMatch && skillMatch[1]) {
                    skillsFromRuleBased.push(...skillMatch[1].split(',').map(s => s.trim().replace(/\.$/, '')));
                } else if (check.includes('skill alignment') || check.includes('skill set') || check.includes('technical skills')) {
                    // Try extracting skills mentioned directly in checks
                    const mentioned = check.match(/(\b[A-Za-z.#+]+(?:[\s-][A-Za-z.#+]+)*\b)/g) || [];
                    // Filter common words - basic filtering
                    const commonWords = new Set(['skills', 'like', 'good', 'strong', 'excellent', 'alignment', 'found', 'set', 'technical', 'uses', 'includes', 'demonstrates', 'shows', 'has']);
                    mentioned.forEach(m => {
                        if (!commonWords.has(m.toLowerCase()) && m.length > 1) {
                            skillsFromRuleBased.push(m);
                        }
                    });
                }
            });
            
            // Also extract from matched keywords if available
            if (preliminaryAnalysis?.keywordAnalysis?.matchedKeywords) {
                skillsFromRuleBased.push(...preliminaryAnalysis.keywordAnalysis.matchedKeywords);
            }
            
            // Deduplicate and normalize
            skillsFromRuleBased = Array.from(new Set(skillsFromRuleBased.map(s => s.toLowerCase())));
            console.log("Extracted skills for proficiency check:", skillsFromRuleBased.slice(0, 10), `(${skillsFromRuleBased.length} total)`);
        }
    } catch (error) {
        console.warn("Preliminary rule-based analysis failed, proceeding without skill list for proficiency:", error);
    }
    // --- END SKILL EXTRACTION ---

    // 7. Attempt Gemini AI Analysis FIRST (if available)
    if (genAI) {
      console.log('Attempting Gemini AI analysis as primary method...');
      try {
          const prompt = `Act as an expert ATS (Applicant Tracking System) and professional resume reviewer. Analyze the provided resume text thoroughly, considering the target job context if available.

**Resume Text:**
\`\`\`
${resumeText}
\`\`\`

**Target Job Context (if provided):**
- Job Role: ${jobRole || 'Not specified'}
- Job Description: ${jobDescription || 'Not specified'}

**Analysis Task:**
Provide a detailed, critical analysis focusing on ATS compatibility and overall professional presentation. Score each category strictly based on the resume content and its relevance to the job context (if provided). Generate actionable feedback.

**Output Format (Strict JSON):**
Return ONLY a valid JSON object with the following structure. Do not include markdown formatting like \`\`\`json.

{
  "score": <Overall score (0-100), weighted average: Skills(30%), Content(30%), Structure(15%), ATS(15%), Tone(10%)>,
  "atsScore": <ATS compatibility score (0-100), focusing on keywords, formatting, sections>,
  "toneScore": <Professional Tone score (0-100), considering active voice, conciseness, avoiding jargon/cliches>,
  "contentScore": <Content relevance score (0-100), focusing on quantifiable achievements, action verbs, impact, relevance to job context>,
  "structureScore": <Resume Structure score (0-100), considering clarity, sections (Contact, Experience, Education, Skills), length, readability, use of bullet points>,
  "skillsScore": <Skills relevance score (0-100), focusing on matching technical and soft skills to job context, proficiency indicators>,
  "analysisSummary": "<A concise (2-3 sentence) summary of the resume's main strengths and weaknesses regarding the target job>",
  "toneDetails": {
    "checks": ["<Positive feedback on tone, e.g., 'Uses active voice effectively'>", "..."],
    "warnings": ["<Specific, actionable feedback on tone, e.g., 'Reduce passive voice in experience section'>", "..."]
  },
  "contentDetails": {
    "checks": ["<Positive feedback on content, e.g., 'Includes quantified results (e.g., improved performance by 40%)'>", "..."],
    "warnings": ["<Specific, actionable feedback on content, e.g., 'Quantify impact of leading the team (e.g., delivered X projects ahead of schedule)'>", "..."]
  },
  "structureDetails": {
    "checks": ["<Positive feedback on structure, e.g., 'Clear separation of sections (Experience, Education, Skills)'>", "..."],
    "warnings": ["<Specific, actionable feedback on structure, e.g., 'Consider adding a brief professional summary section'>", "..."]
  },
  "skillsDetails": {
    "checks": ["<Positive feedback on skills, e.g., 'Lists key required skills like React and Node.js'>", "..."],
    "warnings": ["<Specific, actionable feedback on skills, e.g., 'Add specific cloud platform experience (AWS/Azure/GCP) mentioned in job description'>", "..."]
  },
  "keywordAnalysis": {
     "matchedKeywords": ["<List of important keywords from job context found in resume>", "..."],
     "missingKeywords": ["<List of important keywords from job context NOT found in resume>", "..."]
  },
  "actionableRecommendations": [
     "<Concrete suggestion 1, e.g., 'Rephrase bullet point X under Tech Company using the STAR method'>",
     "<Concrete suggestion 2, e.g., 'Incorporate keywords like 'microservices' and 'agile development' into your experience descriptions'>",
     "<Concrete suggestion 3, e.g., 'Ensure contact information includes a LinkedIn profile URL'>"
     // Up to 5 specific recommendations
  ]
}
`;
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
          console.log("Sending prompt to Gemini...");
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const analysisText = response.text();
          console.log("Received response from Gemini.");

          analysis = parseGeminiJson(analysisText); // Use robust parser

          // Validate Gemini analysis result structure
          if (!analysis || typeof analysis.score !== 'number' || !analysis.toneDetails) {
              console.error("Gemini response parsing yielded invalid structure:", analysis);
              throw new Error("AI analysis response was incomplete or malformed."); // Trigger fallback
          }

          analysisMethod = 'gemini'; // Mark as successful Gemini analysis
          console.log(`Gemini AI analysis successful. Overall Score: ${analysis?.score}, ATS Score: ${analysis?.atsScore}`);

      } catch (geminiError: any) {
        console.warn(`Gemini AI analysis failed: ${geminiError.message}. Falling back to rule-based analyzer.`);
        // Analysis remains null, will proceed to fallback
      }
    } else {
        console.log("Gemini AI not available (no API key). Proceeding directly to rule-based analyzer.");
    }

    // 8. Fallback to Rule-Based Analyzer (if Gemini failed or wasn't available)
    if (analysisMethod !== 'gemini') {
      try {
        console.log('Running rule-based ATS analyzer as primary/fallback method...');
        // Use the already run preliminary analysis if available to avoid duplicate work
        analysis = preliminaryAnalysis && preliminaryAnalysis.score ? preliminaryAnalysis : analyzeResumeWithFallback(resumeText, jobRole, jobDescription);
        
        // Basic validation of the fallback result
        if (!analysis || typeof analysis.score !== 'number') {
             throw new Error("Rule-based fallback analyzer returned invalid structure.");
        }
        analysisMethod = 'free'; // Mark as free/fallback analysis
        console.log(`Rule-based analysis completed. Overall Score: ${analysis.score}, ATS Score: ${analysis.atsScore}`);
      } catch (fallbackError: any) {
          console.error("Critical Error: Rule-based fallback analyzer also failed:", fallbackError.message);
          // If even the basic fallback fails, we must return an error
          throw new Error("All analysis methods failed. Unable to process the resume.");
      }
    }

    // --- NEW: Call Python API for In-Depth Analysis ---
    // The external Python depth analysis is disabled by default. To re-enable,
    // set the environment variable ENABLE_PYTHON_ANALYSIS=true in your Next.js environment.
    if (!ENABLE_PYTHON_ANALYSIS) {
        console.info('Python depth analysis is disabled (ENABLE_PYTHON_ANALYSIS not set to true). Skipping external call.');
        depthAnalysis = {
            // warning: 'Python depth analysis disabled in Next.js. To enable, set ENABLE_PYTHON_ANALYSIS=true in env.',
            skill_proficiency: [],
            inferred_soft_skills: []
        };
    } else {
        if (resumeText && skillsFromRuleBased.length > 0) { 
            try {
                console.log(`Calling Python depth analysis API at ${PYTHON_API_URL}...`);
                console.log(`Sending ${skillsFromRuleBased.length} skills for proficiency analysis`);
                
                const depthResponse = await fetch(PYTHON_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        resume_text: resumeText,
                        skills_list: skillsFromRuleBased // Send the extracted skills
                    }),
                });

                if (!depthResponse.ok) {
                    const errorBody = await depthResponse.text();
                    console.error(`Python API error (${depthResponse.status}): ${errorBody}`);
                    // Don't throw error, just log it, analysis can proceed without depth info
                    depthAnalysis = { 
                        error: `Python API failed with status ${depthResponse.status}`,
                        skill_proficiency: [],
                        inferred_soft_skills: []
                    };
                } else {
                    const depthData = await depthResponse.json();
                    if (depthData.success) {
                        depthAnalysis = {
                            skill_proficiency: depthData.skill_proficiency || [],
                            inferred_soft_skills: depthData.inferred_soft_skills || [],
                        };
                        console.log(`Successfully received depth analysis: ${depthData.skill_proficiency?.length || 0} skills analyzed, ${depthData.inferred_soft_skills?.length || 0} soft skills inferred`);
                    } else {
                        console.error("Python API returned success=false:", depthData.error);
                        depthAnalysis = { 
                            error: depthData.error || "Python API reported an error.",
                            skill_proficiency: [],
                            inferred_soft_skills: []
                        };
                    }
                }
            } catch (fetchError: any) {
                console.error(`Failed to fetch from Python API: ${fetchError.message}`);
                depthAnalysis = { 
                    error: `Network error calling Python API: ${fetchError.message}`,
                    skill_proficiency: [],
                    inferred_soft_skills: []
                };
                 // Don't throw, proceed without depth info
            }
        } else {
             console.warn("Skipping depth analysis call: No resume text or no skills extracted.");
             depthAnalysis = { 
                 warning: "Skipped: No text or skills for depth analysis.",
                 skill_proficiency: [],
                 inferred_soft_skills: []
             };
        }
    }
    // --- END PYTHON API INTEGRATION ---

    // 9. Return Successful Response (using the result from either Gemini or fallback + depth analysis)
    console.log(`Analysis completed using method: ${analysisMethod}`);
    return NextResponse.json({
      success: true,
      // Provide default empty structures if fields are missing from analysis result
      analysis: {
        score: analysis.score ?? 0,
        atsScore: analysis.atsScore ?? 0,
        toneScore: analysis.toneScore ?? 0,
        contentScore: analysis.contentScore ?? 0,
        structureScore: analysis.structureScore ?? 0,
        skillsScore: analysis.skillsScore ?? 0,
        analysisSummary: analysis.analysisSummary ?? '',
        toneDetails: analysis.toneDetails ?? { checks: [], warnings: [] },
        contentDetails: analysis.contentDetails ?? { checks: [], warnings: [] },
        structureDetails: analysis.structureDetails ?? { checks: [], warnings: [] },
        skillsDetails: analysis.skillsDetails ?? { checks: [], warnings: [] },
        keywordAnalysis: analysis.keywordAnalysis ?? { matchedKeywords: [], missingKeywords: [] },
        actionableRecommendations: analysis.actionableRecommendations ?? [],
        // NEW: Add depth analysis results
        depth_analysis: depthAnalysis,
      },
      analysisMethod: analysisMethod,
    }, { status: 200 });

  } catch (error: any) {
    // 10. Catch-All Error Handler
    console.error(`[${new Date().toISOString()}] Unhandled ATS analysis error:`, error.message);
    if (error.stack) console.error('Error Stack:', error.stack);
    // Ensure analysisMethod reflects the state if an error occurred before completion
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected internal server error occurred during analysis. Please try again later.', 
        analysisMethod: analysisMethod === 'unknown' ? 'failed_before_attempt' : analysisMethod 
      },
      { status: 500 }
    );
  }
}