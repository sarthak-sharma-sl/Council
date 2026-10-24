/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Floor, FilterOptions, Student, House } from './types';
import { INITIAL_FLOORS, INITIAL_STUDENTS } from './data/initialStudents';
import { Header } from './components/Header';
import { FloorManager } from './components/FloorManager';
import { StudentCatalogue } from './components/StudentCatalogue';
import { FloorSummaryView } from './components/FloorSummaryView';
import { PdfModal } from './components/PdfModal';
import { Users, LayoutList, Building2 } from 'lucide-react';

const STORAGE_KEYS = {
  FLOORS: 'floor_duty_floors_v2',
  STUDENTS: 'floor_duty_students_v2',
  ACTIVE_FLOOR: 'floor_duty_active_floor_v2',
};

export default function App() {
  // Load persistent or default state
  const [floors, setFloors] = useState<Floor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FLOORS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FLOORS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDENTS;
  });

  const [activeFloorId, setActiveFloorId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_FLOOR);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FLOORS[0].id;
  });

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    floorFilter: 'ALL',
    designationFilter: 'ALL',
    houseFilter: 'ALL',
  });

  const [lastHouseAssignMessage, setLastHouseAssignMessage] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalogue' | 'summary' | 'both'>('catalogue');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FLOORS, JSON.stringify(floors));
    } catch (e) {
      console.error(e);
    }
  }, [floors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_FLOOR, activeFloorId);
    } catch (e) {
      console.error(e);
    }
  }, [activeFloorId]);

  // Ensure active floor exists
  useEffect(() => {
    if (floors.length > 0 && !floors.some((f) => f.id === activeFloorId)) {
      setActiveFloorId(floors[0].id);
    }
  }, [floors, activeFloorId]);

  // 1. Floor Management
  const handleAddFloor = (name?: string) => {
    const nextOrder = floors.length;
    const defaultName = name || `${nextOrder}th Floor`;
    const newFloor: Floor = {
      id: `floor-${Date.now()}`,
      name: defaultName,
      order: nextOrder,
    };
    setFloors((prev) => [...prev, newFloor]);
    setActiveFloorId(newFloor.id);
  };

  const handleDeleteFloor = (floorId: string) => {
    if (floors.length <= 1) return;
    const floorToDelete = floors.find((f) => f.id === floorId);
    const confirmDelete = window.confirm(
      `Delete "${floorToDelete?.name}"? Any students assigned to this floor will be unassigned.`
    );
    if (!confirmDelete) return;

    // Unassign students from this floor
    setStudents((prev) =>
      prev.map((s) =>
        s.assignedFloorId === floorId
          ? { ...s, assignedFloorId: undefined, isSpecificallyAssigned: false }
          : s
      )
    );

    const remaining = floors.filter((f) => f.id !== floorId);
    setFloors(remaining);
    if (activeFloorId === floorId) {
      setActiveFloorId(remaining[0].id);
    }
  };

  const handleRenameFloor = (floorId: string, newName: string) => {
    setFloors((prev) =>
      prev.map((f) => (f.id === floorId ? { ...f, name: newName } : f))
    );
  };

  // 2. Student Assignment by Individual Checkbox
  const handleToggleStudentAssign = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        // If currently on the active floor, uncheck/unassign
        if (student.assignedFloorId === activeFloorId) {
          return {
            ...student,
            assignedFloorId: undefined,
            isSpecificallyAssigned: false,
          };
        }

        // Otherwise assign to active floor, mark as specifically chosen
        return {
          ...student,
          assignedFloorId: activeFloorId,
          isSpecificallyAssigned: true,
        };
      })
    );
  };

  // 3. Directly Select Floor for Student from row dropdown
  const handleSelectFloorForStudent = (studentId: string, floorId: string | undefined) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;
        return {
          ...student,
          assignedFloorId: floorId,
          isSpecificallyAssigned: !!floorId,
        };
      })
    );
  };

  // 4. Toggle Specifically Assigned Lock
  const handleToggleSpecificallyAssigned = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;
        return {
          ...student,
          isSpecificallyAssigned: !student.isSpecificallyAssigned,
        };
      })
    );
  };

  // 5. Whole House Assignment
  // "assigns a whole house to a floor but not those from them who I have specifically selected to be on some floor"
  const handleAssignWholeHouse = (house: House, targetFloorId: string) => {
    const targetFloor = floors.find((f) => f.id === targetFloorId);
    const targetFloorName = targetFloor?.name || 'Selected Floor';

    let assignedCount = 0;
    let preservedCount = 0;

    setStudents((prev) =>
      prev.map((student) => {
        if (student.house !== house) return student;

        // If specifically assigned to a floor and it's DIFFERENT from targetFloorId, PRESERVE them!
        if (student.isSpecificallyAssigned && student.assignedFloorId && student.assignedFloorId !== targetFloorId) {
          preservedCount++;
          return student; // Leave untouched
        }

        // Otherwise assign to target floor
        assignedCount++;
        return {
          ...student,
          assignedFloorId: targetFloorId,
          // Remains false or non-specifically locked so whole-house reassignments can adjust them later
          isSpecificallyAssigned: false,
        };
      })
    );

    const msg =
      preservedCount > 0
        ? `Assigned ${assignedCount} member(s) of ${house} to ${targetFloorName} (${preservedCount} preserved on other floors as individually assigned).`
        : `Assigned all ${assignedCount} member(s) of ${house} to ${targetFloorName}.`;

    setLastHouseAssignMessage(msg);
    setTimeout(() => {
      setLastHouseAssignMessage(null);
    }, 6000);
  };

  // 6. Bulk actions on filtered students
  const handleBulkAssignFiltered = (targetFloorId: string) => {
    const targetFloor = floors.find((f) => f.id === targetFloorId);
    setStudents((prev) =>
      prev.map((student) => {
        // Check if student matches current filters
        const matchesQuery =
          !filters.searchQuery.trim() ||
          student.name.toLowerCase().includes(filters.searchQuery.toLowerCase().trim()) ||
          student.post.toLowerCase().includes(filters.searchQuery.toLowerCase().trim()) ||
          student.class.toLowerCase().includes(filters.searchQuery.toLowerCase().trim());

        const matchesFloor =
          filters.floorFilter === 'ALL' ||
          (filters.floorFilter === 'UNASSIGNED' && !student.assignedFloorId) ||
          (filters.floorFilter === 'ASSIGNED' && !!student.assignedFloorId) ||
          student.assignedFloorId === filters.floorFilter;

        const matchesDesignation =
          filters.designationFilter === 'ALL' || student.post === filters.designationFilter;

        const matchesHouse =
          filters.houseFilter === 'ALL' || student.house === filters.houseFilter;

        if (matchesQuery && matchesFloor && matchesDesignation && matchesHouse) {
          return {
            ...student,
            assignedFloorId: targetFloorId,
            isSpecificallyAssigned: true,
          };
        }
        return student;
      })
    );
  };

  const handleBulkUnassignFiltered = () => {
    setStudents((prev) =>
      prev.map((student) => {
        const matchesQuery =
          !filters.searchQuery.trim() ||
          student.name.toLowerCase().includes(filters.searchQuery.toLowerCase().trim()) ||
          student.post.toLowerCase().includes(filters.searchQuery.toLowerCase().trim()) ||
          student.class.toLowerCase().includes(filters.searchQuery.toLowerCase().trim());

        const matchesFloor =
          filters.floorFilter === 'ALL' ||
          (filters.floorFilter === 'UNASSIGNED' && !student.assignedFloorId) ||
          (filters.floorFilter === 'ASSIGNED' && !!student.assignedFloorId) ||
          student.assignedFloorId === filters.floorFilter;

        const matchesDesignation =
          filters.designationFilter === 'ALL' || student.post === filters.designationFilter;

        const matchesHouse =
          filters.houseFilter === 'ALL' || student.house === filters.houseFilter;

        if (matchesQuery && matchesFloor && matchesDesignation && matchesHouse) {
          return {
            ...student,
            assignedFloorId: undefined,
            isSpecificallyAssigned: false,
          };
        }
        return student;
      })
    );
  };

  // 7. Clear specific floor
  const handleClearFloor = (floorId: string) => {
    const floor = floors.find((f) => f.id === floorId);
    if (!window.confirm(`Unassign all students currently on ${floor?.name}?`)) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.assignedFloorId === floorId
          ? { ...s, assignedFloorId: undefined, isSpecificallyAssigned: false }
          : s
      )
    );
  };

  // 8. Reset all assignments
  const handleResetAssignments = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all student floor assignments? (Floors will be kept).'
      )
    ) {
      setStudents((prev) =>
        prev.map((s) => ({
          ...s,
          assignedFloorId: undefined,
          isSpecificallyAssigned: false,
        }))
      );
      setLastHouseAssignMessage('All floor assignments have been cleared.');
      setTimeout(() => setLastHouseAssignMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Navigation & Action Header */}
      <Header
        floors={floors}
        students={students}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onResetAssignments={handleResetAssignments}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Floor Configuration & Whole House Quick Assignment */}
        <FloorManager
          floors={floors}
          activeFloorId={activeFloorId}
          onSelectActiveFloor={setActiveFloorId}
          onAddFloor={handleAddFloor}
          onDeleteFloor={handleDeleteFloor}
          onRenameFloor={handleRenameFloor}
          students={students}
          onAssignWholeHouse={handleAssignWholeHouse}
          lastHouseAssignMessage={lastHouseAssignMessage}
        />

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('catalogue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'catalogue'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Student Catalogue & Filters</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Floor Deployment Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Combined View</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            Target Active Floor: <strong className="text-slate-900">{floors.find((f) => f.id === activeFloorId)?.name}</strong>
          </div>
        </div>

        {/* Content based on Active Tab */}
        {(activeTab === 'catalogue' || activeTab === 'both') && (
          <StudentCatalogue
            students={students}
            floors={floors}
            activeFloorId={activeFloorId}
            filters={filters}
            onUpdateFilters={(newFilters) =>
              setFilters((prev) => ({ ...prev, ...newFilters }))
            }
            onToggleStudentAssign={handleToggleStudentAssign}
            onSelectFloorForStudent={handleSelectFloorForStudent}
            onToggleSpecificallyAssigned={handleToggleSpecificallyAssigned}
            onBulkAssignFiltered={handleBulkAssignFiltered}
            onBulkUnassignFiltered={handleBulkUnassignFiltered}
          />
        )}

        {(activeTab === 'summary' || activeTab === 'both') && (
          <FloorSummaryView
            floors={floors}
            students={students}
            onRemoveStudentFromFloor={(studentId) =>
              handleSelectFloorForStudent(studentId, undefined)
            }
            onMoveStudentToFloor={(studentId, targetFloorId) =>
              handleSelectFloorForStudent(studentId, targetFloorId)
            }
            onClearFloor={handleClearFloor}
            activeFloorId={activeFloorId}
            onSelectActiveFloor={setActiveFloorId}
          />
        )}
      </main>

      {/* PDF Export Modal */}
      <PdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        floors={floors}
        students={students}
      />
    </div>
  );
}
