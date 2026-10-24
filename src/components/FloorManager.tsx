import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ShieldAlert, Check, Layers, ChevronRight, Sparkles } from 'lucide-react';
import { Floor, House, Student } from '../types';
import { HOUSES, HOUSE_COLORS } from '../data/initialStudents';

interface FloorManagerProps {
  floors: Floor[];
  activeFloorId: string;
  onSelectActiveFloor: (floorId: string) => void;
  onAddFloor: (name?: string) => void;
  onDeleteFloor: (floorId: string) => void;
  onRenameFloor: (floorId: string, newName: string) => void;
  students: Student[];
  onAssignWholeHouse: (house: House, targetFloorId: string) => void;
  lastHouseAssignMessage: string | null;
}

export const FloorManager: React.FC<FloorManagerProps> = ({
  floors,
  activeFloorId,
  onSelectActiveFloor,
  onAddFloor,
  onDeleteFloor,
  onRenameFloor,
  students,
  onAssignWholeHouse,
  lastHouseAssignMessage,
}) => {
  const [isAddingFloor, setIsAddingFloor] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeFloor = floors.find((f) => f.id === activeFloorId) || floors[0];

  const handleCreateFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFloorName.trim()) {
      onAddFloor(newFloorName.trim());
      setNewFloorName('');
      setIsAddingFloor(false);
    } else {
      // Default auto-increment name
      const floorCount = floors.length;
      const defaultName = floorCount === 0 ? 'Ground Floor' : `${floorCount}th Floor`;
      onAddFloor(defaultName);
      setIsAddingFloor(false);
    }
  };

  const handleStartRename = (floor: Floor) => {
    setEditingFloorId(floor.id);
    setEditingName(floor.name);
  };

  const handleSaveRename = (floorId: string) => {
    if (editingName.trim()) {
      onRenameFloor(floorId, editingName.trim());
    }
    setEditingFloorId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-6">
      {/* Floors Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Configure School Floors</h2>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
              {floors.length} Floors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a floor to make it the active target for one-click student & house assignment.
          </p>
        </div>

        {/* Add floor actions */}
        <div className="flex items-center gap-2">
          {isAddingFloor ? (
            <form onSubmit={handleCreateFloor} className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                placeholder="e.g. 4th Floor / Basement"
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingFloor(false)}
                className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                const nextNum = floors.length;
                let defaultSuggestion = '';
                if (nextNum === 0) defaultSuggestion = 'Ground Floor';
                else if (nextNum === 1) defaultSuggestion = '1st Floor';
                else if (nextNum === 2) defaultSuggestion = '2nd Floor';
                else if (nextNum === 3) defaultSuggestion = '3rd Floor';
                else defaultSuggestion = `${nextNum}th Floor`;
                setNewFloorName(defaultSuggestion);
                setIsAddingFloor(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Floor</span>
            </button>
          )}
        </div>
      </div>

      {/* Floor selection tabs / pills */}
      <div className="pt-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
          Current Target Floor (Selected for assignments):
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {floors.map((floor) => {
            const count = students.filter((s) => s.assignedFloorId === floor.id).length;
            const isActive = floor.id === activeFloorId;

            return (
              <div
                key={floor.id}
                onClick={() => onSelectActiveFloor(floor.id)}
                className={`relative group rounded-xl p-3 border transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      FL
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />}
                  </div>

                  {/* Actions: Rename / Delete */}
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleStartRename(floor)}
                      title="Rename floor"
                      className={`p-1 rounded hover:bg-black/10 transition-colors ${
                        isActive ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {floors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteFloor(floor.id)}
                        title="Delete floor"
                        className={`p-1 rounded hover:bg-red-500/20 transition-colors ${
                          isActive ? 'text-rose-300 hover:text-rose-200' : 'text-slate-400 hover:text-rose-600'
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {editingFloorId === floor.id ? (
                  <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(floor.id);
                        if (e.key === 'Escape') setEditingFloorId(null);
                      }}
                      onBlur={() => handleSaveRename(floor.id)}
                      autoFocus
                      className="w-full text-xs font-semibold px-1 py-0.5 text-slate-900 bg-white rounded border border-slate-300 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="font-semibold text-xs truncate" title={floor.name}>
                    {floor.name}
                  </div>
                )}

                <div
                  className={`text-[11px] mt-1 flex items-center justify-between ${
                    isActive ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  <span>Assigned:</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded-full ${
                      count > 0
                        ? isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isActive
                        ? 'text-slate-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Whole House Quick Assign Banner */}
      <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Whole House Quick Assignment
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigns an entire house to <strong className="text-slate-900">{activeFloor?.name || 'Selected Floor'}</strong>.
              Students you specifically selected on a floor will <span className="underline decoration-amber-400 underline-offset-2">never</span> be moved.
            </p>
          </div>

          {lastHouseAssignMessage && (
            <div className="text-xs px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg animate-in fade-in">
              {lastHouseAssignMessage}
            </div>
          )}
        </div>

        {/* Buttons for each house */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {HOUSES.map((house) => {
            const houseStudents = students.filter((s) => s.house === house);
            const specificallyAssigned = houseStudents.filter((s) => s.isSpecificallyAssigned);
            const onActiveFloor = houseStudents.filter((s) => s.assignedFloorId === activeFloorId);
            const theme = HOUSE_COLORS[house] || {
              bg: 'bg-slate-100 text-slate-800',
              border: 'border-slate-200',
            };

            return (
              <div
                key={house}
                className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.bg} ${theme.border}`}
                    >
                      {house}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {houseStudents.length} members
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                    <div className="flex justify-between">
                      <span>On {activeFloor?.name}:</span>
                      <strong className="text-slate-700">{onActiveFloor.length}</strong>
                    </div>
                    {specificallyAssigned.length > 0 && (
                      <div className="flex justify-between text-amber-700">
                        <span title="Preserved on their chosen floors">Individually fixed:</span>
                        <strong>{specificallyAssigned.length}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAssignWholeHouse(house, activeFloorId)}
                  className="mt-3 w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Assign to {activeFloor?.name}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
