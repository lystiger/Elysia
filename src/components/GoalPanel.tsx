import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Flag, Plus, Target } from "lucide-react";
import clsx from "clsx";
import { useProductivityStore, Goal } from "../state/productivityStore";

export function GoalPanel() {
  const { goals, loadGoals, addGoal, toggleGoalStatus, isLoading } = useProductivityStore();
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [category, setCategory] = useState<Goal["category"]>("daily");

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) return;
    await addGoal({
      title: newGoalTitle,
      category,
      priority: "medium",
    });
    setNewGoalTitle("");
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-black/20 p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Target className="size-5 text-cyan-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Mission Objectives</h3>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500">
          {completedGoals.length}/{goals.length} Complete
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
          placeholder="Add new objective..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-500/50 transition"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Goal["category"])}
          className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs outline-none"
        >
          <option value="daily">Daily</option>
          <option value="long-term">Long-term</option>
        </select>
        <button
          onClick={handleAddGoal}
          className="p-2 bg-cyan-500/20 text-cyan-200 rounded-xl border border-cyan-500/30 hover:bg-cyan-500/30"
        >
          <Plus className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500 text-sm italic">Loading objectives...</div>
        ) : activeGoals.length === 0 && completedGoals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm italic">No active objectives.</div>
        ) : (
          <>
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="group flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition"
              >
                <button
                  onClick={() => toggleGoalStatus(goal.id)}
                  className="text-slate-500 hover:text-cyan-400 transition"
                >
                  <Circle className="size-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{goal.title}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-tighter text-slate-500 flex items-center gap-1">
                      <Flag className="size-2" /> {goal.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {completedGoals.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 opacity-50">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 px-2">Completed</p>
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-black/20"
                  >
                    <button
                      onClick={() => toggleGoalStatus(goal.id)}
                      className="text-cyan-400"
                    >
                      <CheckCircle2 className="size-5" />
                    </button>
                    <p className="text-sm text-slate-500 line-through">{goal.title}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
