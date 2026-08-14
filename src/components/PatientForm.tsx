import React, { useState } from 'react';
import {
  User,
  Activity,
  FlaskConical,
  Heart,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Clock,
  Pill,
  FileText,
  Footprints,
  Moon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PatientRecord, ParameterSeries, VitalLabReading } from '../types/clinical';

interface PatientFormProps {
  record: PatientRecord;
  onChange: (updatedRecord: PatientRecord) => void;
  isLimitedMode: boolean;
  onRunAssessment: () => void;
  isLoading: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  record,
  onChange,
  isLimitedMode,
  onRunAssessment,
  isLoading,
}) => {
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [showLifestyle, setShowLifestyle] = useState(true);

  // Update demographic fields
  const handleDemographicChange = (field: string, value: any) => {
    onChange({
      ...record,
      patient: {
        ...record.patient,
        [field]: value,
      },
    });
  };

  // Add condition chip
  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    onChange({
      ...record,
      patient: {
        ...record.patient,
        knownConditions: [...record.patient.knownConditions, newCondition.trim()],
      },
    });
    setNewCondition('');
  };

  // Remove condition chip
  const handleRemoveCondition = (index: number) => {
    const updated = [...record.patient.knownConditions];
    updated.splice(index, 1);
    onChange({
      ...record,
      patient: {
        ...record.patient,
        knownConditions: updated,
      },
    });
  };

  // Add medication chip
  const handleAddMedication = () => {
    if (!newMedication.trim()) return;
    onChange({
      ...record,
      patient: {
        ...record.patient,
        medications: [...record.patient.medications, newMedication.trim()],
      },
    });
    setNewMedication('');
  };

  // Remove medication chip
  const handleRemoveMedication = (index: number) => {
    const updated = [...record.patient.medications];
    updated.splice(index, 1);
    onChange({
      ...record,
      patient: {
        ...record.patient,
        medications: updated,
      },
    });
  };

  // Add new time-series reading for a parameter
  const handleAddReading = (paramId: string) => {
    const updatedParameters = record.parameters.map((p) => {
      if (p.id === paramId) {
        const count = p.readings.length;
        const newTimestamp = count === 0 ? 'Current (Day 0)' : `Time-point ${count + 1}`;
        let defaultValue: number | string = 0;
        if (p.id === 'heart_rate') defaultValue = 80;
        else if (p.id === 'blood_pressure') defaultValue = '120/80';
        else if (p.id === 'spo2') defaultValue = 98;
        else if (p.id === 'temperature') defaultValue = 98.6;
        else if (p.id === 'respiratory_rate') defaultValue = 16;
        else if (p.id === 'wbc_count') defaultValue = 7.5;
        else if (p.id === 'lactate') defaultValue = 1.2;
        else if (p.id === 'creatinine') defaultValue = 1.0;
        else if (p.id === 'glucose') defaultValue = 100;

        return {
          ...p,
          readings: [
            ...p.readings,
            {
              timestamp: newTimestamp,
              value: defaultValue,
              unit: p.unit,
            },
          ],
        };
      }
      return p;
    });

    onChange({
      ...record,
      parameters: updatedParameters,
    });
  };

  // Update specific reading value or timestamp
  const handleUpdateReading = (
    paramId: string,
    readingIndex: number,
    field: 'value' | 'timestamp',
    val: string | number
  ) => {
    const updatedParameters = record.parameters.map((p) => {
      if (p.id === paramId) {
        const updatedReadings = [...p.readings];
        updatedReadings[readingIndex] = {
          ...updatedReadings[readingIndex],
          [field]: field === 'value' && !isNaN(Number(val)) && typeof val === 'string' && val.trim() !== '' && !val.includes('/') ? Number(val) : val,
        };
        return {
          ...p,
          readings: updatedReadings,
        };
      }
      return p;
    });

    onChange({
      ...record,
      parameters: updatedParameters,
    });
  };

  // Delete a reading
  const handleDeleteReading = (paramId: string, readingIndex: number) => {
    const updatedParameters = record.parameters.map((p) => {
      if (p.id === paramId) {
        const updatedReadings = [...p.readings];
        updatedReadings.splice(readingIndex, 1);
        return {
          ...p,
          readings: updatedReadings,
        };
      }
      return p;
    });

    onChange({
      ...record,
      parameters: updatedParameters,
    });
  };

  // Clear all readings for a parameter (explicitly Not Recorded)
  const handleClearParameter = (paramId: string) => {
    const updatedParameters = record.parameters.map((p) => {
      if (p.id === paramId) {
        return {
          ...p,
          readings: [],
        };
      }
      return p;
    });

    onChange({
      ...record,
      parameters: updatedParameters,
    });
  };

  const vitalParams = record.parameters.filter((p) => p.category === 'vital');
  const labParams = record.parameters.filter((p) => p.category === 'lab');

  return (
    <div className="space-y-4">
      {/* Patient Profile Demographics Card */}
      <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E0E2E6]">
          <div className="flex items-center gap-2 text-[#1A1C1E] font-bold text-xs uppercase tracking-wider">
            <User className="w-4 h-4 text-[#1967D2]" />
            <span>Patient Baseline Profile</span>
          </div>
          <span className="text-[10px] text-[#80868B] font-mono font-medium">
            ID: {record.patient.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
              Age <span className="text-[#D93025]">* Required</span>
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={record.patient.age}
              onChange={(e) => handleDemographicChange('age', parseInt(e.target.value) || 0)}
              className="w-full bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs font-mono text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
              Biological Sex
            </label>
            <select
              value={record.patient.sex}
              onChange={(e) => handleDemographicChange('sex', e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none cursor-pointer"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other / Non-binary</option>
              <option value="unspecified">Unspecified</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
              Patient Alias / Name
            </label>
            <input
              type="text"
              value={record.patient.name || ''}
              onChange={(e) => handleDemographicChange('name', e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none"
            />
          </div>
        </div>

        {/* Known Conditions Chips */}
        <div className="mb-3">
          <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
            Known Chronic Conditions &amp; Medical History
          </label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {record.patient.knownConditions.map((cond, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-[#E8F0FE] border border-[#ADCCF9] text-[#1967D2] text-[11px] font-mono font-medium px-2 py-0.5 rounded-xs"
              >
                {cond}
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(idx)}
                  className="hover:text-[#D93025] ml-0.5 text-[#1967D2] cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
            {record.patient.knownConditions.length === 0 && (
              <span className="text-xs text-[#80868B] italic">No conditions recorded</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
              placeholder="Add condition (e.g. COPD, Heart Failure, CKD) and press Enter..."
              className="flex-1 bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCondition}
              className="bg-[#F1F3F4] hover:bg-[#E8EAED] border border-[#DADCE0] text-[#1A1C1E] text-xs px-3 py-1.5 rounded-xs font-mono font-medium cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Active Medications Chips */}
        <div className="mb-3">
          <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Pill className="w-3.5 h-3.5 text-[#5F6368]" />
            Current Active Medications
          </label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {record.patient.medications.map((med, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] text-[11px] font-mono font-medium px-2 py-0.5 rounded-xs"
              >
                {med}
                <button
                  type="button"
                  onClick={() => handleRemoveMedication(idx)}
                  className="hover:text-[#D93025] ml-0.5 text-[#137333] cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
            {record.patient.medications.length === 0 && (
              <span className="text-xs text-[#80868B] italic">No medications recorded</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
              placeholder="Add medication (e.g. Carvedilol 12.5mg, Metformin) and press Enter..."
              className="flex-1 bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddMedication}
              className="bg-[#F1F3F4] hover:bg-[#E8EAED] border border-[#DADCE0] text-[#1A1C1E] text-xs px-3 py-1.5 rounded-xs font-mono font-medium cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Free-text Clinical Notes & Qualitative Observations */}
        <div className="pt-2 border-t border-[#E0E2E6]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-bold text-[#1A1C1E] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1967D2]" />
              <span>Clinical Notes &amp; Qualitative Observations</span>
            </label>
            <span className="text-[10px] font-mono text-[#80868B]">
              {record.patient.notes?.length || 0} chars
            </span>
          </div>

          <p className="text-[11px] text-[#5F6368] mb-2 leading-relaxed">
            Record bedside findings, altered mental status, physical exams, or qualitative nursing observations alongside structured time-series data.
          </p>

          {/* Quick-insert clinical tags */}
          <div className="mb-2">
            <span className="text-[10px] font-mono font-medium text-[#6D7278] mr-1.5">Quick Insert:</span>
            <div className="inline-flex flex-wrap gap-1 mt-1">
              {[
                'Altered Mental Status / Lethargy',
                'Increased Work of Breathing',
                'Decreased Urine Output',
                'Diaphoretic & Cool Extremities',
                'Poor Oral Fluid Intake',
                'Bibasilar Lung Crackles',
                'New Onset Confusion',
                'Abdominal Tenderness',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const current = record.patient.notes?.trim() || '';
                    const updated = current ? `${current} | ${tag}` : tag;
                    handleDemographicChange('notes', updated);
                  }}
                  className="text-[10px] font-mono bg-[#F1F3F4] hover:bg-[#E8F0FE] hover:text-[#1967D2] hover:border-[#ADCCF9] text-[#3C4043] border border-[#DADCE0] px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={record.patient.notes || ''}
            onChange={(e) => handleDemographicChange('notes', e.target.value)}
            placeholder="e.g. Patient presents with increasing somnolence, decreased urine output over the past 6 hours, and mottled extremities. Family notes sudden decline in baseline activity..."
            className="w-full bg-[#F8F9FA] border border-[#DADCE0] rounded-xs p-2.5 text-xs text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none font-mono leading-relaxed"
          />

          {record.patient.notes && (
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => handleDemographicChange('notes', '')}
                className="text-[10px] font-mono text-[#D93025] hover:underline cursor-pointer"
              >
                Clear Notes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Core Vital Signs Section */}
      <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E0E2E6]">
          <div className="flex items-center gap-2 text-[#1A1C1E] font-bold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4 text-[#D93025]" />
            <span>Vital Signs (Time-Series Trajectory)</span>
          </div>
          <span className="text-[10px] font-mono text-[#6D7278] bg-[#F1F3F4] px-2 py-0.5 rounded-xs">
            Optional &bull; Explicit Blank Mark
          </span>
        </div>

        {isLimitedMode && (
          <div className="mb-3 bg-[#FFF4E5] border border-[#FFD399] text-[#855B1B] rounded-xs p-2.5 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#E67E22] mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Simulated Limited-History Mode Active:</span> Only the single latest observation per parameter will be evaluated to demonstrate mechanical confidence capping.
            </div>
          </div>
        )}

        <div className="space-y-3">
          {vitalParams.map((param) => (
            <ParameterRow
              key={param.id}
              parameter={param}
              isLimitedMode={isLimitedMode}
              onAddReading={() => handleAddReading(param.id)}
              onUpdateReading={(idx, field, val) => handleUpdateReading(param.id, idx, field, val)}
              onDeleteReading={(idx) => handleDeleteReading(param.id, idx)}
              onClear={() => handleClearParameter(param.id)}
            />
          ))}
        </div>
      </div>

      {/* Laboratory Biomarkers Section */}
      <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E0E2E6]">
          <div className="flex items-center gap-2 text-[#1A1C1E] font-bold text-xs uppercase tracking-wider">
            <FlaskConical className="w-4 h-4 text-[#1967D2]" />
            <span>Laboratory Biomarkers &amp; Blood Chemistries</span>
          </div>
          <span className="text-[10px] font-mono text-[#6D7278] bg-[#F1F3F4] px-2 py-0.5 rounded-xs">
            Serial Lab Panel
          </span>
        </div>

        <div className="space-y-3">
          {labParams.map((param) => (
            <ParameterRow
              key={param.id}
              parameter={param}
              isLimitedMode={isLimitedMode}
              onAddReading={() => handleAddReading(param.id)}
              onUpdateReading={(idx, field, val) => handleUpdateReading(param.id, idx, field, val)}
              onDeleteReading={(idx) => handleDeleteReading(param.id, idx)}
              onClear={() => handleClearParameter(param.id)}
            />
          ))}
        </div>
      </div>

      {/* Lifestyle & Wearable Data Collapsible Card */}
      <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowLifestyle(!showLifestyle)}
          className="w-full flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-[#F1F3F4] text-left border-b border-[#E0E2E6] cursor-pointer"
        >
          <div className="flex items-center gap-2 text-[#1A1C1E] font-bold text-xs uppercase tracking-wider">
            <Footprints className="w-4 h-4 text-[#137333]" />
            <span>Lifestyle, Mobility &amp; Wearable Telemetry</span>
            <span className="text-[10px] font-mono text-[#6D7278] bg-white border border-[#DADCE0] px-1.5 py-0.5 rounded-xs">
              Optional Multi-Modal
            </span>
          </div>
          {showLifestyle ? (
            <ChevronUp className="w-4 h-4 text-[#5F6368]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5F6368]" />
          )}
        </button>

        {showLifestyle && (
          <div className="p-4 space-y-3 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-[#137333]" />
                  Daily Step Count Trend
                </label>
                <input
                  type="text"
                  value={record.lifestyle?.dailySteps?.join(', ') || ''}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map((s) => parseInt(s.trim()))
                      .filter((n) => !isNaN(n));
                    onChange({
                      ...record,
                      lifestyle: {
                        ...record.lifestyle,
                        dailySteps: parsed,
                      },
                    });
                  }}
                  placeholder="e.g. 4200, 2100, 350"
                  className="w-full bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs font-mono text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none"
                />
                <span className="text-[9px] text-[#80868B] font-mono mt-0.5 block">Comma-separated recent days</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-[#1967D2]" />
                  Sleep Duration (Hours)
                </label>
                <input
                  type="text"
                  value={record.lifestyle?.sleepHours?.join(', ') || ''}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map((s) => parseFloat(s.trim()))
                      .filter((n) => !isNaN(n));
                    onChange({
                      ...record,
                      lifestyle: {
                        ...record.lifestyle,
                        sleepHours: parsed,
                      },
                    });
                  }}
                  placeholder="e.g. 7.2, 5.1, 3.4"
                  className="w-full bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs font-mono text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none"
                />
                <span className="text-[9px] text-[#80868B] font-mono mt-0.5 block">Hours per night</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-[#D93025]" />
                  Resting Heart Rate Array (bpm)
                </label>
                <input
                  type="text"
                  value={record.lifestyle?.restingHeartRateTrend?.join(', ') || ''}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map((s) => parseInt(s.trim()))
                      .filter((n) => !isNaN(n));
                    onChange({
                      ...record,
                      lifestyle: {
                        ...record.lifestyle,
                        restingHeartRateTrend: parsed,
                      },
                    });
                  }}
                  placeholder="e.g. 74, 92, 114"
                  className="w-full bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs font-mono text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none"
                />
                <span className="text-[9px] text-[#80868B] font-mono mt-0.5 block">Wearable nocturnal pulse</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
                Mobility &amp; Functional Status Notes
              </label>
              <input
                type="text"
                value={record.lifestyle?.mobilityNotes || ''}
                onChange={(e) =>
                  onChange({
                    ...record,
                    lifestyle: {
                      ...record.lifestyle,
                      mobilityNotes: e.target.value,
                    },
                  })
                }
                placeholder="e.g. Bed-bound since yesterday evening, unable to transfer unassisted."
                className="w-full bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Re-run Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onRunAssessment}
          disabled={isLoading}
          className="w-full bg-[#1A1C1E] hover:bg-[#2D3135] text-white font-mono font-medium py-2.5 px-4 rounded-xs text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60 uppercase tracking-wider"
        >
          <Activity className="w-4 h-4 text-[#8AB4F8]" />
          <span>Update &amp; Re-run Clinical Deterioration Assessment</span>
        </button>
      </div>
    </div>
  );
};

// Parameter Row sub-component supporting multi-point sparse time-series
interface ParameterRowProps {
  parameter: ParameterSeries;
  isLimitedMode: boolean;
  onAddReading: () => void;
  onUpdateReading: (index: number, field: 'value' | 'timestamp', val: string | number) => void;
  onDeleteReading: (index: number) => void;
  onClear: () => void;
}

const ParameterRow: React.FC<ParameterRowProps> = ({
  parameter,
  isLimitedMode,
  onAddReading,
  onUpdateReading,
  onDeleteReading,
  onClear,
}) => {
  const displayReadings = isLimitedMode
    ? parameter.readings.slice(-1)
    : parameter.readings;

  const isBlank = displayReadings.length === 0;

  return (
    <div
      className={`p-3 rounded-xs border transition-colors ${
        isBlank
          ? 'bg-[#F8F9FA] border-dashed border-[#DADCE0]'
          : 'bg-white border-[#E0E2E6] shadow-2xs'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-[#1A1C1E]">{parameter.name}</span>
          {parameter.normalRange && (
            <span className="text-[10px] bg-[#F1F3F4] text-[#5F6368] px-1.5 py-0.5 rounded-xs font-mono">
              Ref: {parameter.normalRange.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isBlank ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#B06000] bg-[#FEF7E0] border border-[#FCE293] px-1.5 py-0.5 rounded-xs">
              <AlertCircle className="w-3 h-3 text-[#B06000]" />
              NOT RECORDED
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold text-[#1967D2] bg-[#E8F0FE] border border-[#ADCCF9] px-1.5 py-0.5 rounded-xs">
              {displayReadings.length} reading{displayReadings.length > 1 ? 's' : ''}{' '}
              {isLimitedMode && parameter.readings.length > 1 && '(Filtered)'}
            </span>
          )}

          {!isBlank && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] font-mono text-[#80868B] hover:text-[#D93025] underline cursor-pointer"
            >
              Clear
            </button>
          )}

          {!isLimitedMode && (
            <button
              type="button"
              onClick={onAddReading}
              className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#1A1C1E] border border-[#DADCE0] px-2 py-0.5 rounded-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>ADD READING</span>
            </button>
          )}
        </div>
      </div>

      {/* Reading Items */}
      {isBlank ? (
        <div className="text-xs text-[#80868B] py-1 flex items-center justify-between">
          <span className="font-mono text-[11px]">Parameter is currently unmeasured (no baseline or current observation).</span>
          <button
            type="button"
            onClick={onAddReading}
            className="text-[#1967D2] hover:text-[#174EA6] font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Initial Value
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 mt-1.5">
          {displayReadings.map((reading, rIdx) => (
            <div
              key={rIdx}
              className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-[#F8F9FA] p-1.5 rounded-xs border border-[#E0E2E6] text-xs font-mono"
            >
              <div className="flex items-center gap-1 text-[#5F6368] shrink-0 w-full sm:w-44">
                <Clock className="w-3 h-3 text-[#80868B]" />
                <input
                  type="text"
                  value={reading.timestamp}
                  disabled={isLimitedMode}
                  onChange={(e) => onUpdateReading(rIdx, 'timestamp', e.target.value)}
                  placeholder="e.g. 24h ago"
                  className="w-full bg-transparent border-0 font-mono text-[#5F6368] text-xs focus:ring-0 focus:outline-none p-0"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-[#80868B] font-mono">:</span>
                <input
                  type="text"
                  value={reading.value}
                  onChange={(e) => onUpdateReading(rIdx, 'value', e.target.value)}
                  className="bg-white border border-[#DADCE0] rounded-xs px-2 py-0.5 text-xs text-[#1A1C1E] font-bold font-mono w-28 focus:border-[#1967D2] focus:outline-none"
                />
                <span className="text-xs text-[#5F6368] font-mono">{reading.unit || parameter.unit}</span>
              </div>

              {!isLimitedMode && displayReadings.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteReading(rIdx)}
                  className="text-[#80868B] hover:text-[#D93025] p-1 rounded-xs hover:bg-[#FCE8E6] cursor-pointer"
                  title="Remove this timestamped reading"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
