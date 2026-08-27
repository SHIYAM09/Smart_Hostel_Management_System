import { useState, useEffect } from "react";
import { AlertCircle, Star, Utensils, Calendar, CheckCircle2, MessageSquare, Send } from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Button } from "../../components/common/Button";
import { getIndianDateStr } from "../../utils/dateUtils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MessMenu() {
  const { weeklyMessMenu, messData, messFeedback, averageMessRatings, submitMessRating, refreshMessMenu } = useHostel();

  useEffect(() => {
    refreshMessMenu();
  }, [refreshMessMenu]);

  const currentDayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [selectedDay, setSelectedDay] = useState(currentDayName);
  const [ratings, setRatings] = useState({ breakfast: 5, lunch: 5, snacks: 4, dinner: 5 });
  const [comments, setComments] = useState({ breakfast: "", lunch: "", snacks: "", dinner: "" });
  const [submittingMeals, setSubmittingMeals] = useState({ breakfast: false, lunch: false, snacks: false, dinner: false });
  const [submittedMeals, setSubmittedMeals] = useState({ breakfast: false, lunch: false, snacks: false, dinner: false });

  const activeMenu = weeklyMessMenu?.find(
    (m) => m.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase() || m.day?.toLowerCase() === selectedDay.slice(0, 3).toLowerCase()
  ) || null;

  const todayStr = getIndianDateStr();

  const getExistingRating = (mealType) => {
    return (messFeedback || []).find((f) => {
      const fMeal = String(f.mealType || f.meal || "").toUpperCase();
      const targetMeal = String(mealType).toUpperCase();
      const rawDate = f.date || f.createdAt || f.submittedAt || f.logDate;
      const fDateStr = rawDate ? String(rawDate).slice(0, 10) : "";

      const isDateMatch = !fDateStr || fDateStr === todayStr;

      if (isDateMatch) {
        if (fMeal === targetMeal) return f;
        if (targetMeal === "SNACKS" && (fMeal === "SNACK" || fMeal === "SNACKS")) return f;
        if (targetMeal === "SNACK" && (fMeal === "SNACK" || fMeal === "SNACKS")) return f;

        const bulkRating = f[`${mealType}Rating`] ?? f.snacksRating ?? f.snackRating;
        if (bulkRating !== undefined && bulkRating !== null && Number(bulkRating) > 0) {
          return f;
        }
      }
      return null;
    });
  };

  const handleMealSubmit = async (mealKey) => {
    if (submittingMeals[mealKey]) return;
    const existing = getExistingRating(mealKey);
    if (existing || submittedMeals[mealKey]) return;

    setSubmittingMeals((prev) => ({ ...prev, [mealKey]: true }));
    try {
      const ratingVal = ratings[mealKey] ?? 5;
      const commentVal = (comments[mealKey] || "").trim();

      await submitMessRating(mealKey.toUpperCase(), ratingVal, commentVal);
      setSubmittedMeals((prev) => ({ ...prev, [mealKey]: true }));
    } catch (err) {
      console.error(`Failed to submit ${mealKey} rating:`, err);
    } finally {
      setSubmittingMeals((prev) => ({ ...prev, [mealKey]: false }));
    }
  };

  const mealsList = activeMenu ? [
    { title: "breakfast", key: "breakfast", items: activeMenu.breakfast ? activeMenu.breakfast.split(",") : [] },
    { title: "lunch", key: "lunch", items: activeMenu.lunch ? activeMenu.lunch.split(",") : [] },
    { title: "snacks", key: "snacks", items: activeMenu.snacks ? activeMenu.snacks.split(",") : [] },
    { title: "dinner", key: "dinner", items: activeMenu.dinner ? activeMenu.dinner.split(",") : [] },
  ] : [];

  const ratedCount = mealsList.filter((m) => getExistingRating(m.key) || submittedMeals[m.key]).length;

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
        const isMealRated = (Boolean(existingRating) || Boolean(submittedMeals[meal.key])) && selectedDay === currentDayName;
        const isSubmitting = Boolean(submittingMeals[meal.key]);

        const currentDisplayRating = isMealRated
          ? Number(existingRating?.rating || existingRating?.[`${meal.key}Rating`] || ratings[meal.key] || 5)
          : (ratings[meal.key] ?? 5);

        const currentDisplayComment = isMealRated
          ? String(existingRating?.comment || existingRating?.comments || existingRating?.remarks || existingRating?.[`${meal.key}Comment`] || comments[meal.key] || "")
          : (comments[meal.key] || "");

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
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide shrink-0">
                      Rate {meal.title}:
                    </span>
                    {isMealRated && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Already Rated
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={isMealRated || isSubmitting}
                        onClick={() => setRatings((r) => ({ ...r, [meal.key]: s }))}
                        className={cls(
                          "transition-transform p-1",
                          isMealRated ? "cursor-not-allowed opacity-80" : "hover:scale-125"
                        )}
                      >
                        <Star
                          size={18}
                          className={cls(
                            "transition-colors",
                            currentDisplayRating >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
                  <div className="relative flex-1">
                    <MessageSquare size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      maxLength={200}
                      disabled={isMealRated || isSubmitting}
                      value={currentDisplayComment}
                      onChange={(e) => setComments((c) => ({ ...c, [meal.key]: e.target.value }))}
                      placeholder={isMealRated ? "Feedback submitted" : `Optional ${meal.title} feedback...`}
                      className={cls(
                        "w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none transition-all",
                        isMealRated
                          ? "bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed italic"
                          : "bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      )}
                    />
                  </div>

                  <Button
                    size="sm"
                    disabled={isMealRated || isSubmitting}
                    onClick={() => handleMealSubmit(meal.key)}
                    className={cls(
                      "px-5 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 min-w-[130px]",
                      isMealRated
                        ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed shadow-none"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    )}
                  >
                    {isMealRated ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Submitted</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>{isSubmitting ? "Submitting..." : `Submit ${meal.title.charAt(0).toUpperCase() + meal.title.slice(1)}`}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Overview Status Bar for Today */}
      {selectedDay === currentDayName && activeMenu && (
        <div className="bg-white rounded-2xl border border-blue-50 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Today's Mess Feedback Progress
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {ratedCount === mealsList.length
                ? "All mess meal ratings for today have been submitted and locked."
                : `${ratedCount} of ${mealsList.length} meal(s) rated. Submit feedback for each meal individually above.`}
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl">
            {ratedCount} / {mealsList.length} Completed
          </div>
        </div>
      )}
    </div>
  );
}

