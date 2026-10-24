import React, { useState } from 'react';
import { X, Download, FileText, Check, Printer } from 'lucide-react';
import { Floor, Student } from '../types';
import { exportFloorAssignmentsPdf } from '../utils/pdfExport';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  floors: Floor[];
  students: Student[];
}

export const PdfModal: React.FC<PdfModalProps> = ({
  isOpen,
  onClose,
  floors,
  students,
}) => {
  const currentYear = new Date().getFullYear();
  const [docTitle, setDocTitle] = useState('STUDENT COUNCIL FLOOR DUTY ROSTER');
  const [academicYear, setAcademicYear] = useState(`${currentYear} - ${currentYear + 1}`);
  const [notes, setNotes] = useState(
    'Duty Instructions: Council members must report to their assigned floors 5 minutes prior to assembly, break, and dismissal.'
  );
  const [includeUnassigned, setIncludeUnassigned] = useState(false);

  if (!isOpen) return null;

  const assignedStudents = students.filter((s) => s.assignedFloorId);
  const unassignedStudents = students.filter((s) => !s.assignedFloorId);

  const handleExport = () => {
    exportFloorAssignmentsPdf(floors, students, {
      title: docTitle,
      academicYear,
      notes,
      includeUnassigned,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Floor Assignments PDF</h3>
              <p className="text-xs text-slate-500">
                Configure document details for an official, print-ready PDF roster
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4 text-xs">
          {/* Document Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Header / Title</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Academic Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Session</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="text"
                disabled
                value={new Date().toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Duty Instructions & Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Duty Notes / Instructions (Printed on PDF)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Options */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeUnassigned}
                onChange={(e) => setIncludeUnassigned(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
              />
              <span className="text-slate-700 font-medium">
                Include unassigned students list in appendix ({unassignedStudents.length} students)
              </span>
            </label>
          </div>

          {/* Live Preview Summary */}
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
              <span>PDF Roster Breakdown</span>
              <span className="text-emerald-700 font-bold">
                {assignedStudents.length} Students Assigned
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {floors.map((fl) => {
                const count = students.filter((s) => s.assignedFloorId === fl.id).length;
                return (
                  <div key={fl.id} className="bg-white p-2 rounded border border-slate-200">
                    <span className="font-medium text-slate-700 block truncate">{fl.name}</span>
                    <strong className="text-slate-900 text-xs">{count} assigned</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
