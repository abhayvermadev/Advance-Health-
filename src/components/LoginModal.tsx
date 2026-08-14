import React, { useState, useEffect } from 'react';
import { CLINICAL_USERS } from '../data/authUsers';
import { UserProfile } from '../types/clinical';
import {
  Shield,
  Lock,
  UserCheck,
  Stethoscope,
  Activity,
  FileCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Fingerprint,
  X,
  Cpu,
  ShieldCheck,
  Radio,
  Sparkles,
  Bed,
  Users,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  onLogin,
  onClose,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile>(currentUser || CLINICAL_USERS[0]);
  const [password, setPassword] = useState<string>('clinical-2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'DOCTOR' | 'NURSE' | 'SUPERINTENDENT' | 'AUDITOR'>('ALL');

  useEffect(() => {
    if (currentUser) {
      setSelectedUser(currentUser);
    }
  }, [currentUser, isOpen]);

  // Keyboard shortcut: Escape to close (only if already logged in)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && currentUser) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, currentUser]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a clinical access code or password.');
      return;
    }
    setError('');
    onLogin(selectedUser);
    onClose();
  };

  const handleQuickLogin = (user: UserProfile) => {
    setSelectedUser(user);
    setError('');
    onLogin(user);
    onClose();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor_consultant':
      case 'physician':
        return <Stethoscope className="w-4 h-4 text-[#1967D2]" />;
      case 'staff_nurse':
      case 'nurse':
        return <Activity className="w-4 h-4 text-[#188038]" />;
      case 'medical_superintendent':
      case 'chief_officer':
        return <Building2 className="w-4 h-4 text-[#D93025]" />;
      case 'ai_safety_auditor':
      case 'data_auditor':
        return <Cpu className="w-4 h-4 text-[#7050E0]" />;
      default:
        return <Shield className="w-4 h-4 text-[#1967D2]" />;
    }
  };

  const filteredUsers = CLINICAL_USERS.filter((u) => {
    if (roleFilter === 'DOCTOR') return u.role === 'doctor_consultant' || u.role === 'physician';
    if (roleFilter === 'NURSE') return u.role === 'staff_nurse' || u.role === 'nurse';
    if (roleFilter === 'SUPERINTENDENT') return u.role === 'medical_superintendent' || u.role === 'chief_officer';
    if (roleFilter === 'AUDITOR') return u.role === 'ai_safety_auditor' || u.role === 'data_auditor';
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget && currentUser) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-xs shadow-2xl border border-[#DADCE0] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 cursor-default"
        id="role-login-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1A1C1E] text-white p-4 border-b border-[#3C4043] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1967D2] rounded-xs flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight uppercase font-mono">
                  ADVANCE HEALTH &bull; SECURED CLINICIAN LOGIN
                </h2>
                <span className="text-[10px] font-mono bg-[#188038]/30 text-[#81C995] border border-[#188038]/50 px-1.5 py-0.2 rounded-xs">
                  ROLE-BASED ACCESS CONTROL (RBAC)
                </span>
              </div>
              <p className="text-[11px] text-[#9AA0A6]">
                Select a clinician profile to test role boundaries (Doctors, Nurses, Medical Superintendent)
              </p>
            </div>
          </div>
          {currentUser && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="flex items-center gap-1 text-[#9AA0A6] hover:text-white text-xs font-mono px-2.5 py-1 bg-[#282B2E] hover:bg-[#3C4043] rounded-xs transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>CLOSE</span>
            </button>
          )}
        </div>

        {/* TEE Enclave Guarantee Banner */}
        <div className="bg-[#F0F4F9] border-b border-[#D2E3FC] px-4 py-2 flex items-center justify-between gap-2 text-xs font-mono text-[#1967D2] shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#1967D2]" />
            <span>Confidential Compute Active: <strong>AMD SEV-SNP Cryptographic Memory Isolation</strong></span>
          </div>
          <span className="text-[10px] text-[#5F6368] hidden sm:inline">Zero-Knowledge Enclave</span>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick Role Category Filter */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-[11px] font-bold text-[#1A1C1E] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#1967D2]" />
                <span>Select Clinician Profile:</span>
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                {(
                  [
                    { id: 'ALL', label: 'All Roles' },
                    { id: 'DOCTOR', label: '🩺 Doctors' },
                    { id: 'NURSE', label: '👩‍⚕️ Nurses' },
                    { id: 'SUPERINTENDENT', label: '🏛️ Superintendent' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRoleFilter(tab.id as any)}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded-xs border transition-colors cursor-pointer ${
                      roleFilter === tab.id
                        ? 'bg-[#1967D2] text-white border-[#1967D2] font-bold'
                        : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F1F3F4]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredUsers.map((u) => {
                const isSelected = selectedUser.id === u.id;
                const isDoctor = u.role === 'doctor_consultant' || u.role === 'physician';
                const isNurse = u.role === 'staff_nurse' || u.role === 'nurse';
                const isSuper = u.role === 'medical_superintendent';

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u);
                      setError('');
                    }}
                    className={`p-3 rounded-xs border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#E8F0FE] border-[#1967D2] ring-1 ring-[#1967D2]/40 shadow-xs'
                        : 'bg-[#F8F9FA] hover:bg-[#F1F3F4] border-[#DADCE0]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xs flex items-center justify-center font-bold text-xs font-mono ${
                              isSuper
                                ? 'bg-[#D93025] text-white'
                                : isDoctor
                                ? 'bg-[#1967D2] text-white'
                                : 'bg-[#188038] text-white'
                            }`}
                          >
                            {u.avatarInitials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1A1C1E] flex items-center gap-1.5">
                              {u.name}
                            </div>
                            <div className="text-[10px] text-[#5F6368] font-mono">{u.badgeNumber}</div>
                          </div>
                        </div>
                        {getRoleIcon(u.role)}
                      </div>

                      <div className="mt-1.5 text-[11px] font-bold text-[#1967D2]">
                        {u.roleTitle}
                      </div>

                      {/* RBAC Assignment Details Pill */}
                      <div className="mt-1.5 p-1.5 bg-white rounded-xs border border-[#DADCE0] text-[10px] space-y-0.5">
                        <div className="text-[#1A1C1E] font-medium">
                          <strong>RBAC Scope:</strong>{' '}
                          {isSuper
                            ? 'Hospital Command + Full Census Access'
                            : isDoctor
                            ? 'Own Assigned Patients Only (No Hospital Command)'
                            : 'Assigned Ward & Patients (No Hospital Command)'}
                        </div>
                        {u.assignedWardUnits && (
                          <div className="text-[#5F6368] truncate">
                            <strong>Ward:</strong> {u.assignedWardUnits.join(', ')}
                          </div>
                        )}
                        {u.assignedPatientIds && (
                          <div className="text-[#5F6368] truncate">
                            <strong>Roster:</strong> {u.assignedPatientIds.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-[#DADCE0]/70 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-[#3C4043]">{u.securityClearance.split(' - ')[0]}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(u);
                        }}
                        className="bg-[#1967D2] hover:bg-[#1557B0] text-white px-2 py-0.5 rounded-xs font-mono font-bold text-[10px] cursor-pointer"
                      >
                        1-Click Switch →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Role Permissions Card */}
          <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-xs p-3.5">
            <div className="text-[11px] font-bold text-[#1A1C1E] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono">
                <Fingerprint className="w-3.5 h-3.5 text-[#1967D2]" />
                Privileges for: {selectedUser.name}
              </span>
              <span className="text-[10px] font-mono text-[#188038] bg-[#E6F4EA] px-2 py-0.5 rounded-xs border border-[#CEEAD6]">
                RBAC ENFORCED
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canViewHospitalSuperintendentDashboard ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#D93025] shrink-0" />
                )}
                <span className={selectedUser.permissions.canViewHospitalSuperintendentDashboard ? 'text-[#1A1C1E] font-bold' : 'text-[#80868B]'}>
                  Hospital Command Access {selectedUser.permissions.canViewHospitalSuperintendentDashboard ? '(Enabled)' : '(Disabled)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canTriggerEmergencyRRT ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#80868B] shrink-0" />
                )}
                <span className={selectedUser.permissions.canTriggerEmergencyRRT ? 'text-[#1A1C1E] font-medium' : 'text-[#80868B]'}>
                  Trigger Emergency RRT
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canOrderDiagnostics ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#80868B] shrink-0" />
                )}
                <span className={selectedUser.permissions.canOrderDiagnostics ? 'text-[#1A1C1E] font-medium' : 'text-[#80868B]'}>
                  Order Diagnostics &amp; Labs
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canOverrideAlerts ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#80868B] shrink-0" />
                )}
                <span className={selectedUser.permissions.canOverrideAlerts ? 'text-[#1A1C1E] font-medium' : 'text-[#80868B]'}>
                  Override Risk Thresholds
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canEditPatientData ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#80868B] shrink-0" />
                )}
                <span className={selectedUser.permissions.canEditPatientData ? 'text-[#1A1C1E] font-medium' : 'text-[#80868B]'}>
                  Edit Patient Telemetry Data
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canBroadcastHospitalAlerts ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#80868B] shrink-0" />
                )}
                <span className={selectedUser.permissions.canBroadcastHospitalAlerts ? 'text-[#1A1C1E] font-bold text-[#D93025]' : 'text-[#80868B]'}>
                  Broadcast Hospital Directives
                </span>
              </div>
            </div>
          </div>

          {/* Passcode Field */}
          <div>
            <label className="block text-[11px] font-bold text-[#1A1C1E] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
              <KeyRound className="w-3.5 h-3.5 text-[#1967D2]" />
              <span>Hospital Security Passcode / Smart-Card Key:</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter hospital security passcode..."
                className="w-full bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-3 py-2 text-xs font-mono text-[#1A1C1E] focus:bg-white focus:border-[#1967D2] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#1A1C1E] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-[11px] text-[#D93025] mt-1">{error}</p>}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#DADCE0] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-[#5F6368] font-mono">
              <Lock className="w-3.5 h-3.5 text-[#188038]" />
              <span>Attested Enclave Session &bull; Level 2-4 Clearance</span>
            </div>

            <div className="flex items-center gap-2">
              {currentUser && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-[#DADCE0] text-[#3C4043] hover:bg-[#F1F3F4] text-xs font-medium rounded-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-[#1967D2] hover:bg-[#185ABC] text-white px-4 py-1.5 rounded-xs text-xs font-mono font-bold tracking-tight shadow-xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>CONFIRM &amp; LOGIN ({selectedUser.name.split(' ')[1] || selectedUser.name})</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
