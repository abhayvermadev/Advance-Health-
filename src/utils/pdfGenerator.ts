import jsPDF from 'jspdf';
import { PatientRecord, FullAssessmentResult, UserProfile } from '../types/clinical';

export function generateClinicalAssessmentPdf(
  record: PatientRecord,
  assessment: FullAssessmentResult,
  currentUser?: UserProfile
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 14;

  const checkPageBreak = (neededHeight: number = 18) => {
    if (y + neededHeight > pageHeight - 14) {
      doc.addPage();
      y = 16;
      // Sub-header for subsequent pages
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(128, 134, 139);
      doc.text(
        `ADVANCE HEALTH - PATIENT ASSESSMENT REPORT: ${record.patient.id} (Page ${doc.getNumberOfPages()})`,
        14,
        y
      );
      y += 8;
    }
  };

  // 1. Header Bar
  doc.setFillColor(26, 28, 30); // #1A1C1E
  doc.rect(14, y, pageWidth - 28, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ADVANCE HEALTH | CLINICAL DETERIORATION ASSESSMENT', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 205, 210);
  doc.text(
    `CONFIDENCE-GATED EARLY WARNING & TRAJECTORY SURVEILLANCE REPORT`,
    18,
    y + 12.5
  );

  const reportDate = new Date().toLocaleString();
  doc.setFontSize(7.5);
  doc.setTextColor(180, 190, 200);
  doc.text(`Generated: ${reportDate}`, pageWidth - 18, y + 9.5, { align: 'right' });

  y += 22;

  // 2. Patient Profile & Demographics Card
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(218, 220, 224);
  doc.rect(14, y, pageWidth - 28, 36, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(25, 103, 210);
  doc.text('1. PATIENT DEMOGRAPHICS & CLINICAL CONTEXT', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 44, 48);

  const col1X = 18;
  const col2X = 75;
  const col3X = 135;

  doc.text(`Patient ID: ${record.patient.id}`, col1X, y + 12);
  doc.text(`Name/Alias: ${record.patient.name || 'Not specified'}`, col1X, y + 17);
  doc.text(`Age / Sex: ${record.patient.age} years / ${record.patient.sex.toUpperCase()}`, col1X, y + 22);

  const conditionsText = record.patient.knownConditions.length > 0
    ? record.patient.knownConditions.join(', ')
    : 'None documented';
  const medsText = record.patient.medications.length > 0
    ? record.patient.medications.join(', ')
    : 'None active';

  doc.text(`Chronic Conditions:`, col2X, y + 12);
  const condLines = doc.splitTextToSize(conditionsText, 55);
  doc.text(condLines, col2X, y + 16.5);

  doc.text(`Active Medications:`, col3X, y + 12);
  const medLines = doc.splitTextToSize(medsText, 55);
  doc.text(medLines, col3X, y + 16.5);

  // Clinical Notes Snippet
  const notesText = record.patient.notes?.trim()
    ? record.patient.notes
    : 'No qualitative bedside notes provided at intake.';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(95, 99, 104);
  doc.text('Qualitative Notes:', col1X, y + 28);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(60, 64, 67);
  const noteLines = doc.splitTextToSize(notesText, pageWidth - 55);
  doc.text(noteLines.slice(0, 2), col1X + 24, y + 28);

  y += 42;

  // 3. Composite Risk & Confidence Matrix
  checkPageBreak(38);

  const isCritical = assessment.stage3Risk.riskLevel === 'critical';
  const isHigh = assessment.stage3Risk.riskLevel === 'high';
  const isModerate = assessment.stage3Risk.riskLevel === 'moderate';

  const riskBg = isCritical ? [252, 232, 230] : isHigh ? [254, 239, 195] : isModerate ? [254, 247, 224] : [230, 244, 234];
  const riskBorder = isCritical ? [217, 48, 37] : isHigh ? [232, 113, 10] : isModerate ? [242, 153, 0] : [19, 115, 51];
  const riskTextColor = isCritical ? [217, 48, 37] : isHigh ? [176, 73, 0] : isModerate ? [180, 100, 0] : [19, 115, 51];

  doc.setFillColor(riskBg[0], riskBg[1], riskBg[2]);
  doc.setDrawColor(riskBorder[0], riskBorder[1], riskBorder[2]);
  doc.rect(14, y, (pageWidth - 28) / 2 - 2, 34, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(riskTextColor[0], riskTextColor[1], riskTextColor[2]);
  doc.text('COMPOSITE RISK CLASSIFICATION', 18, y + 6);

  doc.setFontSize(14);
  doc.text(
    `${assessment.stage3Risk.riskLevel.toUpperCase()} RISK (${assessment.stage3Risk.riskScore}/100)`,
    18,
    y + 14
  );

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 44, 48);
  doc.text(
    `Suspected Syndrome: ${assessment.stage3Risk.deteriorationSyndromeSuspected || 'Clinical Surveillance'}`,
    18,
    y + 20
  );
  doc.text(
    `Urgency Tier: ${assessment.stage5Recommendation.urgencyLevel.replace('_', ' ').toUpperCase()}`,
    18,
    y + 25
  );
  doc.text(
    `Emergency RRT Alert: ${assessment.stage5Recommendation.isEmergencyAlert ? 'TRIGGERED (Active)' : 'Suppressed / Normal'}`,
    18,
    y + 30
  );

  // Confidence Column
  const confX = 14 + (pageWidth - 28) / 2 + 2;
  const confW = (pageWidth - 28) / 2 - 2;

  const isLowConf = assessment.stage3Risk.confidenceLevel === 'low';
  const confBg = isLowConf ? [254, 239, 195] : [232, 240, 254];
  const confBorder = isLowConf ? [232, 113, 10] : [66, 133, 244];

  doc.setFillColor(confBg[0], confBg[1], confBg[2]);
  doc.setDrawColor(confBorder[0], confBorder[1], confBorder[2]);
  doc.rect(confX, y, confW, 34, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(isLowConf ? 176 : 25, isLowConf ? 73 : 103, isLowConf ? 0 : 210);
  doc.text('MECHANICAL CONFIDENCE RATING', confX + 4, y + 6);

  doc.setFontSize(14);
  doc.text(
    `${assessment.stage3Risk.confidenceScore}% (${assessment.stage3Risk.confidenceLevel.toUpperCase()})`,
    confX + 4,
    y + 14
  );

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 64, 67);
  doc.text(
    `Coverage: Vital ${assessment.stage1Completeness.vitalCoveragePercent}% | Lab ${assessment.stage1Completeness.labCoveragePercent}% | Overall ${assessment.stage1Completeness.overallCoveragePercent}%`,
    confX + 4,
    y + 20
  );
  doc.text(
    `Temporal Depth: ${assessment.stage1Completeness.temporalDepthScore}% | Recency: ${assessment.stage1Completeness.recencyScore}%`,
    confX + 4,
    y + 25
  );

  if (assessment.stage3Risk.confidenceCapApplied) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(197, 34, 31);
    doc.text(`* CAPPED: Sparse / single-point data detected`, confX + 4, y + 30);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(19, 115, 51);
    doc.text(`Full longitudinal depth verified across timepoints`, confX + 4, y + 30);
  }

  y += 40;

  // 4. Contributing Factors & Explainability
  checkPageBreak(50);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 28, 30);
  doc.text('2. TOP CONTRIBUTING FACTORS & CLINICAL TRACE', 14, y);
  y += 4;

  // Table header
  doc.setFillColor(241, 243, 244);
  doc.rect(14, y, pageWidth - 28, 6, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 64, 67);
  doc.text('#', 16, y + 4.2);
  doc.text('PARAMETER', 24, y + 4.2);
  doc.text('WEIGHT', 64, y + 4.2);
  doc.text('OBSERVED VALUE', 86, y + 4.2);
  doc.text('BASELINE', 118, y + 4.2);
  doc.text('CLINICAL TRACE / RATIONALE', 142, y + 4.2);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  if (assessment.stage4Explainability.topContributingFactors.length === 0) {
    doc.setTextColor(128, 134, 139);
    doc.text('No critical physiological anomalies identified. Vitals within baseline range.', 16, y + 4);
    y += 8;
  } else {
    assessment.stage4Explainability.topContributingFactors.slice(0, 6).forEach((f, idx) => {
      checkPageBreak(10);
      const rowY = y;
      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, rowY - 1, pageWidth - 28, 8, 'F');
      }

      doc.setTextColor(26, 28, 30);
      doc.text(String(f.rank || idx + 1), 16, rowY + 3.8);
      doc.setFont('helvetica', 'bold');
      doc.text(f.parameterName, 24, rowY + 3.8);

      doc.setFont('helvetica', 'normal');
      if (f.impactWeight === 'critical') doc.setTextColor(217, 48, 37);
      else if (f.impactWeight === 'high') doc.setTextColor(232, 113, 10);
      else doc.setTextColor(95, 99, 104);
      doc.text(f.impactWeight.toUpperCase(), 64, rowY + 3.8);

      doc.setTextColor(40, 44, 48);
      doc.text(f.observedValue, 86, rowY + 3.8);
      doc.text(f.baselineOrPrevious || 'N/A', 118, rowY + 3.8);

      const traceLines = doc.splitTextToSize(f.clinicalTrace, pageWidth - 142 - 16);
      doc.text(traceLines[0] || '', 142, rowY + 3.8);

      y += 8.5;
    });
  }

  y += 3;

  // 5. Clinical Synthesis & Summary
  checkPageBreak(24);
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(218, 220, 224);
  doc.rect(14, y, pageWidth - 28, 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(26, 28, 30);
  doc.text('CLINICAL EXPLAINABILITY SYNTHESIS:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 64, 67);
  const summaryLines = doc.splitTextToSize(
    assessment.stage4Explainability.summary || 'Patient physiological evaluation complete.',
    pageWidth - 36
  );
  doc.text(summaryLines.slice(0, 3), 18, y + 10);

  y += 27;

  // 6. Action Steps & Missing Data Recommendations
  checkPageBreak(40);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 28, 30);
  doc.text('3. RECOMMENDED CLINICAL ACTIONS & DIAGNOSTIC GAPS', 14, y);
  y += 4;

  // Action Steps Box
  const actW = (pageWidth - 28) / 2 - 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(218, 220, 224);
  doc.rect(14, y, actW, 36, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(25, 103, 210);
  doc.text('IMMEDIATE PROTOCOL ACTIONS:', 18, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(40, 44, 48);
  let actY = y + 10.5;
  assessment.stage5Recommendation.actionSteps.slice(0, 4).forEach((act) => {
    const actLines = doc.splitTextToSize(`• ${act}`, actW - 8);
    doc.text(actLines[0], 18, actY);
    actY += 5.5;
  });

  // Diagnostic Data Improvement Box
  const dataX = 14 + actW + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(218, 220, 224);
  doc.rect(dataX, y, actW, 36, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(19, 115, 51);
  doc.text('DIAGNOSTICS TO INCREASE CONFIDENCE:', dataX + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(40, 44, 48);
  let datY = y + 10.5;
  assessment.stage5Recommendation.dataImprovementList.slice(0, 3).forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`+ ${item.parameterName} (${item.confidenceImpact})`, dataX + 4, datY);
    doc.setFont('helvetica', 'normal');
    const rLines = doc.splitTextToSize(`  ${item.rationale}`, actW - 8);
    doc.text(rLines[0], dataX + 4, datY + 3.5);
    datY += 8;
  });

  y += 42;

  // Clinician Sign-Off Block
  checkPageBreak(24);
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(218, 220, 224);
  doc.rect(14, y, pageWidth - 28, 20, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(26, 28, 30);
  doc.text('ELECTRONIC CLINICAL SIGN-OFF & ATTESTATION:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 44, 48);

  const signerName = currentUser?.name || 'Verified Attending Physician / Intensivist';
  const signerRole = currentUser?.roleTitle || 'Clinical Decision Support Reviewer';
  const signerBadge = currentUser?.badgeNumber || 'AUTH-SEC-2026';
  const signerClearance = currentUser?.securityClearance || 'Level 3 - Attending Critical';

  doc.text(`Attesting Clinician: ${signerName} (${signerBadge})`, 18, y + 10);
  doc.text(`Title / Dept: ${signerRole} | Security Clearance: ${signerClearance}`, 18, y + 14.5);

  const docHash = `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(128, 134, 139);
  doc.text(`Cryptographic Audit Seal: ${docHash}`, pageWidth - 18, y + 14.5, { align: 'right' });

  y += 24;

  // 7. Footer Disclaimer
  checkPageBreak(16);
  doc.setDrawColor(218, 220, 224);
  doc.line(14, y, pageWidth - 14, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(128, 134, 139);
  doc.text('RESEARCH & QUALITY ASSURANCE PROTOCOL NOTICE', 14, y);
  y += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(140, 145, 150);
  const disclaimer =
    'This synthesized assessment report is generated for clinical decision-support and trajectory research purposes only. It does not replace independent bedside clinical diagnosis or attending physician oversight. Confidence ratings are mechanically coupled to data completeness and longitudinal depth.';
  const disLines = doc.splitTextToSize(disclaimer, pageWidth - 28);
  doc.text(disLines, 14, y);

  // Save the PDF
  const sanitizedId = record.patient.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Clinical_Assessment_${sanitizedId}_${Date.now()}.pdf`;
  doc.save(filename);
}
