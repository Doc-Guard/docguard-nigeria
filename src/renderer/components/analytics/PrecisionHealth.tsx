
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface PrecisionHealthProps {
    data: any[];
}

const PrecisionHealth: React.FC<PrecisionHealthProps> = ({ data }) => {
    return (
        <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="font-extrabold text-lg text-emerald-950 tracking-tight">Filing Precision Health</h3>
                    <p className="text-xs text-emerald-600/50 font-bold uppercase tracking-widest mt-1">Automated CAC Form Validation Rate</p>
                </div>
            </div>
            <div className="h-80 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-emerald-950 tracking-tighter">92%</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Accuracy</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
                {data.map((item) => (
                    <div key={item.name} className="flex flex-col items-center p-3 rounded-xl bg-emerald-50/30 border border-emerald-50">
                        <div className="w-2.5 h-2.5 rounded-full mb-2" style={{ backgroundColor: item.color }}></div>
                        <p className="text-sm font-black text-emerald-950">{item.value}%</p>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5 text-center">{item.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrecisionHealth;
