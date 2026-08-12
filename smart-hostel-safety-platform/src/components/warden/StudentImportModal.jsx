import { useRef, useState } from "react";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";
import { parseStudentsFromExcel } from "../../utils/excelParser";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

export function StudentImportModal({ open, onClose, onImport }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setFileName("");
    setErrors([]);
    setPreview([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file) => {
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      setErrors(["Please upload a valid Excel file (.xlsx or .xls)."]);
      setPreview([]);
      setFileName("");
      return;
    }

    setLoading(true);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const { students, errors: parseErrors } = parseStudentsFromExcel(buffer);
      setPreview(students);
      setErrors(parseErrors);
    } catch {
      setPreview([]);
      setErrors(["Could not read the Excel file. Please check the format and try again."]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!preview.length) return;
    onImport(preview);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import Students" wide>
      <div className="space-y-4">
        <div
          className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Upload size={24} className="text-white/70" />
          </div>
          <div className="font-bold text-white text-sm">Upload Excel File</div>
          <div className="text-xs text-white/50 mt-1">Supports .xlsx and .xls</div>
          {fileName && (
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-blue-300 font-semibold bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              <FileSpreadsheet size={14} />
              {fileName}
            </div>
          )}
        </div>

        <div className="text-xs text-white/60 bg-white/5 rounded-xl p-3">
          Expected columns: <strong className="text-white">Name</strong>, <strong className="text-white">Roll No</strong>, Room, Course, Year, Phone, Email
        </div>

        {errors.length > 0 && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 space-y-1">
            {errors.map((err) => (
              <div key={err} className="flex items-start gap-2 text-xs text-amber-300">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                {err}
              </div>
            ))}
          </div>
        )}

        {preview.length > 0 && (
          <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-white/5 text-xs font-bold text-white/70 uppercase">
              Preview — {preview.length} student(s) ready to import
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-white/10">
              {preview.slice(0, 8).map((s) => (
                <div key={s.id} className="px-4 py-2 flex justify-between text-sm">
                  <span className="font-semibold text-white">{s.name}</span>
                  <span className="text-white/50 font-mono text-xs">{s.rollNo} · {s.room}</span>
                </div>
              ))}
              {preview.length > 8 && (
                <div className="px-4 py-2 text-xs text-white/40">+{preview.length - 8} more</div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            className="flex-1"
            disabled={!preview.length || loading}
          >
            Import {preview.length ? `${preview.length} Students` : "Students"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
