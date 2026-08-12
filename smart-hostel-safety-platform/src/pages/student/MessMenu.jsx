import { useState } from "react";
import { AlertCircle, Star, Utensils, Calendar, CheckCircle2, MessageSquare, Send } from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Button } from "../../components/common/Button";
import { getIndianDateStr } from "../../utils/dateUtils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MessMenu() {
  const { weeklyMessMenu, messData, messFeedback, averageMessRatings, submitMessRating } = useHostel();
  const currentDayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [selectedDay, setSelectedDay] = useState(currentDayName);
  const [ratings, setRatings] = useState({ breakfast: 5, lunch: 5, snacks: 4, dinner: 5 });
  const [comments, setComments] = useState({ breakfast: "", lunch: "", snacks: "", dinner: "" });
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const activeMenu = weeklyMessMenu?.find(
    (m) => m.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase() || m.day?.toLowerCase() === selectedDay.slice(0, 3).toLowerCase()
  ) || null;

  const todayStr = getIndianDateStr();

  const getExistingRating = (mealType) => {
    return (messFeedback || []).find((f) => {
      const fMeal = String(f.mealType || f.meal || "").toUpperCase();
      const targetMeal = String(mealType).toUpperCase();
      if (fMeal !== targetMeal) return false;

      const rawDate = f.date || f.createdAt || f.submittedAt || f.logDate;
      if (!rawDate) return false;

      const fDateStr = String(rawDate).slice(0, 10);
      return fDateStr === todayStr;
    });
  };

  const allMealKeys = ["breakfast", "lunch", "snacks", "dinner"];
  const unratedMeals = allMealKeys.filter((key) => !getExistingRating(key));
  const isAllRatedToday = (unratedMeals.length === 0) || justSubmitted;

  const handleSubmitAllRatings = async () => {
    if (isAllRatedToday || submitting) return;
    setSubmitting(true);
    try {
      for (const key of unratedMeals) {
        const r = ratings[key] ?? 5;
        const c = comments[key] || "";
        await submitMessRating(key, r, c);
      }
      setJustSubmitted(true);
    } catch (err) {
      console.error("Failed to submit all mess ratings:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const mealsList = activeMenu ? [
    { title: "breakfast", key: "breakfast", items: activeMenu.breakfast ? activeMenu.breakfast.split(",") : [] },
    { title: "lunch", key: "lunch", items: activeMenu.lunch ? activeMenu.lunch.split(",") : [] },
    { title: "snacks", key: "snacks", items: activeMenu.snacks ? activeMenu.snacks.split(",") : [] },
    { title: "dinner", key: "dinner", items: activeMenu.dinner ? activeMenu.dinner.split(",") : [] },
  ] : [];

  return (
    <div className="space-y-5">
      {/* Day Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={cls(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5",
              selectedDay === d
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <Calendar size={13} />
            {d} {d === currentDayName && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold ml-1">Today</span>}
          </button>
        ))}
      </div>

      {/* Overview Satisfaction Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["breakfast", "lunch", "snacks", "dinner"].map((m) => (
          <div key={m} className="bg-white rounded-xl border border-blue-50 p-4 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-lg font-bold text-gray-900">{averageMessRatings[m] ?? "0.0"}</span>
              <span className="text-xs text-gray-400">/5</span>
            </div>
            <div className="text-xs font-semibold text-gray-500 capitalize">{m} Avg Rating</div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-sm text-amber-800">
        <div className="flex items-center gap-3">
          <AlertCircle size={16} className="shrink-0 text-amber-600" />
          <span>Today's mess wastage: <strong>{messData[0]?.wastageKg || 4.2} kg</strong> — Monitored live via Mess Analytics.</span>
        </div>
        {activeMenu?.specialItem && (
          <span className="bg-amber-200/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold shrink-0">
            ★ Special: {activeMenu.specialItem}
          </span>
        )}
      </div>

      {!activeMenu ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
          <Utensils className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="font-semibold text-base">No menu available for {selectedDay}.</p>
          <p className="text-xs text-gray-400 mt-1">The warden has not published a menu for this day yet.</p>
        </div>
      ) : null}

      {/* Meal Items & Interactive Rating Cards */}
      {mealsList.map((meal) => {
        const existingRating = getExistingRating(meal.key);
        const isRatedToday = (!!existingRating || justSubmitted) && selectedDay === currentDayName;

        return (
          <div key={meal.title} className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden space-y-0">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils size={15} className="text-white" />
                <h3 className="font-bold text-white text-base capitalize">{meal.title} Menu ({selectedDay})</h3>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-xs font-semibold text-yellow-300">
                <Star size={13} className="fill-yellow-300 text-yellow-300" />
                <span>Avg: {averageMessRatings[meal.key] ?? "0.0"}</span>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {meal.items.map((i, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                  <span className="font-medium">{i.trim()}</span>
                </div>
              ))}
            </div>

            {/* Interactive Rating Section (Only enabled for Today) */}
            {selectedDay === currentDayName && (
              <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {isRatedToday ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 w-full">
                    <CheckCircle2 size={16} />
                    <span>Already Rated ({existingRating?.rating || ratings[meal.key]}★) Today</span>
                    {(existingRating?.comment || comments[meal.key]) && (
                      <span className="text-xs text-emerald-600 font-normal italic">"{existingRating?.comment || comments[meal.key]}"</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Rate {meal.title}:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRatings((r) => ({ ...r, [meal.key]: s }))}
                            className="transition-transform hover:scale-125 p-1"
                          >
                            <Star
                              size={18}
                              className={cls(
                                "transition-colors",
                                (ratings[meal.key] ?? 5) >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
                      <div className="relative flex-1">
                        <MessageSquare size={14} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          maxLength={200}
                          value={comments[meal.key] || ""}
                          onChange={(e) => setComments((c) => ({ ...c, [meal.key]: e.target.value }))}
                          placeholder="Optional feedback (max 200 chars)..."
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Single Unified Submit Button Section for Today's Mess Feedback */}
      {selectedDay === currentDayName && activeMenu && (
        <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Send size={18} className="text-blue-600" />
              Submit Today's Mess Feedback
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {isAllRatedToday
                ? "All mess ratings for today have been submitted and locked."
                : `Rate your meals above and click submit. (${unratedMeals.length} meal(s) pending submit)`}
            </p>
          </div>
          <Button
            size="lg"
            disabled={isAllRatedToday || submitting}
            onClick={handleSubmitAllRatings}
            className={cls(
              "w-full sm:w-auto px-8 transition-all",
              isAllRatedToday ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {submitting
              ? "Submitting Ratings..."
              : isAllRatedToday
              ? "All Ratings Submitted"
              : "Submit All Ratings"}
          </Button>
        </div>
      )}
    </div>
  );
}
