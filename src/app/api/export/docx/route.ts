export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TableRow, TableCell, Table, WidthType } from 'docx';
import { GeneratedReport } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { report }: { report: GeneratedReport } = await request.json();

    if (!report) {
      return NextResponse.json({ error: 'Report data is required' }, { status: 400 });
    }

    // Generate DOCX document
    const doc = await generateReportDOCX(report);
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="IdeaCompass-Report-${report.id}.docx"`,
      },
    });

  } catch (error) {
    console.error('DOCX generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate DOCX', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function generateReportDOCX(report: GeneratedReport): Promise<Document> {
  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: report.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      text: "Comprehensive Market Research Analysis",
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      style: "Subtitle",
    })
  );

  // Metadata Table
  children.push(
    new Paragraph({
      text: "Report Overview",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  children.push(
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: "Posts Analyzed", alignment: AlignmentType.CENTER })],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: "Subreddits", alignment: AlignmentType.CENTER })],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: "Analysis Sections", alignment: AlignmentType.CENTER })],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: "Processing Time", alignment: AlignmentType.CENTER })],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: report.metadata.totalPosts.toLocaleString(), alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ text: report.metadata.totalSubreddits.toString(), alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ text: report.sections.length.toString(), alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ text: `${Math.round(report.metadata.processingTime / 1000)}s`, alignment: AlignmentType.CENTER })],
            }),
          ],
        }),
      ],
    })
  );

  children.push(new Paragraph({ text: "", spacing: { after: 400 } }));

  // Executive Summary
  children.push(
    new Paragraph({
      text: "Executive Summary",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    })
  );

  const summaryParagraphs = report.executiveSummary.split('\n').filter(p => p.trim());
  summaryParagraphs.forEach(paragraph => {
    children.push(
      new Paragraph({
        text: paragraph.trim(),
        spacing: { after: 200 },
        indent: { left: 200 },
      })
    );
  });

  // Key Findings
  children.push(
    new Paragraph({
      text: "Key Findings",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
    })
  );

  report.keyFindings.forEach((finding, index) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. `,
            bold: true,
            color: "2563EB",
          }),
          new TextRun({
            text: finding,
          }),
        ],
        spacing: { after: 150 },
        indent: { left: 200 },
      })
    );
  });

  // Page break before detailed analysis
  children.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // Detailed Analysis
  children.push(
    new Paragraph({
      text: "Detailed Analysis",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 400 },
    })
  );

  report.sections.forEach((section, sectionIndex) => {
    // Section title
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    // Section content
    const contentParagraphs = section.content.split('\n').filter(p => p.trim());
    contentParagraphs.forEach(paragraph => {
      children.push(
        new Paragraph({
          text: paragraph.trim(),
          spacing: { after: 150 },
          indent: { left: 200 },
        })
      );
    });

    // Key insights
    if (section.insights && section.insights.length > 0) {
      children.push(
        new Paragraph({
          text: "Key Insights:",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 100 },
        })
      );

      section.insights.forEach(insight => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "• ",
                bold: true,
              }),
              new TextRun({
                text: insight,
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 400 },
          })
        );
      });
    }

    // Supporting evidence
    if (section.evidence && section.evidence.length > 0) {
      children.push(
        new Paragraph({
          text: "Supporting Evidence:",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 100 },
        })
      );

      section.evidence.slice(0, 2).forEach(post => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: post.title,
                bold: true,
              }),
            ],
            spacing: { after: 50 },
            indent: { left: 400 },
          })
        );
        children.push(
          new Paragraph({
            text: `r/${post.subreddit} • ${post.score} points • ${post.numComments} comments`,
            spacing: { after: 150 },
            indent: { left: 600 },
            style: "Caption",
          })
        );
      });
    }

    // Add spacing between sections
    if (sectionIndex < report.sections.length - 1) {
      children.push(
        new Paragraph({
          text: "",
          spacing: { after: 300 },
        })
      );
    }
  });

  // Business Plans Section (if available)
  if (report.businessPlans && report.businessPlans.length > 0) {
    // Page break before business plans
    children.push(
      new Paragraph({
        text: "",
        pageBreakBefore: true,
      })
    );

    children.push(
      new Paragraph({
        text: "Business Opportunities",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 400 },
      })
    );

    report.businessPlans.forEach((plan, planIndex) => {
      // Plan title
      children.push(
        new Paragraph({
          text: plan.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );

      // Market potential and feasibility scores
      children.push(
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: "Market Potential", alignment: AlignmentType.CENTER })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Feasibility", alignment: AlignmentType.CENTER })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: `${plan.marketPotential}/10`, alignment: AlignmentType.CENTER })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: `${plan.feasibility}/10`, alignment: AlignmentType.CENTER })],
                }),
              ],
            }),
          ],
        })
      );

      children.push(new Paragraph({ text: "", spacing: { after: 200 } }));

      // Plan sections
      const planSections = [
        { title: "Core Problem", content: plan.coreProblem },
        { title: "Proposed Solution", content: plan.proposedSolution },
        { title: "Target Audience", content: plan.targetAudience },
        { title: "Monetization Strategy", content: plan.monetization },
        { title: "Action Plan", content: plan.actionPlan },
      ];

      planSections.forEach(section => {
        children.push(
          new Paragraph({
            text: section.title + ":",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 300, after: 100 },
          })
        );

        children.push(
          new Paragraph({
            text: section.content,
            spacing: { after: 200 },
            indent: { left: 200 },
          })
        );
      });

      // Key features
      children.push(
        new Paragraph({
          text: "Key Features:",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 100 },
        })
      );

      plan.keyFeatures.forEach(feature => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "• ",
                bold: true,
              }),
              new TextRun({
                text: feature,
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 400 },
          })
        );
      });

      // Add spacing between plans
      if (planIndex < report.businessPlans.length - 1) {
        children.push(
          new Paragraph({
            text: "",
            spacing: { after: 400 },
          })
        );
      }
    });
  }

  // Page break before recommendations
  children.push(
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // Strategic Recommendations
  children.push(
    new Paragraph({
      text: "Strategic Recommendations",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 },
    })
  );

  report.recommendations.forEach((recommendation, index) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "✓ ",
            color: "16A34A",
            bold: true,
          }),
          new TextRun({
            text: recommendation,
          }),
        ],
        spacing: { after: 200 },
        indent: { left: 200 },
      })
    );
  });

  // Sources & Methodology
  children.push(
    new Paragraph({
      text: "Sources & Methodology",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 600, after: 200 },
    })
  );

  report.sourceCitation.forEach(citation => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "• ",
          }),
          new TextRun({
            text: citation,
          }),
        ],
        spacing: { after: 100 },
        indent: { left: 200 },
        style: "Caption",
      })
    );
  });

  // Footer with generation info
  children.push(
    new Paragraph({
      text: "",
      spacing: { after: 400 },
    })
  );

  children.push(
    new Paragraph({
      text: `Generated by IdeaCompass on ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      style: "Caption",
    })
  );

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
    title: report.title,
    description: "Market Research Report generated by IdeaCompass",
    creator: "IdeaCompass",
    keywords: "market research, reddit analysis, business intelligence",
  });
}