export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { GeneratedReport } from '@/types';
import { AuthHelpers } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { report }: { report: GeneratedReport } = await request.json();

    if (!report) {
      return NextResponse.json({ error: 'Report data is required' }, { status: 400 });
    }

    // Check user plan for lite vs full report
    const user = await AuthHelpers.getCurrentUser();
    const profile = user ? await AuthHelpers.getUserProfile(user.id) : null;
    const isLiteReport = !user || (profile?.plan === 'free' && profile?.role !== 'ADMIN');

    // Generate HTML content for the report
    const htmlContent = isLiteReport ? generateLiteReportHTML(report) : generateReportHTML(report);

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span>IdeaCompass Market Research Report</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 0 15mm;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Generated: ${new Date().toLocaleDateString()}</span>
        </div>
      `,
    });

    await browser.close();

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="IdeaCompass-${isLiteReport ? 'Lite-' : ''}Report-${report.id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateReportHTML(report: GeneratedReport): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${report.title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
          }
          .metadata {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .metadata-item {
            text-align: center;
          }
          .metadata-value {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            display: block;
          }
          .metadata-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .executive-summary {
            background: #f8fafc;
            padding: 20px;
            border-left: 4px solid #2563eb;
            border-radius: 0 8px 8px 0;
            margin-bottom: 25px;
          }
          .finding-item {
            margin-bottom: 12px;
            padding: 12px;
            background: #f9fafb;
            border-left: 3px solid #10b981;
            border-radius: 0 4px 4px 0;
          }
          .finding-number {
            display: inline-block;
            width: 24px;
            height: 24px;
            background: #2563eb;
            color: white;
            text-align: center;
            border-radius: 50%;
            font-size: 12px;
            font-weight: bold;
            line-height: 24px;
            margin-right: 10px;
          }
          .recommendation-item {
            margin-bottom: 12px;
            padding: 12px;
            background: #f0fdf4;
            border-left: 3px solid #16a34a;
            border-radius: 0 4px 4px 0;
          }
          .recommendation-icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            background: #16a34a;
            color: white;
            text-align: center;
            border-radius: 50%;
            font-size: 12px;
            font-weight: bold;
            line-height: 20px;
            margin-right: 10px;
          }
          .analysis-section {
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          .analysis-header {
            background: #f3f4f6;
            padding: 15px;
            font-weight: 600;
            color: #374151;
          }
          .analysis-content {
            padding: 20px;
          }
          .insights-list {
            margin: 15px 0;
            padding-left: 20px;
          }
          .insights-list li {
            margin-bottom: 8px;
            color: #4b5563;
          }
          .source-citation {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
            font-size: 12px;
            color: #6b7280;
          }
          .page-break {
            page-break-before: always;
          }
          @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${report.title}</div>
          <div class="subtitle">Comprehensive Market Research Analysis</div>
        </div>

        <div class="metadata">
          <div class="metadata-item">
            <span class="metadata-value">${report.metadata.totalPosts.toLocaleString()}</span>
            <span class="metadata-label">Posts Analyzed</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-value">${report.metadata.totalSubreddits}</span>
            <span class="metadata-label">Subreddits</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-value">${report.sections.length}</span>
            <span class="metadata-label">Analysis Sections</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-value">${Math.round(report.metadata.processingTime / 1000)}s</span>
            <span class="metadata-label">Processing Time</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Executive Summary</div>
          <div class="executive-summary">
            ${report.executiveSummary.split('\n').map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Key Findings</div>
          ${report.keyFindings.map((finding, index) => `
            <div class="finding-item">
              <span class="finding-number">${index + 1}</span>
              ${finding}
            </div>
          `).join('')}
        </div>

        <div class="page-break"></div>

        <div class="section">
          <div class="section-title">Detailed Analysis</div>
          ${report.sections.map(section => `
            <div class="analysis-section">
              <div class="analysis-header">${section.title}</div>
              <div class="analysis-content">
                ${section.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
                
                ${section.insights && section.insights.length > 0 ? `
                  <h4 style="margin-top: 20px; margin-bottom: 10px; color: #374151;">Key Insights:</h4>
                  <ul class="insights-list">
                    ${section.insights.map(insight => `<li>${insight}</li>`).join('')}
                  </ul>
                ` : ''}

                ${section.evidence && section.evidence.length > 0 ? `
                  <h4 style="margin-top: 20px; margin-bottom: 10px; color: #374151;">Supporting Evidence:</h4>
                  ${section.evidence.slice(0, 2).map(post => `
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px; margin-bottom: 8px;">
                      <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${post.title}</div>
                      <div style="font-size: 12px; color: #6b7280;">r/${post.subreddit} • ${post.score} points • ${post.numComments} comments</div>
                    </div>
                  `).join('')}
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="page-break"></div>

        ${report.businessPlans && report.businessPlans.length > 0 ? `
        <div class="section">
          <div class="section-title">Business Opportunities</div>
          ${report.businessPlans.map(plan => `
            <div class="analysis-section" style="margin-bottom: 30px;">
              <div class="analysis-header">${plan.title}</div>
              <div class="analysis-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                  <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border: 1px solid #3b82f6;">
                    <div style="font-weight: bold; color: #1e40af; margin-bottom: 5px;">Market Potential</div>
                    <div style="font-size: 20px; font-weight: bold; color: #1e40af;">${plan.marketPotential}/10</div>
                  </div>
                  <div style="background: #d1fae5; padding: 15px; border-radius: 8px; border: 1px solid #10b981;">
                    <div style="font-weight: bold; color: #059669; margin-bottom: 5px;">Feasibility</div>
                    <div style="font-size: 20px; font-weight: bold; color: #059669;">${plan.feasibility}/10</div>
                  </div>
                </div>
                
                <h4 style="margin-top: 20px; margin-bottom: 10px; color: #374151;">Core Problem:</h4>
                <p style="color: #6b7280; margin-bottom: 15px;">${plan.coreProblem}</p>
                
                <h4 style="margin-top: 20px; margin-bottom: 10px; color: #374151;">Proposed Solution:</h4>
                <p style="color: #6b7280; margin-bottom: 15px;">${plan.proposedSolution}</p>
                
                <h4 style="margin-top: 20px; margin-bottom: 10px; color: #374151;">Target Audience:</h4>
                <p style="color: #6b7280; margin-bottom: 15px;">${plan.targetAudience}</p>
                
                <h4 style="margin-top: 20px; margin-bottom: 10px; color: #374151;">Key Features:</h4>
                <ul style="color: #6b7280; margin-bottom: 15px; padding-left: 20px;">
                  ${plan.keyFeatures.map(feature => `<li style="margin-bottom: 5px;">${feature}</li>`).join('')}
                </ul>
                
                <h4 style="margin-top: 20px; margin-bottom: 10px; color: #374151;">Monetization Strategy:</h4>
                <p style="color: #6b7280; margin-bottom: 15px;">${plan.monetization}</p>
                
                <h4 style="margin-top: 20px; margin-bottom: 10px; color: #374151;">Action Plan:</h4>
                <p style="color: #6b7280; margin-bottom: 15px;">${plan.actionPlan}</p>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="page-break"></div>
        ` : ''}

        <div class="section">
          <div class="section-title">Strategic Recommendations</div>
          ${report.recommendations.map((rec, index) => `
            <div class="recommendation-item">
              <span class="recommendation-icon">✓</span>
              ${rec}
            </div>
          `).join('')}
        </div>

        <div class="source-citation">
          <h4 style="margin-bottom: 10px; color: #374151;">Sources & Methodology</h4>
          <ul style="margin: 0; padding-left: 15px;">
            ${report.sourceCitation.map(citation => `<li style="margin-bottom: 4px;">${citation}</li>`).join('')}
          </ul>
        </div>
      </body>
    </html>
  `;
}

function generateLiteReportHTML(report: GeneratedReport): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${report.title} - Lite Version</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
          }
          .lite-badge {
            background: #fbbf24;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
          }
          .metadata {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .metadata-item {
            text-align: center;
          }
          .metadata-value {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            display: block;
          }
          .metadata-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .executive-summary {
            background: #f8fafc;
            padding: 20px;
            border-left: 4px solid #2563eb;
            border-radius: 0 8px 8px 0;
            margin-bottom: 25px;
          }
          .finding-item {
            margin-bottom: 12px;
            padding: 12px;
            background: #f9fafb;
            border-left: 3px solid #10b981;
            border-radius: 0 4px 4px 0;
          }
          .finding-number {
            display: inline-block;
            width: 24px;
            height: 24px;
            background: #2563eb;
            color: white;
            text-align: center;
            border-radius: 50%;
            font-size: 12px;
            font-weight: bold;
            line-height: 24px;
            margin-right: 10px;
          }
          .business-plan-item {
            margin-bottom: 15px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .business-plan-title {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .score-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .score-item {
            text-align: center;
            padding: 8px;
            border-radius: 4px;
          }
          .market-score {
            background: #dbeafe;
            color: #1e40af;
          }
          .feasibility-score {
            background: #d1fae5;
            color: #059669;
          }
          .upgrade-notice {
            background: #fef3c7;
            border: 2px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-top: 30px;
          }
          .upgrade-notice h4 {
            color: #92400e;
            margin-bottom: 10px;
          }
          .upgrade-notice p {
            color: #b45309;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${report.title}<span class="lite-badge">LITE VERSION</span></div>
          <div class="subtitle">Basic Market Research Summary</div>
        </div>

        <div class="metadata">
          <div class="metadata-item">
            <span class="metadata-value">${report.metadata.totalPosts.toLocaleString()}</span>
            <span class="metadata-label">Posts Analyzed</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-value">${report.metadata.totalSubreddits}</span>
            <span class="metadata-label">Subreddits</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Executive Summary</div>
          <div class="executive-summary">
            ${report.executiveSummary.split('\n').map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Key Findings</div>
          ${report.keyFindings.map((finding, index) => `
            <div class="finding-item">
              <span class="finding-number">${index + 1}</span>
              ${finding}
            </div>
          `).join('')}
        </div>

        ${report.businessPlans && report.businessPlans.length > 0 ? `
        <div class="section">
          <div class="section-title">Business Opportunities (Summary)</div>
          ${report.businessPlans.map(plan => `
            <div class="business-plan-item">
              <div class="business-plan-title">${plan.title}</div>
              <div class="score-grid">
                <div class="score-item market-score">
                  <strong>Market: ${plan.marketPotential}/10</strong>
                </div>
                <div class="score-item feasibility-score">
                  <strong>Feasibility: ${plan.feasibility}/10</strong>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="upgrade-notice">
          <h4>🚀 Upgrade to Pro or Premium for the Full Report</h4>
          <p>This lite version includes only the executive summary, key findings, and basic business opportunity scores. Upgrade to access:</p>
          <ul style="text-align: left; max-width: 500px; margin: 0 auto; color: #b45309;">
            <li>Detailed business plans with market analysis</li>
            <li>Monetization strategies and action plans</li>
            <li>Comprehensive market research sections</li>
            <li>Strategic recommendations</li>
            <li>Full supporting evidence and citations</li>
          </ul>
          <p style="margin-top: 15px; font-weight: bold;">Visit our pricing page to learn more about upgrading!</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          Generated by IdeaCompass • ${new Date().toLocaleDateString()}
        </div>
      </body>
    </html>
  `;
}