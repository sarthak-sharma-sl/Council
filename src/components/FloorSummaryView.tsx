import React from 'react';
import { Layers, Users, X, ArrowRight, ShieldCheck, Pin } from 'lucide-react';
import { Floor, Student } from '../types';
import { HOUSE_COLORS } from '../data/initialStudents';

interface FloorSummaryViewProps {
  floors: Floor[];
  students: Student[];
  onRemoveStudentFromFloor: (studentId: string) => void;
  onMoveStudentToFloor: (studentId: string, targetFloorId: string) => void;
  onClearFloor: (floorId: string) => void;
  activeFloorId: string;
  onSelectActiveFloor: (floorId: string) => void;
}

export const FloorSummaryView: React.FC<FloorSummaryViewProps> = ({
  floors,
  students,
  onRemoveStudentFromFloor,
  onMoveStudentToFloor,
  onClearFloor,
  activeFloorId,
  onSelectActiveFloor,
}) => {
  return (
    <div className="space-y-4 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <span>Floor Assignment Roster Overview</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time deployment view across all floors. Review or adjust student posts before exporting to PDF.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {floors.map((floor) => {
          const floorStudents = students.filter((s) => s.assignedFloorId === floor.id);
          const isActive = floor.id === activeFloorId;

          return (
            <div
              key={floor.id}
              className={`rounded-xl border bg-white shadow-2xs flex flex-col transition-all ${
                isActive ? 'border-slate-800 ring-1 ring-slate-800/10' : 'border-slate-200'
              }`}
            >
              {/* Floor Card Header */}
              <div
                className={`p-3.5 border-b rounded-t-xl flex items-center justify-between ${
                  isActive ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => onSelectActiveFloor(floor.id)}
                  title="Set as active target floor"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight">{floor.name}</span>
                    {isActive && (
                      <span className="text-[10px] bg-white/20 text-white font-medium px-1.5 py-0.2 rounded">
                        Active Target
                      </span>
                    )}
                  </div>
                  <span className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                    {floorStudents.length} student{floorStudents.length !== 1 ? 's' : ''} assigned
                  </span>
                </div>

                {floorStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onClearFloor(floor.id)}
                    title={`Clear all students from ${floor.name}`}
                    className={`text-xs px-2 py-0.5 rounded transition-colors ${
                      isActive
                        ? 'text-slate-300 hover:text-rose-300 hover:bg-white/10'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    Clear Floor
                  </button>
                )}
              </div>

              {/* Floor Student List */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                {floorStudents.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    No students stationed on this floor yet.
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => onSelectActiveFloor(floor.id)}
                        className="text-[11px] not-italic text-slate-900 font-semibold underline hover:text-slate-700"
                      >
                        Select as active floor to assign
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 space-y-1">
                    {floorStudents.map((student, idx) => {
                      const houseTheme = HOUSE_COLORS[student.house] || {
                        bg: 'bg-slate-100 text-slate-800',
                        border: 'border-slate-200',
                      };

                      return (
                        <li
                          key={student.id}
                          className="pt-2 pb-1.5 flex items-start justify-between gap-2 group text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900 text-xs truncate">
                                {idx + 1}. {student.name}
                              </span>
                              <span className="text-[10px] font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">
                                {student.class}
                              </span>
                              {student.isSpecificallyAssigned && (
                                <span
                                  title="Individually selected"
                                  className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded flex items-center"
                                >
                                  <Pin className="w-2.5 h-2.5 rotate-45 inline mr-0.5" />
                                  Manual
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${houseTheme.bg} ${houseTheme.border}`}
                              >
                                {student.house}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium truncate">
                                {student.post}
                              </span>
                            </div>
                          </div>

                          {/* Quick move dropdown or remove */}
                          <div className="flex items-center gap-1 shrink-0 pt-0.5">
                            <select
                              value={floor.id}
                              onChange={(e) => onMoveStudentToFloor(student.id, e.target.value)}
                              title="Move to another floor"
                              className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none"
                            >
                              {floors.map((fl) => (
                                <option key={fl.id} value={fl.id}>
                                  To: {fl.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => onRemoveStudentFromFloor(student.id)}
                              title="Unassign from floor"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
