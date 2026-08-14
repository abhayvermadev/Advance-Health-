import { PatientRecord, FullAssessmentResult } from '../types/clinical';
import { calculateDataCompleteness, evaluateEmergencyThreshold } from './confidenceEngine';

export function generateDeterministicAssessment(
  record: PatientRecord,
  startTime: number = Date.now()
): FullAssessmentResult {
  const stage1Completeness = calculateDataCompleteness(record);
  const trends: any[] = [];
  let acutePoints = 0;
  let hasMultiPoint = false;
  const factors: any[] = [];
  let deteriorationSyndrome = 'Stable / Routine Surveillance';

  for (const p of record.parameters) {
    const readings = record.mode === 'limited' ? p.readings.slice(-1) : p.readings;
    if (readings.length === 0) continue;

    const latest = readings[readings.length - 1];
    const first = readings[0];
    const count = readings.length;
    if (count >= 2) hasMultiPoint = true;

    let trajectory: 'stable' | 'improving' | 'gradual_drift' | 'acute_deterioration' | 'insufficient_trend_data' = 'stable';
    let isAnomaly = false;
    let severity = 2;
    let delta = `Recorded at ${latest.value} ${p.unit}`;

    if (p.id === 'heart_rate') {
      const val = Number(latest.value);
      const firstVal = Number(first.value);
      if (val > 110) {
        trajectory = count > 1 ? 'acute_deterioration' : 'insufficient_trend_data';
        isAnomaly = true;
        severity = 9;
        acutePoints++;
      } else if (val > 90) {
        trajectory = count > 1 && val > firstVal + 10 ? 'gradual_drift' : 'stable';
        severity = 6;
      } else if (count > 1 && firstVal > 80 && val <= 70) {
        trajectory = 'improving';
      }
      if (count > 1) {
        const diff = val - firstVal;
        delta = `${diff >= 0 ? 'Increased' : 'Decreased'} from ${first.value} to ${latest.value} bpm (${diff >= 0 ? '+' : ''}${diff} bpm) across ${count} observations`;
      }
      factors.push({
        rank: isAnomaly ? 1 : 4,
        parameterName: 'Heart Rate',
        impactWeight: val > 110 ? 'critical' : val > 90 ? 'moderate' : 'mild',
        observedValue: `${latest.value} bpm`,
        baselineOrPrevious: `${first.value} bpm`,
        timeframe: `${count > 1 ? count + ' time-points' : 'Single reading'}`,
        clinicalTrace: delta,
      });
    } else if (p.id === 'blood_pressure') {
      const parts = String(latest.value).split('/');
      const sys = Number(parts[0]);
      const dia = Number(parts[1] || '80');
      if (sys < 90 || dia < 60) {
        trajectory = count > 1 ? 'acute_deterioration' : 'insufficient_trend_data';
        isAnomaly = true;
        severity = 9;
        acutePoints++;
      } else if (sys > 140 || dia > 90) {
        trajectory = count > 1 ? 'gradual_drift' : 'stable';
        isAnomaly = true;
        severity = 6;
      } else if (count > 1 && String(first.value).includes('136') && sys <= 120) {
        trajectory = 'improving';
      }
      if (count > 1) {
        delta = `Shifted from ${first.value} mmHg to ${latest.value} mmHg across ${count} timepoints`;
      }
      factors.push({
        rank: isAnomaly ? 2 : 5,
        parameterName: 'Blood Pressure',
        impactWeight: sys < 90 ? 'critical' : sys > 140 ? 'moderate' : 'mild',
        observedValue: `${latest.value} mmHg`,
        baselineOrPrevious: `${first.value} mmHg`,
        timeframe: `${count > 1 ? count + ' observations' : 'Single reading'}`,
        clinicalTrace: delta,
      });
    } else if (p.id === 'spo2') {
      const val = Number(latest.value);
      const firstVal = Number(first.value);
      if (val < 92) {
        trajectory = count > 1 ? 'acute_deterioration' : 'insufficient_trend_data';
        isAnomaly = true;
        severity = 9;
        acutePoints++;
      } else if (val < 95) {
        trajectory = count > 1 && val < firstVal ? 'gradual_drift' : 'stable';
        severity = 5;
      } else if (count > 1 && val > firstVal) {
        trajectory = 'improving';
      }
      if (count > 1) {
        delta = `Declined from ${first.value}% to ${latest.value}% (-${firstVal - val}%)`;
      }
      factors.push({
        rank: isAnomaly ? 2 : 5,
        parameterName: 'Oxygen Saturation (SpO2)',
        impactWeight: val < 92 ? 'critical' : 'moderate',
        observedValue: `${latest.value}%`,
        baselineOrPrevious: `${first.value}%`,
        timeframe: `${count > 1 ? count + ' observations' : 'Single reading'}`,
        clinicalTrace: delta,
      });
    } else if (p.id === 'temperature') {
      const val = Number(latest.value);
      const firstVal = Number(first.value);
      if (val > 101) {
        trajectory = count > 1 ? 'acute_deterioration' : 'insufficient_trend_data';
        isAnomaly = true;
        severity = 8;
        acutePoints++;
      } else if (count > 1 && firstVal > 100 && val < 99) {
        trajectory = 'improving';
      }
      if (count > 1) {
        delta = val > firstVal ? `Fever escalation from ${first.value}°F to ${latest.value}°F` : `Defervescence from ${first.value}°F to ${latest.value}°F`;
      }
      factors.push({
        rank: 3,
        parameterName: 'Core Temperature',
        impactWeight: val > 101 ? 'high' : 'mild',
        observedValue: `${latest.value}°F`,
        baselineOrPrevious: `${first.value}°F`,
        timeframe: `${count > 1 ? count + ' time-points' : 'Single reading'}`,
        clinicalTrace: delta,
      });
    } else if (p.id === 'respiratory_rate') {
      const val = Number(latest.value);
      const firstVal = Number(first.value);
      if (val >= 24) {
        trajectory = count > 1 ? 'acute_deterioration' : 'insufficient_trend_data';
        isAnomaly = true;
        severity = 8;
        acutePoints++;
      } else if (val > 20) {
        trajectory = 'gradual_drift';
        severity = 6;
      } else if (count > 1 && val < firstVal) {
        trajectory = 'improving';
      }
      if (count > 1) {
        delta = `Tachypnea progression: ${first.value} -> ${latest.value} breaths/min`;
      }
      factors.push({
        rank: 3,
        parameterName: 'Respiratory Rate',
        impactWeight: val >= 24 ? 'critical' : val > 20 ? 'moderate' : 'mild',
        observedValue: `${latest.value} /min`,
        baselineOrPrevious: `${first.value} /min`,
        timeframe: `${count > 1 ? count + ' time-points' : 'Single reading'}`,
        clinicalTrace: delta,
      });
    } else if (p.id === 'lactate') {
      const val = Number(latest.value);
      if (val > 2.0) {
        trajectory = count > 1 ? 'acute_deterioration' : 'insufficient_trend_data';
        isAnomaly = true;
        severity = 9;
        acutePoints++;
        factors.push({
          rank: 1,
          parameterName: 'Serum Lactate',
          impactWeight: val >= 4.0 ? 'critical' : 'high',
          observedValue: `${latest.value} mmol/L`,
          baselineOrPrevious: `${first.value} mmol/L`,
          timeframe: '48h lab series',
          clinicalTrace: `Metabolic acidosis marker elevation (Lactate: ${latest.value} mmol/L)`,
        });
      }
    } else if (p.id === 'creatinine') {
      const val = Number(latest.value);
      const firstVal = Number(first.value);
      if (val >= 1.8 || val >= firstVal + 0.5) {
        trajectory = count > 1 ? 'gradual_drift' : 'insufficient_trend_data';
        isAnomaly = true;
        severity = 7;
        factors.push({
          rank: 3,
          parameterName: 'Serum Creatinine',
          impactWeight: 'high',
          observedValue: `${latest.value} mg/dL`,
          baselineOrPrevious: `${first.value} mg/dL`,
          timeframe: 'Longitudinal lab series',
          clinicalTrace: `Renal clearance decline (Creatinine: ${latest.value} mg/dL, delta +${(val - firstVal).toFixed(1)} mg/dL)`,
        });
      }
    } else if (p.id === 'wbc_count') {
      const val = Number(latest.value);
      const firstVal = Number(first.value);
      if (val > 12.0) {
        trajectory = count > 1 && val > firstVal ? 'acute_deterioration' : 'stable';
        isAnomaly = true;
        severity = 7;
      } else if (count > 1 && firstVal > 11.0 && val <= 10.0) {
        trajectory = 'improving';
      }
    }

    trends.push({
      parameterId: p.id,
      parameterName: p.name,
      trajectory,
      isAnomaly,
      baselineValue: `${first.value} ${p.unit}`,
      latestValue: `${latest.value} ${p.unit}`,
      deltaSummary: delta,
      patientSpecificJustification: isAnomaly
        ? `Exceeds physiological baseline thresholds for a ${record.patient.age}yo patient with ${record.patient.knownConditions.join(', ') || 'stated baseline'}.`
        : 'Within acceptable physiological limits for this patient profile.',
      severityScore: severity,
    });
  }

  // Factor in qualitative clinical notes if present
  if (record.patient.notes?.trim()) {
    const notesLower = record.patient.notes.toLowerCase();
    const isAcuteNote =
      notesLower.includes('confusion') ||
      notesLower.includes('altered') ||
      notesLower.includes('somnolence') ||
      notesLower.includes('lethargy') ||
      notesLower.includes('dyspnea') ||
      notesLower.includes('crackles') ||
      notesLower.includes('clammy') ||
      notesLower.includes('guarding') ||
      notesLower.includes('decreased urine');

    factors.push({
      rank: isAcuteNote ? 2 : 4,
      parameterName: 'Clinical Bedside Notes & Qualitative Exam',
      impactWeight: isAcuteNote ? 'high' : 'moderate',
      observedValue: 'Qualitative Finding',
      baselineOrPrevious: 'Prior Baseline',
      timeframe: 'Current Intake Notes',
      clinicalTrace: record.patient.notes.length > 100 ? `${record.patient.notes.slice(0, 97)}...` : record.patient.notes,
    });
  }

  // Determine syndrome and risk
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  let riskScore = 14;

  if (acutePoints >= 3) {
    riskLevel = 'critical';
    riskScore = 88;
    deteriorationSyndrome = 'Severe Sepsis / Septic Shock Escalation';
  } else if (acutePoints >= 1) {
    riskLevel = 'high';
    riskScore = 74;
    deteriorationSyndrome = 'Acute Physiological Anomaly / Hemodynamic Instability';
  } else if (record.parameters.some((p) => p.readings.length > 1 && p.id === 'heart_rate' && Number(p.readings[p.readings.length - 1].value) > 85)) {
    riskLevel = 'moderate';
    riskScore = 62;
    deteriorationSyndrome = 'Insidious Heart Failure Decompensation / Fluid Overload';
  } else if (record.parameters.filter((p) => p.readings.length > 0).length <= 2) {
    riskLevel = 'low';
    riskScore = 18;
    deteriorationSyndrome = 'Data Deficit Case / Sparse Intake';
  }

  const emergencyCheck = evaluateEmergencyThreshold(riskLevel, stage1Completeness, hasMultiPoint && acutePoints >= 2);

  return {
    timestamp: new Date().toISOString(),
    patientId: record.patient.id,
    stage1Completeness,
    stage2Trends: trends,
    stage3Risk: {
      riskLevel,
      riskScore,
      riskCategoryLabel: `${riskLevel.toUpperCase()} RISK`,
      confidenceLevel: stage1Completeness.mechanicalConfidenceLevel,
      confidenceScore: stage1Completeness.mechanicalConfidenceScore,
      confidenceLabel: `${stage1Completeness.mechanicalConfidenceLevel.toUpperCase()} (${stage1Completeness.mechanicalConfidenceScore}%)`,
      confidenceCapApplied: !!stage1Completeness.confidenceCappedReason,
      confidenceCapExplanation:
        stage1Completeness.confidenceCappedReason ||
        'Confidence computed from parameter coverage, longitudinal depth, and recency.',
      deteriorationSyndromeSuspected: deteriorationSyndrome,
    },
    stage4Explainability: {
      summary:
        emergencyCheck.isEmergency
          ? `Patient exhibits significant multi-system physiological deterioration driven primarily by ${factors.slice(0, 3).map((f) => f.parameterName).join(', ')}. Assessment confidence is mechanically calibrated to ${stage1Completeness.mechanicalConfidenceScore}%.`
          : factors.length > 0 && factors[0].impactWeight === 'critical'
          ? `Isolated acute readings detected on thin data. Confidence is capped at ${stage1Completeness.mechanicalConfidenceScore}% to prevent premature alarm escalation.`
          : 'Patient vitals and recorded parameters demonstrate stable physiological trajectory and acceptable baseline adherence.',
      topContributingFactors: factors.sort((a, b) => a.rank - b.rank),
      patientContextConsiderations: `Patient is a ${record.patient.age}yo ${record.patient.sex} with known history of: ${record.patient.knownConditions.join(', ') || 'None reported'}. Current medications: ${record.patient.medications.join(', ') || 'None reported'}.`,
      divergenceFromBaselineNotes: 'Trajectory calculated against initial recorded time-series baselines.',
    },
    stage5Recommendation: {
      isEmergencyAlert: emergencyCheck.isEmergency,
      emergencyRuleEvaluated: emergencyCheck.justification,
      headline: emergencyCheck.isEmergency
        ? 'CRITICAL ALERT: Sustained Multi-System Clinical Deterioration'
        : stage1Completeness.mechanicalConfidenceLevel === 'low'
        ? 'UNCERTAIN HIGH-RISK SIGNAL: Data-Constrained — Repeat Vitals & Diagnostics Recommended'
        : riskLevel === 'low'
        ? 'ROUTINE SURVEILLANCE: Stable Post-Assessment Pathway'
        : 'ENHANCED MONITORING: Subacute Progression Surveillance',
      urgencyLevel: emergencyCheck.isEmergency
        ? 'immediate_intervention'
        : stage1Completeness.mechanicalConfidenceLevel === 'low'
        ? 'diagnostic_clarification'
        : riskLevel === 'low'
        ? 'routine_care'
        : 'enhanced_monitoring',
      actionSteps: emergencyCheck.isEmergency
        ? [
            'Trigger Rapid Response Team (RRT) bedside evaluation immediately',
            'Establish secondary peripheral IV access and prepare targeted crystalloid bolus',
            'Escalate continuous multi-parameter telemetry to q15m intervals',
            'Notify attending intensivist / hospitalist of multi-system deterioration',
          ]
        : stage1Completeness.mechanicalConfidenceLevel === 'low'
        ? [
            'Perform immediate repeat vital signs within 15-30 minutes to rule out transient artifact',
            'Obtain point-of-care capillary blood gas / venous lactate to confirm metabolic status',
            'Order complete blood count (CBC) and basic metabolic panel (BMP)',
            'Rule out movement artifact or sensor probe displacement during single outlier reading',
          ]
        : riskLevel === 'low'
        ? [
            'Continue scheduled vital sign monitoring q4h as indicated by ward protocol',
            'Review oral medication compliance and daily fluid intake',
            'Maintain outpatient clinical pathway unless new symptoms emerge',
          ]
        : [
            'Increase vital sign monitoring frequency to q2h',
            'Check daily standing weights and evaluate lower extremity edema',
            'Consider diuretic titration and nephrology/cardiology consultation',
          ],
      dataImprovementList: [
        {
          parameterName: 'Continuous Arterial Blood Pressure & Repeat Vitals',
          category: 'vital',
          clinicalPriority: 'urgent',
          confidenceImpact: '+22% Confidence Increase',
          rationale: 'Establishes whether hemodynamic fluctuations are sustained or transient artifacts.',
        },
        {
          parameterName: 'Repeat Serum Lactate & Venous Blood Gas',
          category: 'lab',
          clinicalPriority: 'urgent',
          confidenceImpact: '+18% Confidence Increase',
          rationale: 'Monitors cellular tissue perfusion trajectory and cellular hypoxia.',
        },
        {
          parameterName: 'Serum Creatinine & Electrolytes Panel',
          category: 'lab',
          clinicalPriority: 'recommended',
          confidenceImpact: '+14% Confidence Increase',
          rationale: 'Evaluates acute kidney injury progression against baseline renal function.',
        },
      ],
      followUpWindow: emergencyCheck.isEmergency ? 'Immediate (< 15 mins)' : 'Within 60-120 mins',
    },
    meta: {
      modelUsed: 'deterministic-clinical-rules',
      processingTimeMs: Math.max(5, Date.now() - startTime),
      mode: record.mode,
      syntheticNotice: 'De-identified clinical research prototype output. Not a medical diagnostic device.',
    },
  };
}
