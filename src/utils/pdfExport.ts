import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Floor, Student } from '../types';

interface ExportPdfOptions {
  title?: string;
  academicYear?: string;
  notes?: string;
  includeUnassigned?: boolean;
}

export function exportFloorAssignmentsPdf(
  floors: Floor[],
  students: Student[],
  options: ExportPdfOptions = {}
) {
  const {
    title = 'STUDENT COUNCIL FLOOR DUTY ROSTER',
    academicYear = new Date().getFullYear() + ' - ' + (new Date().getFullYear() + 1),
    notes = 'Note: Student leaders must report to their assigned floors promptly at the start of break and dispersal.',
    includeUnassigned = false,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Document Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(title, pageWidth / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  const dateStr = `Date of Issue: ${new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} | Academic Session: ${academicYear}`;
  doc.text(dateStr, pageWidth / 2, 22, { align: 'center' });

  // Thin separator rule
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 25, pageWidth - 14, 25);

  let currentY = 29;

  // Filter assigned students
  const assignedStudents = students.filter((s) => s.assignedFloorId);
  const unassignedStudents = students.filter((s) => !s.assignedFloorId);

  // Summary banner line
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Assigned: ${assignedStudents.length} / ${students.length} Student Leaders | Configured Floors: ${floors.length}`,
    14,
    currentY
  );
  currentY += 6;

  // Loop through each floor
  floors.forEach((floor, floorIndex) => {
    const floorStudents = students.filter((s) => s.assignedFloorId === floor.id);

    // Floor section heading
    // Check if we need a new page
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(14, currentY, pageWidth - 28, 8, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`${floor.name.toUpperCase()}`, 18, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`${floorStudents.length} assigned`, pageWidth - 20, currentY + 5.5, { align: 'right' });

    currentY += 10;

    if (floorStudents.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('(No students assigned to this floor)', 18, currentY + 4);
      currentY += 8;
    } else {
      const tableData = floorStudents.map((s, idx) => [
        (idx + 1).toString(),
        s.name,
        s.class,
        s.house,
        s.post,
        s.isSpecificallyAssigned ? 'Individual Assign' : 'House Assign',
        '', // Signature blank space
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['S.NO', 'STUDENT NAME', 'CLASS', 'HOUSE', 'DESIGNATION / POST', 'ASSIGN TYPE', 'SIGNATURE']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: 2.2,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
          cellPadding: 2,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 42, fontStyle: 'bold' },
          2: { cellWidth: 22 },
          3: { cellWidth: 28 },
          4: { cellWidth: 42 },
          5: { cellWidth: 24, fontSize: 7, textColor: [100, 116, 139] },
          6: { cellWidth: 16 },
        },
        margin: { left: 14, right: 14 },
      });

      // Get last autoTable end position
      // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
      currentY = doc.lastAutoTable.finalY + 6;
    }
  });

  // Optional: Unassigned list section
  if (includeUnassigned && unassignedStudents.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(254, 243, 199); // amber-100
    doc.roundedRect(14, currentY, pageWidth - 28, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text(`UNASSIGNED / RESERVES (${unassignedStudents.length})`, 18, currentY + 5.5);
    currentY += 10;

    const unassignedData = unassignedStudents.map((s, idx) => [
      (idx + 1).toString(),
      s.name,
      s.class,
      s.house,
      s.post,
      'Available / Reserve',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['S.NO', 'STUDENT NAME', 'CLASS', 'HOUSE', 'DESIGNATION / POST', 'STATUS']],
      body: unassignedData,
      theme: 'plain',
      headStyles: {
        fillColor: [217, 119, 6],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [75, 85, 99],
        cellPadding: 1.8,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 46 },
        2: { cellWidth: 24 },
        3: { cellWidth: 32 },
        4: { cellWidth: 46 },
        5: { cellWidth: 26 },
      },
      margin: { left: 14, right: 14 },
    });

    // @ts-expect-error autoTable adds lastAutoTable to doc
    currentY = doc.lastAutoTable.finalY + 6;
  }

  // Footer notes and signature lines
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 16;
  }

  if (notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(notes, 14, currentY);
    currentY += 10;
  }

  // Signature Block
  const sigY = Math.max(currentY + 6, pageHeight - 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.line(14, sigY, 65, sigY);
  doc.text('Prefect / Incharge Signature', 14, sigY + 4);

  doc.line(pageWidth / 2 - 25, sigY, pageWidth / 2 + 25, sigY);
  doc.text('Discipline Incharge', pageWidth / 2, sigY + 4, { align: 'center' });

  doc.line(pageWidth - 65, sigY, pageWidth - 14, sigY);
  doc.text('Principal / Vice-Principal', pageWidth - 14, sigY + 4, { align: 'right' });

  const fileName = `Floor_Duty_Assignments_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
