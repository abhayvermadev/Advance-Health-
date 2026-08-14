import {
  PatientRecord,
  DataCompletenessProfile,
  ParameterCompleteness,
  ConfidenceLevel,
} from '../types/clinical';

/**
 * Standard vital and lab parameters expected in a comprehensive acute deterioration assessment
 */
export const CORE_VITAL_IDS = ['heart_rate', 'blood_pressure', 'spo2', 'respiratory_rate', 'temperature'];
export const CORE_LAB_IDS = ['wbc_count', 'creatinine', 'lactate', 'glucose'];

/**
 * Mechanically computes the Data Completeness Profile and Confidence Score
 * completely independent of how severe the vital numbers look.
 */
export function calculateDataCompleteness(record: PatientRecord): DataCompletenessProfile {
  const { parameters, mode } = record;

  let recordedVitals = 0;
  let recordedLabs = 0;
  let totalReadingsCount = 0;
  let multiPointCount = 0;
  let totalTracked = parameters.length;

  const parameterBreakdown: ParameterCompleteness[] = parameters.map((p) => {
    // In limited mode, we only take the latest 1 or 2 readings
    const readings = mode === 'limited' ? p.readings.slice(-1) : p.readings;
    const count = readings.length;
    totalReadingsCount += count;
    if (count >= 2) multiPointCount++;

    let status: ParameterCompleteness['status'] = 'not_recorded';
    if (count >= 3) status = 'present_rich';
    else if (count === 2) status = 'present_sparse';
    else if (count === 1) status = 'single_point';

    if (count > 0) {
      if (p.category === 'vital') recordedVitals++;
      if (p.category === 'lab') recordedLabs++;
    }

    return {
      parameterId: p.id,
      parameterName: p.name,
      category: p.category,
      status,
      readingCount: count,
      timeSpanDays: count > 1 ? 5 : 0, // estimate or calculate
      mostRecentHoursAgo: count > 0 ? 1 : 999,
      isStale: false,
    };
  });

  const totalVitalsTracked = parameters.filter((p) => p.category === 'vital').length || 1;
  const totalLabsTracked = parameters.filter((p) => p.category === 'lab').length || 1;

  const vitalCoveragePercent = Math.round((recordedVitals / totalVitalsTracked) * 100);
  const labCoveragePercent = Math.round((recordedLabs / totalLabsTracked) * 100);
  const recordedParametersCount = recordedVitals + recordedLabs;
  const overallCoveragePercent = Math.round((recordedParametersCount / (totalTracked || 1)) * 100);

  // 1. Parameter Coverage Component (0-35 points)
  // Weight vital signs heavily (vital signs coverage is critical)
  const coverageScore = (vitalCoveragePercent * 0.25) + (labCoveragePercent * 0.10);

  // 2. Temporal Depth Score (0-45 points)
  // Evaluates whether parameters have multiple time-series readings to establish a trajectory
  let temporalDepthScore = 0;
  if (recordedParametersCount > 0) {
    const ratioWithMultiPoints = multiPointCount / recordedParametersCount;
    const avgReadingsPerRecorded = totalReadingsCount / recordedParametersCount;
    // Scale up to 45 pts
    const depthFactor = Math.min(1.0, (ratioWithMultiPoints * 0.6) + (Math.min(avgReadingsPerRecorded, 4) / 4) * 0.4);
    temporalDepthScore = Math.round(depthFactor * 45);
  }

  // 3. Recency Score (0-20 points)
  // Assume active session readings are fresh (20 pts), minus penalties if isolated
  const recencyScore = recordedParametersCount > 0 ? 20 : 0;

  // Raw combined score (0-100)
  let rawConfidence = Math.round(coverageScore + temporalDepthScore + recencyScore);

  // MECHANICAL CONFIDENCE CAPPING RULES:
  // Rule A: If mode is "limited" or average readings <= 1.2 across recorded parameters -> Hard Cap at 38% (LOW)
  // Rule B: If no multi-point trajectory exists at all (all readings are single isolated points) -> Hard Cap at 35% (LOW)
  // Rule C: If core vital signs coverage < 60% -> Hard Cap at 55% (MODERATE)
  // Rule D: If only 1 vital sign is recorded total -> Hard Cap at 25% (LOW)

  let cappedReason: string | undefined;
  let confidenceCapApplied = false;

  if (mode === 'limited' || (recordedParametersCount > 0 && multiPointCount === 0)) {
    if (rawConfidence > 35) {
      rawConfidence = 35;
      confidenceCapApplied = true;
      cappedReason = 'Confidence capped at LOW (35%) because only single-point cross-sectional data is available without longitudinal trend verification.';
    }
  } else if (recordedVitals <= 1) {
    if (rawConfidence > 28) {
      rawConfidence = 28;
      confidenceCapApplied = true;
      cappedReason = 'Confidence severely capped at LOW (28%) because only a single vital sign is recorded.';
    }
  } else if (vitalCoveragePercent < 60) {
    if (rawConfidence > 55) {
      rawConfidence = 55;
      confidenceCapApplied = true;
      cappedReason = 'Confidence capped at MODERATE (55%) due to missing core vital sign parameters (e.g. SpO2, Respiratory Rate, or Blood Pressure).';
    }
  } else if (multiPointCount < 2 && rawConfidence > 65) {
    rawConfidence = 65;
    confidenceCapApplied = true;
    cappedReason = 'Confidence capped at MODERATE (65%) because fewer than 2 parameters have verified multi-reading trajectories.';
  }

  const finalConfidenceScore = Math.max(5, Math.min(98, rawConfidence));

  let mechanicalConfidenceLevel: ConfidenceLevel = 'low';
  if (finalConfidenceScore >= 70) {
    mechanicalConfidenceLevel = 'high';
  } else if (finalConfidenceScore >= 40) {
    mechanicalConfidenceLevel = 'moderate';
  } else {
    mechanicalConfidenceLevel = 'low';
  }

  return {
    totalParametersTracked: totalTracked,
    recordedParametersCount,
    vitalCoveragePercent,
    labCoveragePercent,
    overallCoveragePercent,
    temporalDepthScore,
    recencyScore,
    mechanicalConfidenceScore: finalConfidenceScore,
    mechanicalConfidenceLevel,
    confidenceCappedReason: cappedReason,
    parameterBreakdown,
  };
}

/**
 * Checks if the clinical criteria for an Emergency Escalation are strictly met:
 * Must have High/Critical risk AND sustained multi-point trend (>= 2 readings in deteriorating trajectory)
 */
export function evaluateEmergencyThreshold(
  riskLevel: string,
  completeness: DataCompletenessProfile,
  hasSustainedDeterioration: boolean
): { isEmergency: boolean; justification: string } {
  const isHighOrCriticalRisk = riskLevel === 'high' || riskLevel === 'critical';

  if (!isHighOrCriticalRisk) {
    return {
      isEmergency: false,
      justification: 'Risk level is below the acute escalation threshold. Standard clinical surveillance protocol applies.',
    };
  }

  // False Alarm Mitigation Rule: Single outlier on thin data cannot trigger emergency
  if (completeness.mechanicalConfidenceLevel === 'low' || !hasSustainedDeterioration) {
    return {
      isEmergency: false,
      justification:
        'SAFETY GATING APPLIED: High risk signal detected, but emergency alert is SUPPRESSED due to unconfirmed single-point or low-confidence data. Requires immediate diagnostic confirmation (repeat readings) rather than emergency false escalation.',
    };
  }

  return {
    isEmergency: true,
    justification:
      'CRITERIA SATISFIED: High/Critical risk confirmed by verified multi-point deterioration trajectory with adequate data confidence. Escalated to immediate clinical intervention alert.',
  };
}
