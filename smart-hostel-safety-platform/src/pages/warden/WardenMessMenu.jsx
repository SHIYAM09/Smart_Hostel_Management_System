import { useState, useMemo } from "react";
import { Edit2, Copy, Send, Utensils, Calendar } from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WardenMessMenu() {
  const { weeklyMessMenu, updateWeeklyMessMenu, showToast } = useHostel();
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [modalOpen, setModalOpen] = useState(false);

  const activeMenu = useMemo(() => {
    return (
      (weeklyMessMenu || []).find(
        (m) =>
          m.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase() ||
          m.day?.toLowerCase() === selectedDay.toLowerCase() ||
          m.dayOfWeek?.toLowerCase() === selectedDay.slice(0, 3).toLowerCase()
      ) || null
    );
  }, [weeklyMessMenu, selectedDay]);

  const [form, setForm] = useState({ ...activeMenu });
  const [errors, setErrors] = useState({});

  const openEditModal = () => {
    setForm({
      breakfast: activeMenu?.breakfast || "",
      lunch: activeMenu?.lunch || "",
      snacks: activeMenu?.snacks || "",
      dinner: activeMenu?.dinner || "",
      specialItem: activeMenu?.specialItem || "",
      notes: activeMenu?.notes || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.breakfast?.trim()) e.breakfast = "Breakfast menu is required";
    if (!form.lunch?.trim()) e.lunch = "Lunch menu is required";
    if (!form.dinner?.trim()) e.dinner = "Dinner menu is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await updateWeeklyMessMenu(selectedDay, form);
    setModalOpen(false);
  };

  const handleDuplicateYesterday = () => {
    const currentIndex = DAYS.indexOf(selectedDay);
    const prevDay = DAYS[(currentIndex - 1 + 7) % 7];
    const prevMenu = (weeklyMessMenu || []).find(
      (m) => m.dayOfWeek?.toLowerCase() === prevDay.toLowerCase() || m.day?.toLowerCase() === prevDay.slice(0, 3).toLowerCase()
    );

    if (prevMenu) {
      const copied = {
        breakfast: prevMenu.breakfast || "",
        lunch: prevMenu.lunch || "",
        snacks: prevMenu.snacks || "",
        dinner: prevMenu.dinner || "",
        specialItem: prevMenu.specialItem || "Standard Item",
        notes: `Copied from ${prevDay}`,
      };
      updateWeeklyMessMenu(selectedDay, copied);
      showToast(`Duplicated ${prevDay}'s menu into ${selectedDay}.`);
    } else {
      showToast(`No existing menu found for ${prevDay}.`, "warning");
    }
  };

  const handlePublishToday = () => {
    updateWeeklyMessMenu(selectedDay, activeMenu);
    showToast(`Published ${selectedDay}'s Mess Menu to Student Portal!`);
  };

  return (
    <div className="space-y-5">
      {/* Day Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={cls(
              "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2",
              selectedDay === d
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-blue-50/50 hover:text-blue-600"
            )}
          >
            <Calendar size={14} />
            {d}
          </button>
        ))}
      </div>

      {/* Main Menu Preview & Controls */}
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{selectedDay}'s Daily Menu</h2>
              <Badge status="active" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Manage meal items served to students for {selectedDay}. Changes sync in real time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleDuplicateYesterday} title="Copy items from previous day">
              <Copy size={15} />
              Duplicate Yesterday
            </Button>
            <Button variant="secondary" onClick={openEditModal}>
              <Edit2 size={15} />
              Edit Menu
            </Button>
            <Button onClick={handlePublishToday}>
              <Send size={15} />
              Publish Menu
            </Button>
          </div>
        </div>

        {/* Meal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Breakfast", icon: "🍳", items: activeMenu?.breakfast, time: "7:30 AM – 9:00 AM", color: "border-amber-100 bg-amber-50/30" },
            { title: "Lunch", icon: "🍱", items: activeMenu?.lunch, time: "12:30 PM – 2:00 PM", color: "border-blue-100 bg-blue-50/30" },
            { title: "Snacks", icon: "☕", items: activeMenu?.snacks, time: "4:30 PM – 5:30 PM", color: "border-orange-100 bg-orange-50/30" },
            { title: "Dinner", icon: "🍲", items: activeMenu?.dinner, time: "8:00 PM – 9:30 PM", color: "border-indigo-100 bg-indigo-50/30" },
          ].map((meal) => (
            <div key={meal.title} className={cls("rounded-2xl border p-5 space-y-3 relative overflow-hidden", meal.color)}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{meal.icon}</span>
                <span className="text-[11px] font-semibold text-gray-500 bg-white/80 px-2 py-0.5 rounded-full border border-gray-100">{meal.time}</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">{meal.title}</h4>
                <p className="text-sm text-gray-700 mt-2 font-medium leading-relaxed">
                  {meal.items || "Not configured"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Special Item & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-3">
            <Utensils size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Special Today's Item</div>
              <div className="text-sm font-semibold text-emerald-900 mt-0.5">{activeMenu?.specialItem || "None"}</div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-3">
            <Calendar size={18} className="text-gray-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Dietary & Warden Notes</div>
              <div className="text-sm text-gray-700 mt-0.5">{activeMenu?.notes || "No special dietary notes."}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Menu Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Edit Menu for ${selectedDay}`}>
        <div className="space-y-4">
          <FormField label="Breakfast Menu" darkMode>
            <Input
              value={form.breakfast || ""}
              onChange={(e) => setForm((f) => ({ ...f, breakfast: e.target.value }))}
              placeholder="e.g. Puri Bhaji, Tea/Coffee"
              darkMode
            />
            {errors.breakfast && <p className="text-xs text-red-400 mt-1">{errors.breakfast}</p>}
          </FormField>
          <FormField label="Lunch Menu" darkMode>
            <Input
              value={form.lunch || ""}
              onChange={(e) => setForm((f) => ({ ...f, lunch: e.target.value }))}
              placeholder="e.g. Rajma Chawal, Chapati, Salad"
              darkMode
            />
            {errors.lunch && <p className="text-xs text-red-400 mt-1">{errors.lunch}</p>}
          </FormField>
          <FormField label="Snacks Menu" darkMode>
            <Input
              value={form.snacks || ""}
              onChange={(e) => setForm((f) => ({ ...f, snacks: e.target.value }))}
              placeholder="e.g. Samosa, Tea"
              darkMode
            />
          </FormField>
          <FormField label="Dinner Menu" darkMode>
            <Input
              value={form.dinner || ""}
              onChange={(e) => setForm((f) => ({ ...f, dinner: e.target.value }))}
              placeholder="e.g. Paneer Masala, Chapati, Rice"
              darkMode
            />
            {errors.dinner && <p className="text-xs text-red-400 mt-1">{errors.dinner}</p>}
          </FormField>
          <FormField label="Special Item" darkMode>
            <Input
              value={form.specialItem || ""}
              onChange={(e) => setForm((f) => ({ ...f, specialItem: e.target.value }))}
              placeholder="e.g. Gulab Jamun / Kheer"
              darkMode
            />
          </FormField>
          <FormField label="Warden Notes" darkMode>
            <Input
              value={form.notes || ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. Special Wednesday Feast"
              darkMode
            />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Menu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
