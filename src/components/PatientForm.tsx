import React, { useState } from 'react';
import {
  User,
  Activity,
  FlaskConical,
  Heart,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Pill,
  FileText,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
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
  // Collapsible section states
  const [isDemographicsOpen, setIsDemographicsOpen] = useState<boolean>(false);
  const [isVitalsOpen, setIsVitalsOpen] = useState<boolean>(true);
  const [isLabsOpen, setIsLabsOpen] = useState<boolean>(true);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);

  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

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

  // Update a specific reading
  const handleReadingChange = (
    parameterId: string,
    readingIndex: number,
    value: string | number
  ) => {
    const updatedParameters = record.parameters.map((param) => {
      if (param.id === parameterId) {
        const updatedReadings = [...param.readings];
        updatedReadings[readingIndex] = {
          ...updatedReadings[readingIndex],
          value: value,
        };
        return {
          ...param,
          readings: updatedReadings,
        };
      }
      return param;
    });

    onChange({
      ...record,
      parameters: updatedParameters,
    });
  };

  // Add a new time-series observation reading
  const handleAddReading = (parameterId: string) => {
    const updatedParameters = record.parameters.map((param) => {
      if (param.id === parameterId) {
        const count = param.readings.length;
        const lastVal = count > 0 ? param.readings[count - 1].value : (param.type === 'vital' ? 80 : 1.0);
        const newTimestamp = count === 0 ? 'Current Observation' : `Repeat Follow-up (+${count * 2}h)`;

        return {
          ...param,
          readings: [
            ...param.readings,
            {
              timestamp: newTimestamp,
              value: lastVal,
              unit: param.unit,
            },
          ],
        };
      }
      return param;
    });

    onChange({
      ...record,
      parameters: updatedParameters,
    });
  };

  // Remove a reading
  const handleRemoveReading = (parameterId: string, readingIndex: number) => {
    const updatedParameters = record.parameters.map((param) => {
      if (param.id === parameterId) {
        const updatedReadings = [...param.readings];
        updatedReadings.splice(readingIndex, 1);
        return {
          ...param,
          readings: updatedReadings,
        };
      }
      return param;
    });

    onChange({
      ...record,
      parameters: updatedParameters,
    });
  };

  // Clear all readings for a parameter (simulate missing sensor)
  const handleClearParameter = (parameterId: string) => {
    const updatedParameters = record.parameters.map((param) => {
      if (param.id === parameterId) {
        return {
          ...param,
          readings: [],
        };
      }
      return param;
    });

    onChange({
      ...record,
      parameters: updatedParameters,
    });
  };

  // Collapse / Expand All toggle
  const allCollapsed = !isDemographicsOpen && !isVitalsOpen && !isLabsOpen && !isNotesOpen;
  const handleToggleAll = () => {
    const nextState = allCollapsed;
    setIsDemographicsOpen(nextState);
    setIsVitalsOpen(nextState);
    setIsLabsOpen(nextState);
    setIsNotesOpen(nextState);
  };

  const vitalParams = record.parameters.filter((p) => p.type === 'vital');
  const labParams = record.parameters.filter((p) => p.type === 'lab');

  const vitalMeasuredCount = vitalParams.filter((p) => p.readings.length > 0).length;
  const labMeasuredCount = labParams.filter((p) => p.readings.length > 0).length;

  return (
    <div className="space-y-3" id="patient-data-entry-container">
      {/* Top Header & Section Expand Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] font-mono">
            Patient Data &amp; Telemetry
          </span>
          <span className="text-[10px] font-mono font-bold text-[#5F6368] bg-white border border-[#DADCE0] px-2 py-0.5 rounded-xs">
            {vitalMeasuredCount + labMeasuredCount} of {record.parameters.length} Measured
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleAll}
          className="text-[11px] text-[#1967D2] hover:text-[#1557B0] font-mono font-medium flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 border border-[#DADCE0] rounded-xs shadow-2xs"
        >
          <SlidersHorizontal className="w-3 h-3 text-[#1967D2]" />
          <span>{allCollapsed ? 'Expand All' : 'Collapse All'}</span>
        </button>
      </div>

      {/* SECTION 1: Patient Profile, Demographics & Baseline (Collapsible) */}
      <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsDemographicsOpen(!isDemographicsOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-xs bg-[#E8F0FE] text-[#1967D2] flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wide">
                  Patient Demographics &amp; Baseline
                </span>
                <span className="text-[10px] font-mono text-[#5F6368] bg-[#F1F3F4] px-1.5 py-0.2 rounded-xs border border-[#DADCE0]">
                  Bed {record.patient.id}
                </span>
              </div>
              <p className="text-[11px] text-[#6D7278] truncate max-w-xs sm:max-w-md">
                {record.patient.name} &bull; {record.patient.age}y {record.patient.gender} &bull;{' '}
                {record.patient.admittedDiagnosis || 'General Admittance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#5F6368]">
            <span className="text-[10px] font-mono font-medium hidden sm:inline">
              {isDemographicsOpen ? 'Hide Profile' : 'Edit Profile'}
            </span>
            {isDemographicsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isDemographicsOpen && (
          <div className="p-3.5 pt-1 border-t border-[#E0E2E6] space-y-3 bg-[#FCFCFD] text-xs animate-in fade-in duration-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={record.patient.name}
                  onChange={(e) => handleDemographicChange('name', e.target.value)}
                  className="w-full bg-white border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:border-[#1967D2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={record.patient.age}
                  onChange={(e) => handleDemographicChange('age', parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:border-[#1967D2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  value={record.patient.gender}
                  onChange={(e) => handleDemographicChange('gender', e.target.value)}
                  className="w-full bg-white border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:border-[#1967D2] focus:outline-none cursor-pointer"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
                Admitted Diagnosis &amp; Ward Bed
              </label>
              <input
                type="text"
                value={record.patient.admittedDiagnosis || ''}
                onChange={(e) => handleDemographicChange('admittedDiagnosis', e.target.value)}
                placeholder="e.g. Sepsis secondary to Pyelonephritis (Bed 402)"
                className="w-full bg-white border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:border-[#1967D2] focus:outline-none"
              />
            </div>

            {/* Conditions & Comorbidities */}
            <div>
              <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1">
                Known Conditions &amp; Comorbidities
              </label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {record.patient.knownConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-[#E8F0FE] border border-[#ADCCF9] text-[#1967D2] text-[11px] font-mono px-2 py-0.5 rounded-xs"
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
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                  placeholder="Add condition (e.g. COPD, CKD) and press Enter..."
                  className="flex-1 bg-white border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:border-[#1967D2] focus:outline-none"
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

            {/* Medications */}
            <div>
              <label className="block text-[10px] font-bold text-[#6D7278] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Pill className="w-3 h-3 text-[#5F6368]" />
                Active Medications
              </label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {record.patient.medications.map((med, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] text-[11px] font-mono px-2 py-0.5 rounded-xs"
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
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
                  placeholder="Add medication (e.g. Carvedilol 12.5mg) and press Enter..."
                  className="flex-1 bg-white border border-[#DADCE0] rounded-xs px-2.5 py-1.5 text-xs text-[#1A1C1E] focus:border-[#1967D2] focus:outline-none"
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
          </div>
        )}
      </div>

      {/* SECTION 2: Core Vital Signs Time-Series (Collapsible) */}
      <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsVitalsOpen(!isVitalsOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-xs bg-[#FCE8E6] text-[#D93025] flex items-center justify-center font-bold text-xs">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wide">
                  Core Vital Signs
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#E8F0FE] text-[#1967D2] px-1.5 py-0.2 rounded-xs border border-[#ADCCF9]">
                  {vitalMeasuredCount} of {vitalParams.length} Active
                </span>
              </div>
              <p className="text-[11px] text-[#6D7278]">
                HR, BP, SpO₂, Respiratory Rate, Temperature Time-Series
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#5F6368]">
            <span className="text-[10px] font-mono font-medium hidden sm:inline">
              {isVitalsOpen ? 'Collapse' : 'Expand'}
            </span>
            {isVitalsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isVitalsOpen && (
          <div className="p-3.5 pt-1 border-t border-[#E0E2E6] space-y-3 bg-[#FCFCFD] animate-in fade-in duration-100">
            {isLimitedMode && (
              <div className="bg-[#FFF4E5] border border-[#FFD399] text-[#855B1B] rounded-xs p-2 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#E67E22] shrink-0" />
                <span>
                  <strong>Limited Mode:</strong> Evaluating only latest observation to demonstrate confidence capping.
                </span>
              </div>
            )}

            <div className="space-y-2.5">
              {vitalParams.map((param) => (
                <ParameterItemRow
                  key={param.id}
                  param={param}
                  isLimitedMode={isLimitedMode}
                  onReadingChange={(idx, val) => handleReadingChange(param.id, idx, val)}
                  onAddReading={() => handleAddReading(param.id)}
                  onRemoveReading={(idx) => handleRemoveReading(param.id, idx)}
                  onClear={() => handleClearParameter(param.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Laboratory Panels & Blood Gas Diagnostics (Collapsible) */}
      <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsLabsOpen(!isLabsOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-xs bg-[#E6F4EA] text-[#137333] flex items-center justify-center font-bold text-xs">
              <FlaskConical className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wide">
                  Laboratory Panels
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#F1F3F4] text-[#5F6368] px-1.5 py-0.2 rounded-xs border border-[#DADCE0]">
                  {labMeasuredCount} of {labParams.length} Measured
                </span>
              </div>
              <p className="text-[11px] text-[#6D7278]">
                Lactate, Creatinine, WBC Count, Blood Glucose Values
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#5F6368]">
            <span className="text-[10px] font-mono font-medium hidden sm:inline">
              {isLabsOpen ? 'Collapse' : 'Expand'}
            </span>
            {isLabsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isLabsOpen && (
          <div className="p-3.5 pt-1 border-t border-[#E0E2E6] space-y-3 bg-[#FCFCFD] animate-in fade-in duration-100">
            <div className="space-y-2.5">
              {labParams.map((param) => (
                <ParameterItemRow
                  key={param.id}
                  param={param}
                  isLimitedMode={isLimitedMode}
                  onReadingChange={(idx, val) => handleReadingChange(param.id, idx, val)}
                  onAddReading={() => handleAddReading(param.id)}
                  onRemoveReading={(idx) => handleRemoveReading(param.id, idx)}
                  onClear={() => handleClearParameter(param.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: Qualitative Notes & Physical Exam (Collapsible) */}
      <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsNotesOpen(!isNotesOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-xs bg-[#F3E8FD] text-[#7050E0] flex items-center justify-center font-bold text-xs">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wide">
                  Clinical Notes &amp; Bedside Findings
                </span>
                {record.patient.notes && (
                  <span className="text-[10px] font-mono bg-[#E8F0FE] text-[#1967D2] px-1.5 py-0.2 rounded-xs border border-[#ADCCF9]">
                    Recorded
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6D7278] truncate max-w-xs sm:max-w-md">
                {record.patient.notes || 'No qualitative observations recorded yet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#5F6368]">
            <span className="text-[10px] font-mono font-medium hidden sm:inline">
              {isNotesOpen ? 'Collapse' : 'Add / View Notes'}
            </span>
            {isNotesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isNotesOpen && (
          <div className="p-3.5 pt-1 border-t border-[#E0E2E6] space-y-2.5 bg-[#FCFCFD] text-xs animate-in fade-in duration-100">
            {/* Quick insert clinical tags */}
            <div>
              <span className="text-[10px] font-mono font-bold text-[#6D7278] mr-1.5 block mb-1">
                Quick Clinical Findings Insert:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  'Altered Mental Status / Somnolence',
                  'Increased Work of Breathing',
                  'Decreased Urine Output (<0.5 mL/kg/h)',
                  'Mottled / Cool Extremities',
                  'New Onset Confusion',
                  'Bibasilar Crackles',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const current = record.patient.notes?.trim() || '';
                      const updated = current ? `${current} | ${tag}` : tag;
                      handleDemographicChange('notes', updated);
                    }}
                    className="text-[10px] font-mono bg-white hover:bg-[#E8F0FE] hover:text-[#1967D2] hover:border-[#ADCCF9] text-[#3C4043] border border-[#DADCE0] px-2 py-0.5 rounded-xs transition-colors cursor-pointer"
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
              placeholder="e.g. Patient presents with increasing somnolence, decreased urine output, and mottled extremities..."
              className="w-full bg-white border border-[#DADCE0] rounded-xs p-2.5 text-xs text-[#1A1C1E] focus:border-[#1967D2] focus:outline-none font-mono leading-relaxed"
            />

            {record.patient.notes && (
              <div className="flex justify-end">
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
        )}
      </div>

      {/* Recalculate Assessment Action Button */}
      <button
        type="button"
        onClick={onRunAssessment}
        disabled={isLoading}
        className="w-full bg-[#1A1C1E] hover:bg-[#2D3135] text-white py-2.5 px-4 rounded-xs text-xs font-bold uppercase tracking-wider font-mono shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4 text-[#8AB4F8]" />
        <span>{isLoading ? 'Re-Evaluating Model Pipeline...' : 'Run Deterioration Assessment'}</span>
      </button>
    </div>
  );
};

// Compact Parameter Row Sub-Component
interface ParameterItemRowProps {
  param: ParameterSeries;
  isLimitedMode: boolean;
  onReadingChange: (index: number, value: string | number) => void;
  onAddReading: () => void;
  onRemoveReading: (index: number) => void;
  onClear: () => void;
}

const ParameterItemRow: React.FC<ParameterItemRowProps> = ({
  param,
  isLimitedMode,
  onReadingChange,
  onAddReading,
  onRemoveReading,
  onClear,
}) => {
  const readings = isLimitedMode ? param.readings.slice(-1) : param.readings;
  const isUnmeasured = readings.length === 0;

  return (
    <div
      className={`p-2.5 rounded-xs border transition-all ${
        isUnmeasured
          ? 'bg-[#F8F9FA] border-[#E0E2E6] opacity-80'
          : 'bg-white border-[#DADCE0] shadow-2xs'
      }`}
    >
      {/* Parameter Top Title Bar */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#1A1C1E]">{param.name}</span>
          <span className="text-[10px] font-mono text-[#6D7278]">({param.unit})</span>
          {isUnmeasured ? (
            <span className="text-[9px] font-mono bg-[#F1F3F4] text-[#80868B] px-1.5 py-0.2 rounded-xs border border-[#DADCE0]">
              Not Measured
            </span>
          ) : (
            <span className="text-[9px] font-mono font-bold bg-[#E8F0FE] text-[#1967D2] px-1.5 py-0.2 rounded-xs border border-[#ADCCF9]">
              {readings.length} {readings.length === 1 ? 'Reading' : 'Readings'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isUnmeasured && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] font-mono text-[#80868B] hover:text-[#D93025] cursor-pointer"
              title="Clear all readings to test unmeasured state"
            >
              Clear
            </button>
          )}

          {!isLimitedMode && (
            <button
              type="button"
              onClick={onAddReading}
              className="text-[10px] font-mono font-medium text-[#1967D2] hover:bg-[#E8F0FE] border border-[#ADCCF9] px-2 py-0.5 rounded-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Observation Readings Inputs */}
      {isUnmeasured ? (
        <div className="flex items-center justify-between py-1 text-[11px] text-[#80868B] italic">
          <span>No readings recorded. Click &quot;Add&quot; to log telemetry.</span>
          <button
            type="button"
            onClick={onAddReading}
            className="text-[10px] font-mono font-bold text-[#1967D2] hover:underline cursor-pointer not-italic"
          >
            + Log Reading
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {readings.map((reading, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-[#F8F9FA] p-1.5 rounded-xs border border-[#E8EAED]"
            >
              <span className="text-[10px] font-mono font-bold text-[#5F6368] w-20 shrink-0 truncate" title={reading.timestamp}>
                {reading.timestamp.includes('(') ? reading.timestamp.split('(')[0] : reading.timestamp}
              </span>

              <input
                type={param.id === 'blood_pressure' ? 'text' : 'number'}
                step={param.id === 'lactate' || param.id === 'creatinine' ? '0.1' : '1'}
                value={reading.value}
                onChange={(e) => {
                  const val = param.id === 'blood_pressure' ? e.target.value : parseFloat(e.target.value) || 0;
                  onReadingChange(idx, val);
                }}
                className="flex-1 bg-white border border-[#DADCE0] rounded-xs px-2 py-1 text-xs font-mono font-bold text-[#1A1C1E] focus:border-[#1967D2] focus:outline-none"
              />

              <span className="text-[10px] font-mono text-[#6D7278] w-8 shrink-0">
                {param.unit}
              </span>

              {!isLimitedMode && readings.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveReading(idx)}
                  className="text-[#80868B] hover:text-[#D93025] p-1 cursor-pointer"
                  title="Remove reading"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
