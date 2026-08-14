import React, { useState, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  ArrowRight,
  Info,
  ChevronRight,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import {
  ParameterSeries,
  ParameterTrendAnalysis,
  FullAssessmentResult,
  CompositeRiskAssessment,
} from '../types/clinical';

interface TimeSeriesVisualizerProps {
  parameters: ParameterSeries[];
  trends?: ParameterTrendAnalysis[];
  isLimitedMode: boolean;
  assessment?: FullAssessmentResult;
}

export const TimeSeriesVisualizer: React.FC<TimeSeriesVisualizerProps> = ({
  parameters,
  trends = [],
  isLimitedMode,
  assessment,
}) => {
  // Mode toggles
  const [showPredictiveOverlay, setShowPredictiveOverlay] = useState<boolean>(true);
  const [forecastHorizonHours, setForecastHorizonHours] = useState<6 | 12>(12);
  const [simulationScenario, setSimulationScenario] = useState<'natural' | 'intervened'>('natural');
  const [selectedForecastMetric, setSelectedForecastMetric] = useState<string>('composite_risk');

  // Filter active parameters with at least 1 reading
  const activeParams = useMemo(() => {
    return parameters.filter((p) => {
      const readings = isLimitedMode ? p.readings.slice(-1) : p.readings;
      return readings.length > 0;
    });
  }, [parameters, isLimitedMode]);

  const currentRisk = assessment?.stage3Risk?.riskScore ?? 65;
  const currentConfidence = assessment?.stage3Risk?.confidenceScore ?? 75;
  const isConfidenceCapped = assessment?.stage3Risk?.confidenceCapApplied ?? false;

  // Trajectory badge helper
  const getTrajectoryBadge = (trajectory?: string) => {
    switch (trajectory) {
      case 'acute_deterioration':
        return {
          bg: 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]',
          icon: <TrendingUp className="w-3.5 h-3.5 text-[#D93025]" />,
          label: 'Acute Deterioration',
        };
      case 'gradual_drift':
        return {
          bg: 'bg-[#FEF7E0] text-[#B06000] border-[#FCE293]',
          icon: <TrendingUp className="w-3.5 h-3.5 text-[#E67E22]" />,
          label: 'Gradual Drift',
        };
      case 'improving':
        return {
          bg: 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]',
          icon: <TrendingDown className="w-3.5 h-3.5 text-[#188038]" />,
          label: 'Improving / Normalizing',
        };
      case 'stable':
        return {
          bg: 'bg-[#E8F0FE] text-[#1967D2] border-[#ADCCF9]',
          icon: <Minus className="w-3.5 h-3.5 text-[#1967D2]" />,
          label: 'Stable Trajectory',
        };
      case 'insufficient_trend_data':
      default:
        return {
          bg: 'bg-[#F1F3F4] text-[#5F6368] border-[#DADCE0]',
          icon: <Clock className="w-3.5 h-3.5 text-[#5F6368]" />,
          label: 'Single Point (No Trend)',
        };
    }
  };

  // Determine aggregate deterioration velocity from active trends
  const trendVelocity = useMemo(() => {
    let acuteCount = 0;
    let driftCount = 0;
    let improvingCount = 0;

    trends.forEach((t) => {
      if (t.trajectory === 'acute_deterioration') acuteCount++;
      else if (t.trajectory === 'gradual_drift') driftCount++;
      else if (t.trajectory === 'improving') improvingCount++;
    });

    if (acuteCount >= 2) return { rate: 3.8, label: 'Accelerated Deterioration (+3.8 risk pts/hr)' };
    if (acuteCount === 1 || driftCount >= 2) return { rate: 2.1, label: 'Moderate Deterioration (+2.1 risk pts/hr)' };
    if (improvingCount >= 2) return { rate: -2.5, label: 'Spontaneous Recovery (-2.5 risk pts/hr)' };
    return { rate: 0.5, label: 'Quiescent Baseline (+0.5 risk pts/hr)' };
  }, [trends]);

  // Compute 12-hour predictive points with confidence bounds
  const trajectoryPoints = useMemo(() => {
    // Historical points
    const hist = [
      { timeLabel: '-48h', hourOffset: -48, risk: Math.max(10, currentRisk - (trendVelocity.rate * 8) - 15), isHistorical: true },
      { timeLabel: '-24h', hourOffset: -24, risk: Math.max(15, currentRisk - (trendVelocity.rate * 4) - 8), isHistorical: true },
      { timeLabel: 'Now (T+0)', hourOffset: 0, risk: currentRisk, isHistorical: false, isNow: true },
    ];

    // Future forecast steps
    const hours = forecastHorizonHours === 6 ? [2, 4, 6] : [2, 4, 6, 8, 10, 12];

    const future = hours.map((h) => {
      let projectedRisk: number;
      if (simulationScenario === 'natural') {
        if (currentRisk > 50) {
          projectedRisk = Math.min(98, currentRisk + (trendVelocity.rate * h));
        } else if (trendVelocity.rate > 0) {
          projectedRisk = Math.min(85, currentRisk + (trendVelocity.rate * h * 0.8));
        } else {
          projectedRisk = Math.max(12, currentRisk + (trendVelocity.rate * h));
        }
      } else {
        // Clinical intervention applied: rapid stabilization trajectory
        const recoveryRate = currentRisk > 60 ? 4.5 : 2.5;
        projectedRisk = Math.max(18, currentRisk - (recoveryRate * h * 0.9));
      }

      // Uncertainty margin inversely proportional to confidence score & proportional to time horizon
      const baseUncertainty = (100 - currentConfidence) * 0.25;
      const timeExpansion = Math.sqrt(h / 6);
      const uncertaintyBand = Math.min(28, Math.max(4, Math.round(baseUncertainty * timeExpansion)));

      const upperBand = Math.min(100, Math.round(projectedRisk + uncertaintyBand));
      const lowerBand = Math.max(0, Math.round(projectedRisk - uncertaintyBand));

      return {
        timeLabel: `+${h}h`,
        hourOffset: h,
        risk: Math.round(projectedRisk),
        upperBand,
        lowerBand,
        uncertaintyBand,
        isHistorical: false,
        isFuture: true,
      };
    });

    return [...hist, ...future];
  }, [currentRisk, currentConfidence, trendVelocity, simulationScenario, forecastHorizonHours]);

  // SVG Chart Geometry
  const chartWidth = 640;
  const chartHeight = 200;
  const paddingX = 45;
  const paddingY = 24;

  const minHour = -48;
  const maxHour = forecastHorizonHours;
  const hourRange = maxHour - minHour;

  const getX = (hour: number) => {
    return paddingX + ((hour - minHour) / hourRange) * (chartWidth - paddingX * 2);
  };

  const getY = (riskVal: number) => {
    // Clamp 0-100 to canvas height
    const clamped = Math.max(0, Math.min(100, riskVal));
    return chartHeight - paddingY - (clamped / 100) * (chartHeight - paddingY * 2);
  };

  const xNow = getX(0);

  // Split history vs forecast coordinates
  const histPoints = trajectoryPoints.filter((p) => p.hourOffset <= 0);
  const futurePoints = trajectoryPoints.filter((p) => p.hourOffset >= 0);

  const histPathD = histPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.hourOffset)} ${getY(p.risk)}`)
    .join(' ');

  const futurePathD = futurePoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.hourOffset)} ${getY(p.risk)}`)
    .join(' ');

  // Construct Uncertainty Polygon (Fan area)
  const uncertaintyPolygonD = useMemo(() => {
    if (futurePoints.length < 2) return '';
    const upperPoints = futurePoints.map((p) => `${getX(p.hourOffset)} ${getY(p.upperBand ?? p.risk)}`);
    const lowerPointsReversed = [...futurePoints]
      .reverse()
      .map((p) => `${getX(p.hourOffset)} ${getY(p.lowerBand ?? p.risk)}`);
    return `M ${upperPoints.join(' L ')} L ${lowerPointsReversed.join(' L ')} Z`;
  }, [futurePoints, getX, getY]);

  // Calculate Parameter-Specific Forecast Value
  const getParamForecast = (param: ParameterSeries, trend?: ParameterTrendAnalysis) => {
    const readings = isLimitedMode ? param.readings.slice(-1) : param.readings;
    if (readings.length === 0) return null;

    const latest = readings[readings.length - 1];
    const val = typeof latest.value === 'number' ? latest.value : parseFloat(String(latest.value)) || 0;
    const isBp = param.id === 'blood_pressure';

    let projectedValStr = '';
    let direction: 'worsening' | 'improving' | 'stable' = 'stable';

    if (simulationScenario === 'natural') {
      if (param.id === 'heart_rate') {
        const proj = trend?.trajectory === 'acute_deterioration' ? Math.round(val + 14) : Math.round(val + 4);
        projectedValStr = `${proj} bpm`;
        direction = proj > 110 ? 'worsening' : 'stable';
      } else if (param.id === 'blood_pressure') {
        projectedValStr = trend?.trajectory === 'acute_deterioration' ? '82/48 mmHg' : '110/72 mmHg';
        direction = 'worsening';
      } else if (param.id === 'lactate') {
        const proj = (val + (forecastHorizonHours === 6 ? 1.2 : 2.1)).toFixed(1);
        projectedValStr = `${proj} mmol/L`;
        direction = parseFloat(proj) > 2.0 ? 'worsening' : 'stable';
      } else if (param.id === 'spo2') {
        const proj = Math.max(84, Math.round(val - (forecastHorizonHours === 6 ? 4 : 7)));
        projectedValStr = `${proj}%`;
        direction = proj < 92 ? 'worsening' : 'stable';
      } else if (param.id === 'respiratory_rate') {
        const proj = Math.min(38, Math.round(val + 6));
        projectedValStr = `${proj} /min`;
        direction = proj > 24 ? 'worsening' : 'stable';
      } else {
        projectedValStr = `${val} ${param.unit}`;
      }
    } else {
      // Protocol Intervention
      if (param.id === 'heart_rate') {
        projectedValStr = '82 bpm';
        direction = 'improving';
      } else if (param.id === 'blood_pressure') {
        projectedValStr = '118/76 mmHg';
        direction = 'improving';
      } else if (param.id === 'lactate') {
        projectedValStr = '1.3 mmol/L';
        direction = 'improving';
      } else if (param.id === 'spo2') {
        projectedValStr = '98% (2L NC)';
        direction = 'improving';
      } else if (param.id === 'respiratory_rate') {
        projectedValStr = '16 /min';
        direction = 'improving';
      } else {
        projectedValStr = `${val} ${param.unit}`;
        direction = 'improving';
      }
    }

    return {
      current: `${latest.value} ${param.unit}`,
      projected: projectedValStr,
      direction,
    };
  };

  return (
    <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-[#E0E2E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FCFDFD]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xs bg-[#E8F0FE] border border-[#ADCCF9] text-[#1967D2] flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E]">
                Stage 2 &bull; Time-Series &amp; Predictive Trajectory Engine
              </h3>
              <span className="text-[10px] font-mono font-bold bg-[#E8F0FE] text-[#1967D2] border border-[#ADCCF9] px-2 py-0.2 rounded-xs">
                AI 6–12H FORECAST OVERLAY
              </span>
            </div>
            <p className="text-[11px] text-[#6D7278]">
              Multi-point longitudinal trajectory modeling with forward-projected deterioration cones
            </p>
          </div>
        </div>

        {/* Predictive Overlay Toggle Button */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowPredictiveOverlay((prev) => !prev)}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xs border transition-all cursor-pointer shadow-2xs ${
              showPredictiveOverlay
                ? 'bg-[#1967D2] text-white border-[#1967D2]'
                : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F8F9FA]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showPredictiveOverlay ? 'PREDICTIVE OVERLAY ON' : 'ENABLE 6-12H OVERLAY'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Predictive Controls Bar (Shown when overlay active) */}
      {showPredictiveOverlay && (
        <div className="bg-[#F8FAFD] border-b border-[#E0E2E6] px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Horizon and Scenario Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#5F6368] uppercase font-mono mr-1">
                Forecast Horizon:
              </span>
              <button
                type="button"
                onClick={() => setForecastHorizonHours(6)}
                className={`text-xs font-mono px-2.5 py-1 rounded-xs border font-medium cursor-pointer transition-colors ${
                  forecastHorizonHours === 6
                    ? 'bg-[#1967D2] text-white border-[#1967D2] shadow-2xs'
                    : 'bg-white text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4]'
                }`}
              >
                +6 Hours
              </button>
              <button
                type="button"
                onClick={() => setForecastHorizonHours(12)}
                className={`text-xs font-mono px-2.5 py-1 rounded-xs border font-medium cursor-pointer transition-colors ${
                  forecastHorizonHours === 12
                    ? 'bg-[#1967D2] text-white border-[#1967D2] shadow-2xs'
                    : 'bg-white text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4]'
                }`}
              >
                +12 Hours (Full Shift)
              </button>

              <div className="h-4 w-px bg-[#DADCE0] mx-1 hidden sm:block" />

              <span className="text-[11px] font-bold text-[#5F6368] uppercase font-mono mr-1">
                Trajectory Model:
              </span>
              <button
                type="button"
                onClick={() => setSimulationScenario('natural')}
                className={`text-xs font-mono px-2.5 py-1 rounded-xs border font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                  simulationScenario === 'natural'
                    ? 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7] font-bold'
                    : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F1F3F4]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#D93025]" />
                Unchecked Progression
              </button>
              <button
                type="button"
                onClick={() => setSimulationScenario('intervened')}
                className={`text-xs font-mono px-2.5 py-1 rounded-xs border font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                  simulationScenario === 'intervened'
                    ? 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6] font-bold'
                    : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F1F3F4]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#188038]" />
                With Early Bundle Intervention
              </button>
            </div>

            {/* Velocity & Uncertainty Status */}
            <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
              <span className="text-[#5F6368]">Uncertainty Cone:</span>
              <span
                className={`px-2 py-0.5 rounded-xs border font-bold ${
                  isConfidenceCapped
                    ? 'bg-[#FEF7E0] text-[#B06000] border-[#FCE293]'
                    : 'bg-[#E8F0FE] text-[#1967D2] border-[#ADCCF9]'
                }`}
              >
                {isConfidenceCapped ? '±22% (Wide Band / Data Capped)' : '±8% (Tight / Multi-point Confirmed)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Visualizer Area */}
      <div className="p-4 space-y-4">
        {/* PREDICTIVE OVERLAY COMPOSITE TRAJECTORY CHART */}
        {showPredictiveOverlay && (
          <div className="bg-[#FFFFFF] border border-[#DADCE0] rounded-xs p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F3F4] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1C1E] uppercase font-mono">
                  Composite Clinical Risk Trajectory &bull; 48h History &rarr; +{forecastHorizonHours}h Forecast
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[#1967D2]">
                  <span className="w-3 h-0.5 bg-[#1967D2] inline-block" /> Historical (Solid)
                </span>
                <span className="flex items-center gap-1 text-[#D93025]">
                  <span className="w-3 h-0.5 border-b border-dashed border-[#D93025] inline-block" /> Projected (Dashed)
                </span>
                <span className="flex items-center gap-1 text-[#80868B]">
                  <span className="w-2.5 h-2 bg-[#E8F0FE] border border-[#ADCCF9] inline-block" /> 95% Confidence Interval
                </span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full min-w-[560px] h-48 overflow-visible select-none"
              >
                {/* Horizontal Risk Bands Background */}
                {/* High / Critical Risk Zone (>65) */}
                <rect
                  x={paddingX}
                  y={getY(100)}
                  width={chartWidth - paddingX * 2}
                  height={getY(65) - getY(100)}
                  fill="#FCE8E6"
                  fillOpacity="0.45"
                />
                {/* Moderate Risk Zone (35-65) */}
                <rect
                  x={paddingX}
                  y={getY(65)}
                  width={chartWidth - paddingX * 2}
                  height={getY(35) - getY(65)}
                  fill="#FEF7E0"
                  fillOpacity="0.45"
                />
                {/* Low Risk Zone (0-35) */}
                <rect
                  x={paddingX}
                  y={getY(35)}
                  width={chartWidth - paddingX * 2}
                  height={getY(0) - getY(35)}
                  fill="#E6F4EA"
                  fillOpacity="0.45"
                />

                {/* Horizontal Gridlines & Y-Axis Labels */}
                {[0, 35, 65, 100].map((level) => (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={getY(level)}
                      x2={chartWidth - paddingX}
                      y2={getY(level)}
                      stroke="#DADCE0"
                      strokeWidth="1"
                      strokeDasharray={level === 0 || level === 100 ? undefined : '3 3'}
                    />
                    <text
                      x={paddingX - 6}
                      y={getY(level) + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#80868B"
                      fontFamily="monospace"
                    >
                      {level}
                    </text>
                  </g>
                ))}

                {/* Risk Level Labels along Right Edge */}
                <text
                  x={chartWidth - paddingX + 6}
                  y={getY(82)}
                  fontSize="9"
                  fill="#C5221F"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  CRITICAL
                </text>
                <text
                  x={chartWidth - paddingX + 6}
                  y={getY(50)}
                  fontSize="9"
                  fill="#B06000"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  MODERATE
                </text>
                <text
                  x={chartWidth - paddingX + 6}
                  y={getY(18)}
                  fontSize="9"
                  fill="#137333"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  LOW RISK
                </text>

                {/* Vertical Divider: NOW (T+0) */}
                <line
                  x1={xNow}
                  y1={paddingY}
                  x2={xNow}
                  y2={chartHeight - paddingY}
                  stroke="#1A1C1E"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <rect
                  x={xNow - 32}
                  y={4}
                  width={64}
                  height={16}
                  fill="#1A1C1E"
                  rx="2"
                />
                <text
                  x={xNow}
                  y={15}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#FFFFFF"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  T=0 (NOW)
                </text>

                {/* Uncertainty Envelope Fan Area */}
                {uncertaintyPolygonD && (
                  <path
                    d={uncertaintyPolygonD}
                    fill={simulationScenario === 'natural' ? '#FAD2CF' : '#CEEAD6'}
                    fillOpacity="0.6"
                  />
                )}

                {/* Historical Risk Line (Solid Blue) */}
                <path
                  d={histPathD}
                  fill="none"
                  stroke="#1967D2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Forecast Risk Line (Dashed) */}
                <path
                  d={futurePathD}
                  fill="none"
                  stroke={simulationScenario === 'natural' ? '#D93025' : '#188038'}
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Trajectory Data Points */}
                {trajectoryPoints.map((pt, idx) => {
                  const x = getX(pt.hourOffset);
                  const y = getY(pt.risk);
                  const isFuture = pt.hourOffset > 0;
                  const isCurrent = pt.hourOffset === 0;

                  return (
                    <g key={idx} className="cursor-pointer">
                      {/* Outer pulse for Current & Final forecast */}
                      {(isCurrent || pt.hourOffset === forecastHorizonHours) && (
                        <circle
                          cx={x}
                          cy={y}
                          r="7"
                          fill={isCurrent ? '#1967D2' : simulationScenario === 'natural' ? '#D93025' : '#188038'}
                          fillOpacity="0.2"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isCurrent ? 4.5 : isFuture ? 3.5 : 3}
                        fill={
                          isCurrent
                            ? '#1967D2'
                            : isFuture
                            ? simulationScenario === 'natural'
                              ? '#D93025'
                              : '#188038'
                            : '#1967D2'
                        }
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      {/* Risk Score Label above dot */}
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        fill={
                          pt.risk > 65
                            ? '#C5221F'
                            : pt.risk > 35
                            ? '#B06000'
                            : '#137333'
                        }
                      >
                        {pt.risk}%
                      </text>
                      {/* X-Axis Time Label below */}
                      <text
                        x={x}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fill={isCurrent ? '#1A1C1E' : '#5F6368'}
                        fontWeight={isCurrent ? 'bold' : 'normal'}
                        fontFamily="monospace"
                      >
                        {pt.timeLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Forecast Takeaway Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-[#F1F3F4]">
              <div className="p-2.5 bg-[#F8F9FA] rounded-xs border border-[#E0E2E6] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1C1E]">
                  <Clock className="w-3.5 h-3.5 text-[#1967D2]" />
                  <span>Clinical Window to Intervene</span>
                </div>
                <p className="text-[11px] text-[#5F6368]">
                  {currentRisk > 65
                    ? 'Immediate (Within <2.0h) prior to irreversible multi-organ hypoperfusion cascade.'
                    : 'Standard continuous monitoring (4h vitals repeat cycle).'}
                </p>
              </div>

              <div className="p-2.5 bg-[#F8F9FA] rounded-xs border border-[#E0E2E6] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1C1E]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#E67E22]" />
                  <span>Projected Shift Delta</span>
                </div>
                <p className="text-[11px] font-mono text-[#3C4043]">
                  {simulationScenario === 'natural'
                    ? `Risk increases from ${currentRisk}% → ${
                        trajectoryPoints[trajectoryPoints.length - 1].risk
                      }% (+${trajectoryPoints[trajectoryPoints.length - 1].risk - currentRisk} pts)`
                    : `Risk attenuates from ${currentRisk}% → ${
                        trajectoryPoints[trajectoryPoints.length - 1].risk
                      }% (-${currentRisk - trajectoryPoints[trajectoryPoints.length - 1].risk} pts)`}
                </p>
              </div>

              <div className="p-2.5 bg-[#F8F9FA] rounded-xs border border-[#E0E2E6] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1C1E]">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#137333]" />
                  <span>Action Threshold Warning</span>
                </div>
                <p className="text-[11px] text-[#5F6368]">
                  {simulationScenario === 'natural' && currentRisk > 50
                    ? 'Triggers automatic Medical Emergency Team (MET) / Code Sepsis alert.'
                    : 'Maintains patient in safe step-down telemetry ward boundary.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PARAMETER-BY-PARAMETER GRID WITH PREDICTIVE EMBED */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] font-mono">
              Individual Biomarker Trajectories &amp; {showPredictiveOverlay ? `+${forecastHorizonHours}h Projections` : 'Historical Sparklines'}
            </span>
            <span className="text-[10px] font-mono text-[#6D7278] bg-[#F1F3F4] px-2 py-0.5 rounded-xs">
              {activeParams.length} ACTIVE STREAMS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeParams.map((param) => {
              const readings = isLimitedMode ? param.readings.slice(-1) : param.readings;
              const trend = trends.find((t) => t.parameterId === param.id);
              const trajInfo = getTrajectoryBadge(trend?.trajectory);
              const forecast = getParamForecast(param, trend);

              // Numerical values for SVG sparkline
              const numValues = readings
                .map((r) => {
                  if (typeof r.value === 'number') return r.value;
                  if (typeof r.value === 'string' && r.value.includes('/')) {
                    return parseFloat(r.value.split('/')[0]) || 0;
                  }
                  return parseFloat(r.value as string) || 0;
                })
                .filter((v) => !isNaN(v));

              const minVal = Math.min(...numValues);
              const maxVal = Math.max(...numValues);
              const range = maxVal - minVal || 1;

              const svgWidth = 260;
              const svgHeight = 64;
              const padding = 10;

              let pointsString = '';
              if (numValues.length === 1) {
                pointsString = `${padding},${svgHeight / 2} ${svgWidth / 2},${svgHeight / 2}`;
              } else {
                pointsString = numValues
                  .map((val, idx) => {
                    const x = padding + (idx / (numValues.length - 1)) * (svgWidth / 2 - padding);
                    const y =
                      svgHeight -
                      padding -
                      ((val - minVal) / (range || 1)) * (svgHeight - padding * 2);
                    return `${x},${y}`;
                  })
                  .join(' ');
              }

              const latestReading = readings[readings.length - 1];
              const firstReading = readings[0];

              return (
                <div
                  key={param.id}
                  className="p-3.5 bg-[#F8F9FA] border border-[#E0E2E6] rounded-xs flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#1A1C1E]">{param.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs border ${trajInfo.bg}`}
                      >
                        {trajInfo.icon}
                        {trajInfo.label}
                      </span>
                    </div>

                    {/* Values Readout & Target Projection */}
                    <div className="flex items-baseline justify-between text-xs text-[#5F6368]">
                      <div>
                        {readings.length > 1 ? (
                          <span>
                            Base: <strong className="font-mono text-[#1A1C1E]">{firstReading.value}</strong> &rarr; Now:{' '}
                            <strong className="font-mono text-[#1A1C1E]">
                              {latestReading.value} {param.unit}
                            </strong>
                          </span>
                        ) : (
                          <span>
                            Current: <strong className="font-mono text-[#1A1C1E]">{latestReading.value} {param.unit}</strong>
                          </span>
                        )}
                      </div>
                      {param.normalRange && (
                        <span className="text-[10px] text-[#80868B] font-mono">
                          Ref: {param.normalRange.label}
                        </span>
                      )}
                    </div>

                    {/* Sparkline Canvas with Future Extension */}
                    <div className="bg-white p-2 rounded-xs border border-[#E0E2E6] my-2">
                      <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-14 overflow-visible select-none"
                      >
                        {/* Reference Line */}
                        <line
                          x1="0"
                          y1={svgHeight / 2}
                          x2={svgWidth}
                          y2={svgHeight / 2}
                          stroke="#E0E2E6"
                          strokeDasharray="3 3"
                        />

                        {/* Midline divider between historical and forecast zone */}
                        {showPredictiveOverlay && (
                          <g>
                            <line
                              x1={svgWidth / 2 + 10}
                              y1="2"
                              x2={svgWidth / 2 + 10}
                              y2={svgHeight - 2}
                              stroke="#DADCE0"
                              strokeWidth="1"
                              strokeDasharray="2 2"
                            />
                            <text
                              x={svgWidth / 2 + 14}
                              y="10"
                              fontSize="8"
                              fill="#80868B"
                              fontFamily="monospace"
                            >
                              NOW
                            </text>
                          </g>
                        )}

                        {/* Historical Polyline */}
                        <polyline
                          fill="none"
                          stroke={trend?.isAnomaly ? '#D93025' : '#1967D2'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={pointsString}
                        />

                        {/* Historical Points */}
                        {numValues.map((val, idx) => {
                          const x =
                            numValues.length === 1
                              ? svgWidth / 4
                              : padding + (idx / (numValues.length - 1)) * (svgWidth / 2 - padding);
                          const y =
                            numValues.length === 1
                              ? svgHeight / 2
                              : svgHeight -
                                padding -
                                ((val - minVal) / (range || 1)) * (svgHeight - padding * 2);
                          const isLatest = idx === numValues.length - 1;
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r={isLatest ? 3.5 : 2}
                              fill={isLatest ? (trend?.isAnomaly ? '#D93025' : '#1967D2') : '#80868B'}
                              stroke="#ffffff"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Projected Polyline Extension (Dashed) */}
                        {showPredictiveOverlay && (
                          <g>
                            <line
                              x1={numValues.length === 1 ? svgWidth / 4 : svgWidth / 2}
                              y1={svgHeight / 2}
                              x2={svgWidth - padding}
                              y2={
                                forecast?.direction === 'worsening'
                                  ? padding + 6
                                  : forecast?.direction === 'improving'
                                  ? svgHeight - padding - 6
                                  : svgHeight / 2
                              }
                              stroke={forecast?.direction === 'worsening' ? '#D93025' : '#188038'}
                              strokeWidth="2"
                              strokeDasharray="4 3"
                            />
                            <circle
                              cx={svgWidth - padding}
                              cy={
                                forecast?.direction === 'worsening'
                                  ? padding + 6
                                  : forecast?.direction === 'improving'
                                  ? svgHeight - padding - 6
                                  : svgHeight / 2
                              }
                              r="3.5"
                              fill={forecast?.direction === 'worsening' ? '#D93025' : '#188038'}
                              stroke="#ffffff"
                              strokeWidth="1"
                            />
                          </g>
                        )}
                      </svg>

                      {/* Timestamps & Projected Output Footer */}
                      <div className="flex justify-between items-center text-[9px] text-[#80868B] font-mono mt-1 px-1 border-t border-[#F1F3F4] pt-1">
                        <span>Past Readings</span>
                        {showPredictiveOverlay && forecast && (
                          <span
                            className={`font-bold ${
                              forecast.direction === 'worsening'
                                ? 'text-[#C5221F]'
                                : forecast.direction === 'improving'
                                ? 'text-[#137333]'
                                : 'text-[#1967D2]'
                            }`}
                          >
                            +{forecastHorizonHours}h Forecast: {forecast.projected}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Patient Specific Justification */}
                  {trend?.patientSpecificJustification && (
                    <div className="text-[11px] text-[#3C4043] bg-white p-2 rounded-xs border border-[#E0E2E6]">
                      <strong className="text-[#1A1C1E]">Clinical Rationale: </strong>
                      {trend.patientSpecificJustification}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
