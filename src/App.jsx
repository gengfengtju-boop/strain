import { useState, useMemo } from "react";
import { REFERENCE_STRAINS, safetyCheck, scoreStrain, predictSynergyClass } from "./strainDb.js";

const Badge = ({ label, color = "slate" }) => {
  const c = {
    emerald: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
    blue:    "bg-blue-900/40 text-blue-300 border-blue-700/50",
    amber:   "bg-amber-900/40 text-amber-300 border-amber-700/50",
    rose:    "bg-rose-900/40 text-rose-300 border-rose-700/50",
    slate:   "bg-slate-800/60 text-slate-300 border-slate-600/50",
  };
  return (
    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border ${c[color]} mr-1`}>
      {label}
    </span>
  );
};

const ScoreBar = ({ value, max = 1, color = "emerald" }) => {
  const pct = Math.min((value / max) * 100, 100).toFixed(0);
  const bg = color === "emerald" ? "bg-emerald-500" : color === "blue" ? "bg-blue-500" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${bg} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  );
};

const SYNERGY_COLOR = { synergistic: "emerald", additive: "blue", antagonistic: "rose" };

export default function App() {
  const [selected, setSelected] = useState([]);
  const [activeTab, setActiveTab] = useState("database");

  const toggleSelect = (id) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );

  const scored = useMemo(() =>
    REFERENCE_STRAINS.map(s => ({
      ...s,
      _safety: safetyCheck(s),
      _score: scoreStrain(s),
    })).sort((a, b) => b._score - a._score)
  , []);

  const selectedStrains = scored.filter(s => selected.includes(s.id));

  const pairSynergies = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < selectedStrains.length; i++)
      for (let j = i + 1; j < selectedStrains.length; j++)
        pairs.push({
          a: selectedStrains[i].name.split(" ").slice(0, 2).join(" "),
          b: selectedStrains[j].name.split(" ").slice(0, 2).join(" "),
          cls: predictSynergyClass(selectedStrains[i], selectedStrains[j]),
        });
    return pairs;
  }, [selectedStrains]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" style={{ fontFamily: "'IBM Plex Sans', 'Noto Sans SC', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-[10px] font-black text-white">S</div>
          <div>
            <div className="text-sm font-bold text-white">StrainDB</div>
            <div className="text-[10px] text-slate-500">ProbioFat-AI · 菌株 L1 参数数据库</div>
          </div>
          <div className="ml-auto flex gap-1">
            {["database", "compare"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`text-[10px] px-3 py-1 rounded transition-colors ${
                  activeTab === t ? "bg-emerald-700/40 text-emerald-300" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}>
                {t === "database" ? "菌株库" : "组合分析"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "database" && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-black text-white mb-1">益生菌菌株 L1 参数数据库</h1>
              <p className="text-xs text-slate-400">点击菌株卡片可添加到组合分析（最多 4 株）。评分基于文献参数加权计算。</p>
            </div>
            <div className="grid gap-4">
              {scored.map(s => (
                <div key={s.id}
                  onClick={() => toggleSelect(s.id)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    selected.includes(s.id)
                      ? "border-emerald-600/70 bg-emerald-950/30"
                      : "border-slate-800/60 bg-slate-900/40 hover:border-slate-700"
                  }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-200 italic">{s.name}</span>
                        <Badge label={s.genus} color="blue" />
                        {s._safety.pass
                          ? <Badge label="安全通过" color="emerald" />
                          : <Badge label="安全问题" color="rose" />}
                        {selected.includes(s.id) && <Badge label="已选" color="amber" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">{s.literature_ref}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-emerald-400">{(s._score * 100).toFixed(1)}</div>
                      <div className="text-[10px] text-slate-500">L1得分</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] text-slate-400">
                    <div>
                      <div className="mb-1 font-semibold text-slate-300">胃肠道适应性</div>
                      <ScoreBar value={s.gi_fitness.acid_survival_pH2} />
                      <div className="flex justify-between mt-0.5"><span>pH 2.0 耐酸</span><span>{(s.gi_fitness.acid_survival_pH2 * 100).toFixed(0)}%</span></div>
                      <div className="flex justify-between mt-0.5"><span>Caco-2 黏附</span><span>{(s.gi_fitness.caco2_adhesion * 100).toFixed(0)}%</span></div>
                    </div>
                    <div>
                      <div className="mb-1 font-semibold text-slate-300">SCFA 生产</div>
                      <ScoreBar value={s.scfa_production.butyrate_production} max={3} color="amber" />
                      <div className="flex justify-between mt-0.5"><span>丁酸</span><span>{s.scfa_production.butyrate_production.toFixed(2)} mmol/L/h</span></div>
                      <div className="flex justify-between mt-0.5"><span>丙酸</span><span>{s.scfa_production.propionate_production.toFixed(2)} mmol/L/h</span></div>
                    </div>
                    <div>
                      <div className="mb-1 font-semibold text-slate-300">抗炎效果</div>
                      <ScoreBar value={s.anti_inflammatory.TNF_alpha_reduction} max={100} color="blue" />
                      <div className="flex justify-between mt-0.5"><span>TNF-α 降低</span><span>{s.anti_inflammatory.TNF_alpha_reduction.toFixed(1)}%</span></div>
                      <div className="flex justify-between mt-0.5"><span>LPS 降低</span><span>{s.anti_inflammatory.LPS_reduction.toFixed(1)}%</span></div>
                    </div>
                    <div>
                      <div className="mb-1 font-semibold text-slate-300">脂质代谢</div>
                      <ScoreBar value={s.lipid_metabolism.BSH_activity} />
                      <div className="flex justify-between mt-0.5"><span>BSH 活性</span><span>{(s.lipid_metabolism.BSH_activity * 100).toFixed(0)}%</span></div>
                      <div className="flex justify-between mt-0.5"><span>胆固醇去除</span><span>{s.lipid_metabolism.cholesterol_removal_pct.toFixed(1)}%</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "compare" && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-black text-white mb-1">组合协同性分析</h1>
              <p className="text-xs text-slate-400">已选择 {selected.length} 株菌株。请先在菌株库中选择 2–4 株进行分析。</p>
            </div>

            {selectedStrains.length < 2 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="text-4xl mb-3">⚕️</div>
                <div>请在“菌株库”选择至少 2 株菌株</div>
              </div>
            ) : (
              <>
                {/* Score comparison */}
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 mb-4">
                  <div className="text-sm font-semibold text-slate-200 mb-3">L1 得分对比</div>
                  {selectedStrains.map(s => (
                    <div key={s.id} className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 italic">{s.name.split(" ").slice(0, 2).join(" ")}</span>
                        <span className="text-emerald-400 font-bold">{(s._score * 100).toFixed(1)}</span>
                      </div>
                      <ScoreBar value={s._score} />
                    </div>
                  ))}
                </div>

                {/* Pairwise synergy */}
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 mb-4">
                  <div className="text-sm font-semibold text-slate-200 mb-3">双股协同性预测</div>
                  {pairSynergies.length === 0 ? (
                    <div className="text-xs text-slate-500">需选择 2 株以上菌株</div>
                  ) : (
                    <div className="space-y-2">
                      {pairSynergies.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-300 italic flex-1">{p.a}</span>
                          <span className="text-slate-600">×</span>
                          <span className="text-slate-300 italic flex-1">{p.b}</span>
                          <Badge label={p.cls === "synergistic" ? "协同" : p.cls === "additive" ? "相加" : "拮抗"} color={SYNERGY_COLOR[p.cls]} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feature radar comparison table */}
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                  <div className="text-sm font-semibold text-slate-200 mb-3">功能维度详细对比</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="px-2 py-1.5 text-left text-slate-400 font-semibold">维度</th>
                          {selectedStrains.map(s => (
                            <th key={s.id} className="px-2 py-1.5 text-left text-slate-300 font-semibold italic">
                              {s.name.split(" ")[1]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: "pH 2.0 耐酸", fn: s => (s.gi_fitness.acid_survival_pH2 * 100).toFixed(0) + "%" },
                          { label: "BSH 活性", fn: s => (s.lipid_metabolism.BSH_activity * 100).toFixed(0) + "%" },
                          { label: "丁酸生产", fn: s => s.scfa_production.butyrate_production.toFixed(2) + " mmol/L/h" },
                          { label: "丙酸生产", fn: s => s.scfa_production.propionate_production.toFixed(2) + " mmol/L/h" },
                          { label: "TNF-α 降低", fn: s => s.anti_inflammatory.TNF_alpha_reduction.toFixed(1) + "%" },
                          { label: "LPS 降低", fn: s => s.anti_inflammatory.LPS_reduction.toFixed(1) + "%" },
                          { label: "ZO-1 表达", fn: s => s.anti_inflammatory.ZO1_expression_fold.toFixed(2) + "×" },
                          { label: "脂肪滴抑制", fn: s => s.adipocyte.lipid_droplet_inhibition.toFixed(1) + "%" },
                          { label: "脂联素诱导", fn: s => s.adipocyte.adiponectin_induction.toFixed(2) + "×" },
                        ].map((row, i) => (
                          <tr key={i} className={`border-b border-slate-800/40 ${i % 2 === 0 ? "bg-slate-800/10" : ""}`}>
                            <td className="px-2 py-1.5 text-slate-400">{row.label}</td>
                            {selectedStrains.map(s => (
                              <td key={s.id} className="px-2 py-1.5 text-slate-300">{row.fn(s)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
