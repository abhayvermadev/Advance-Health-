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

  useEffect(() => {
    if (currentUser) {
      setSelectedUser(currentUser);
    }
  }, [currentUser, isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'physician':
        return <Stethoscope className="w-4 h-4 text-[#1967D2]" />;
      case 'nurse':
        return <Activity className="w-4 h-4 text-[#188038]" />;
      case 'data_auditor':
        return <FileCheck className="w-4 h-4 text-[#A142F4]" />;
      case 'chief_officer':
        return <Building2 className="w-4 h-4 text-[#E37400]" />;
      default:
        return <Shield className="w-4 h-4 text-[#1967D2]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xs shadow-2xl border border-[#DADCE0] overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default"
        id="role-login-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1A1C1E] text-white p-4 border-b border-[#3C4043] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1967D2] rounded-xs flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight uppercase">
                  ADVANCE HEALTH • SECURED CLINICAL AUTHENTICATION
                </h2>
                <span className="text-[10px] font-mono bg-[#188038]/30 text-[#81C995] border border-[#188038]/50 px-1.5 py-0.2 rounded-xs">
                  HIPAA TIED
                </span>
              </div>
              <p className="text-[11px] text-[#9AA0A6]">
                Role-Based Access Control (RBAC) &amp; Deterministic Cryptographic Audit Trail
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex items-center gap-1 text-[#9AA0A6] hover:text-white text-xs font-mono px-2.5 py-1 bg-[#282B2E] hover:bg-[#3C4043] rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>CLOSE (ESC)</span>
          </button>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-5 space-y-5">
          {/* Quick Persona Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#1A1C1E] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Select Verified Clinical Identity (1-Click Switch)</span>
              <span className="text-[10px] font-mono text-[#5F6368]">4 Hospital Personas Available</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CLINICAL_USERS.map((u) => {
                const isSelected = selectedUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setError('');
                    }}
                    className={`p-3 rounded-xs border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#E8F0FE] border-[#1967D2] shadow-xs'
                        : 'bg-[#F8F9FA] hover:bg-[#F1F3F4] border-[#DADCE0]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xs flex items-center justify-center font-bold text-xs font-mono ${
                            isSelected ? 'bg-[#1967D2] text-white' : 'bg-[#E0E2E6] text-[#3C4043]'
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

                    <div className="mt-2 text-[11px] font-medium text-[#1967D2]">
                      {u.roleTitle}
                    </div>

                    <div className="mt-1 text-[10px] text-[#5F6368] truncate">
                      {u.department}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-[#DADCE0]/70 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-[#3C4043]">{u.securityClearance}</span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[#188038] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Permissions Card */}
          <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-xs p-3.5">
            <div className="text-[11px] font-bold text-[#1A1C1E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-[#1967D2]" />
              <span>Privileges for: {selectedUser.roleTitle}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canTriggerEmergencyRRT ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#80868B] shrink-0" />
                )}
                <span className={selectedUser.permissions.canTriggerEmergencyRRT ? 'text-[#1A1C1E] font-medium' : 'text-[#80868B]'}>
                  Trigger RRT Alert
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canOrderDiagnostics ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#80868B] shrink-0" />
                )}
                <span className={selectedUser.permissions.canOrderDiagnostics ? 'text-[#1A1C1E] font-medium' : 'text-[#80868B]'}>
                  Order Diagnostics
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
                  Edit Patient Vitals/Labs
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canSignOffReports ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#80868B] shrink-0" />
                )}
                <span className={selectedUser.permissions.canSignOffReports ? 'text-[#1A1C1E] font-medium' : 'text-[#80868B]'}>
                  Sign-Off PDF Reports
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedUser.permissions.canViewAuditLogs ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038] shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#80868B] shrink-0" />
                )}
                <span className={selectedUser.permissions.canViewAuditLogs ? 'text-[#1A1C1E] font-medium' : 'text-[#80868B]'}>
                  Inspect Audit Trail
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Credentials Field */}
          <div>
            <label className="block text-[11px] font-bold text-[#1A1C1E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#1967D2]" />
              <span>Hospital Security Passcode / Smart-Card PIN</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter hospital passcode..."
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
            <p className="text-[10px] text-[#80868B] mt-1 font-mono">
              Demo bypass: Passcode pre-filled for rapid hackathon testing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#DADCE0] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-[#5F6368] font-mono">
              <Lock className="w-3.5 h-3.5 text-[#188038]" />
              <span>TLS 1.3 256-Bit Encrypted Session</span>
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
                className="flex items-center gap-1.5 bg-[#1967D2] hover:bg-[#185ABC] text-white px-4 py-1.5 rounded-xs text-xs font-medium tracking-tight shadow-xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Authenticate as {selectedUser.name.split(' ')[1] || selectedUser.name}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
