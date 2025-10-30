import { NextRequest, NextResponse } from 'next/server';
import { testFreeAnalyzer } from '@/lib/test-analyzer';

export async function GET() {
  try {
    console.log('Running ATS Analyzer Test...');
    
    const testResults = testFreeAnalyzer();
    
    return NextResponse.json({
      success: true,
      message: 'Free ATS Analyzer is working correctly!',
      testResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}