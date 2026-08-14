import { PatientRecord, FullAssessmentResult } from '../types/clinical';
import { generateDeterministicAssessment } from '../utils/clinicalAssessmentEngine';

export async function runClinicalAssessment(record: PatientRecord): Promise<FullAssessmentResult> {
  try {
    const response = await fetch('/api/assess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error(`Assessment API returned status ${response.status}`);
    }

    const data: FullAssessmentResult = await response.json();
    return data;
  } catch (error) {
    console.warn('Network or server error, utilizing instant deterministic assessment:', error);
    return generateDeterministicAssessment(record);
  }
}

