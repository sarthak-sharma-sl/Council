import React from 'react';
import { Download, RefreshCw, Layers, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Floor, Student } from '../types';

interface HeaderProps {
  floors: Floor[];
  students: Student[];
  onOpenPdfModal: () => void;
  onResetAssignments: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  floors,
  students,
  onOpenPdfModal,
  onResetAssignments,
}) => {
  const assignedCount = students.filter((s) => s.assignedFloorId).length;
  const unassignedCount = students.length - assignedCount;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-900 text-white">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Floor Duty Allocation
                </h1>
                <p className="text-xs text-slate-500">
                  Student Council & House Prefects Floor Roster Manager
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Total: <strong className="text-slate-900">{students.length}</strong>
                </span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  Assigned: <strong className="text-emerald-700">{assignedCount}</strong>
                </span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Unassigned: <strong className="text-amber-700">{unassignedCount}</strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onResetAssignments}
              title="Reset all floor assignments"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-rose-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onOpenPdfModal}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Roster</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
