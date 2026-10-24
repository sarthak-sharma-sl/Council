import React from 'react';
import {
  Search,
  Check,
  Filter,
  X,
  Pin,
  CheckSquare,
  Square,
  Building,
  UserCheck,
  Shield,
} from 'lucide-react';
import { Floor, FilterOptions, Student, House } from '../types';
import { HOUSE_COLORS, HOUSES } from '../data/initialStudents';

interface StudentCatalogueProps {
  students: Student[];
  floors: Floor[];
  activeFloorId: string;
  filters: FilterOptions;
  onUpdateFilters: (newFilters: Partial<FilterOptions>) => void;
  onToggleStudentAssign: (studentId: string) => void;
  onSelectFloorForStudent: (studentId: string, floorId: string | undefined) => void;
  onToggleSpecificallyAssigned: (studentId: string) => void;
  onBulkAssignFiltered: (floorId: string) => void;
  onBulkUnassignFiltered: () => void;
}

export const StudentCatalogue: React.FC<StudentCatalogueProps> = ({
  students,
  floors,
  activeFloorId,
  filters,
  onUpdateFilters,
  onToggleStudentAssign,
  onSelectFloorForStudent,
  onToggleSpecificallyAssigned,
  onBulkAssignFiltered,
  onBulkUnassignFiltered,
}) => {
  const activeFloor = floors.find((f) => f.id === activeFloorId);

  // Extract unique designations from student list for the filter dropdown
  const uniqueDesignations = Array.from(new Set(students.map((s) => s.post))).sort();

  // Filter students based on current filter states
  const filteredStudents = students.filter((student) => {
    // 1. Search Query (Name or Designation or Class)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = student.name.toLowerCase().includes(q);
      const matchPost = student.post.toLowerCase().includes(q);
      const matchClass = student.class.toLowerCase().includes(q);
      const matchHouse = student.house.toLowerCase().includes(q);
      if (!matchName && !matchPost && !matchClass && !matchHouse) {
        return false;
      }
    }

    // 2. Floor Filter
    if (filters.floorFilter !== 'ALL') {
      if (filters.floorFilter === 'UNASSIGNED') {
        if (student.assignedFloorId) return false;
      } else if (filters.floorFilter === 'ASSIGNED') {
        if (!student.assignedFloorId) return false;
      } else {
        if (student.assignedFloorId !== filters.floorFilter) return false;
      }
    }

    // 3. Designation / Post Filter
    if (filters.designationFilter !== 'ALL') {
      if (student.post !== filters.designationFilter) {
        return false;
      }
    }

    // 4. House Filter
    if (filters.houseFilter !== 'ALL') {
      if (student.house !== filters.houseFilter) {
        return false;
      }
    }

    return true;
  });

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.floorFilter !== 'ALL' ||
    filters.designationFilter !== 'ALL' ||
    filters.houseFilter !== 'ALL';

  const resetFilters = () => {
    onUpdateFilters({
      searchQuery: '',
      floorFilter: 'ALL',
      designationFilter: 'ALL',
      houseFilter: 'ALL',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Title & Filters Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">Student Roster Catalogue</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                {filteredStudents.length} of {students.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any checkbox to assign/unassign a student to{' '}
              <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                {activeFloor?.name || 'Selected Floor'}
              </span>
              . Individual selections are marked and protected.
            </p>
          </div>

          {/* Quick Bulk Actions for Filtered List */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBulkAssignFiltered(activeFloorId)}
              title={`Assign all ${filteredStudents.length} filtered students to ${activeFloor?.name}`}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg transition-colors cursor-pointer"
            >
              Assign Filtered to {activeFloor?.name}
            </button>
            <button
              type="button"
              onClick={onBulkUnassignFiltered}
              title="Unassign all filtered students"
              className="text-xs px-2.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              Unassign Filtered
            </button>
          </div>
        </div>

        {/* Search and Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
              placeholder="Search by name, post, class..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onUpdateFilters({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Floor */}
          <div>
            <select
              value={filters.floorFilter}
              onChange={(e) => onUpdateFilters({ floorFilter: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">Floor: All Students</option>
              <option value="UNASSIGNED">Floor: Unassigned Only</option>
              <option value="ASSIGNED">Floor: Any Floor (Assigned)</option>
              <optgroup label="Specific Floor">
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>
                    Floor: {f.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Filter by Designation */}
          <div>
            <select
              value={filters.designationFilter}
              onChange={(e) => onUpdateFilters({ designationFilter: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">Designation: All Posts</option>
              {uniqueDesignations.map((post) => (
                <option key={post} value={post}>
                  {post}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by House */}
          <div className="flex items-center gap-2">
            <select
              value={filters.houseFilter}
              onChange={(e) => onUpdateFilters({ houseFilter: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">House: All Houses</option>
              {HOUSES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                title="Reset all search & filters"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              <th className="py-2.5 px-4 w-12 text-center">Assign</th>
              <th className="py-2.5 px-4">Student Name</th>
              <th className="py-2.5 px-3">Class</th>
              <th className="py-2.5 px-4">House</th>
              <th className="py-2.5 px-4">Designation / Post</th>
              <th className="py-2.5 px-4">Assigned Floor</th>
              <th className="py-2.5 px-3 text-right">Lock / Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-medium text-slate-600">No students match current filters</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs text-slate-900 underline font-medium hover:text-slate-700"
                    >
                      Clear search & filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const assignedFloor = floors.find((f) => f.id === student.assignedFloorId);
                const isAssigned = !!student.assignedFloorId;
                const isOnActiveFloor = student.assignedFloorId === activeFloorId;
                const houseTheme = HOUSE_COLORS[student.house] || {
                  bg: 'bg-slate-100 text-slate-800',
                  border: 'border-slate-200',
                };

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors group ${
                      isAssigned
                        ? isOnActiveFloor
                          ? 'bg-slate-50/80 hover:bg-slate-100/70'
                          : 'bg-white hover:bg-slate-50/50'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer p-1 -m-1">
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => onToggleStudentAssign(student.id)}
                          className="sr-only"
                        />
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                            isAssigned
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'border-2 border-slate-300 hover:border-slate-500 bg-white'
                          }`}
                        >
                          {isAssigned && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </span>
                      </label>
                    </td>

                    {/* Student Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{student.name}</span>
                        {student.isSpecificallyAssigned && (
                          <span
                            title="Specifically assigned to this floor (protected from house mass assignment)"
                            className="inline-flex items-center text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200"
                          >
                            <Pin className="w-2.5 h-2.5 mr-0.5 inline rotate-45" />
                            Specific
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {student.class}
                      </span>
                    </td>

                    {/* House Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md border ${houseTheme.bg} ${houseTheme.border}`}
                      >
                        {student.house}
                      </span>
                    </td>

                    {/* Designation / Post */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center font-medium text-slate-800">
                        {student.post}
                      </span>
                    </td>

                    {/* Assigned Floor Selector */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={student.assignedFloorId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            onSelectFloorForStudent(student.id, val ? val : undefined);
                          }}
                          className={`text-xs py-1 px-2 rounded-md font-medium border transition-colors ${
                            isAssigned
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <option value="">— Unassigned —</option>
                          {floors.map((fl) => (
                            <option key={fl.id} value={fl.id}>
                              {fl.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Specific Pin / Lock Toggle */}
                    <td className="py-3 px-3 text-right">
                      {isAssigned ? (
                        <button
                          type="button"
                          onClick={() => onToggleSpecificallyAssigned(student.id)}
                          title={
                            student.isSpecificallyAssigned
                              ? 'Individually assigned: Protected from whole-house reassignments. Click to make flexible.'
                              : 'Assigned via house/bulk: Click to lock specifically to this floor.'
                          }
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            student.isSpecificallyAssigned
                              ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Pin
                            className={`w-3 h-3 ${
                              student.isSpecificallyAssigned ? 'rotate-45 text-amber-700' : 'text-slate-400'
                            }`}
                          />
                          <span>{student.isSpecificallyAssigned ? 'Locked' : 'House'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-300 italic">None</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span>
          Showing {filteredStudents.length} of {students.length} students. (Selecting everyone is not compulsory).
        </span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
            <span>Active Target: {activeFloor?.name}</span>
          </span>
          <span className="flex items-center gap-1">
            <Pin className="w-3 h-3 text-amber-600 rotate-45" />
            <span>Specific Locks Protected</span>
          </span>
        </div>
      </div>
    </div>
  );
};
