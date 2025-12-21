
import { useState, useEffect } from 'react';
import { CheckCircle, ExternalLink, Save, RefreshCw } from 'lucide-react';

interface PreviewProps {
    data: any;
    onSave: () => void;
    isSaving: boolean;
    onUpdate: (data: any) => void;
}

export default function Preview({ data, onSave, isSaving, onUpdate }: PreviewProps) {
    if (!data) return null;

    const { properties } = data;
    const [skillsText, setSkillsText] = useState('');

    // Sync skills text when data changes initially
    useEffect(() => {
        if (properties.skills && Array.isArray(properties.skills)) {
            setSkillsText(properties.skills.join(', '));
        }
    }, [data.properties.skills]); // Only sync when skills array ref changes significantly

    // Auto-abbreviate company name
    useEffect(() => {
        if (properties.company) {
            const abbreviated = properties.company
                .replace(/株式会社/g, '(株)')
                .replace(/有限会社/g, '(有)')
                .replace(/合同会社/g, '(同)')
                .replace(/一般社団法人/g, '(社)')
                .replace(/公益社団法人/g, '(公社)')
                .replace(/財団法人/g, '(財)')
                .replace(/学校法人/g, '(学)');

            if (abbreviated !== properties.company) {
                handleChange('company', abbreviated);
            }
        }
    }, [properties.company]); // Depend on company string to re-run only when it changes

    const handleChange = (key: string, value: any) => {
        onUpdate({
            ...data,
            properties: {
                ...properties,
                [key]: value
            }
        });
    };

    const handleSkillsChange = (text: string) => {
        setSkillsText(text);
        // Split by comma/newline, trim, filter empty
        const newSkills = text.split(/[,、\n]/).map(s => s.trim()).filter(s => s.length > 0);
        handleChange('skills', newSkills);
    };

    const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1">
            {children} <ExternalLink className="w-3 h-3" />
        </a>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                    解析結果の確認・編集
                </h2>
                {properties.site && <NavLink href={data.url || '#'}>{properties.site}で見る</NavLink>}
            </div>

            <div className="space-y-4">
                {/* 1. Header Info (Title, Company, URL) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">求人タイトル</label>
                        <input
                            type="text"
                            value={properties.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">会社名</label>
                        <input
                            type="text"
                            value={properties.company || ''}
                            onChange={(e) => handleChange('company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">媒体 (Source)</label>
                        <input // Fallback text input or select? Text for flexibility
                            type="text"
                            value={properties.source || ''}
                            onChange={(e) => handleChange('source', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="doda, etc."
                        />
                    </div>
                </div>

                {/* 2. Basic Conditions Grid */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">想定年収 (下限〜上限)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={properties.salary_min || ''}
                                    onChange={(e) => handleChange('salary_min', Number(e.target.value))}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center placeholder:text-gray-300"
                                    placeholder="下限"
                                />
                                <input
                                    type="number"
                                    value={properties.salary_max || ''}
                                    onChange={(e) => handleChange('salary_max', Number(e.target.value))}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center placeholder:text-gray-300"
                                    placeholder="上限"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">雇用形態</label>
                            <input
                                type="text"
                                value={properties.employment || ''}
                                onChange={(e) => handleChange('employment', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">勤務地</label>
                            <input
                                type="text"
                                value={properties.location || ''}
                                onChange={(e) => handleChange('location', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">最寄り駅</label>
                            <input
                                type="text"
                                value={properties.station || ''}
                                onChange={(e) => handleChange('station', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">リモート</label>
                            <select
                                value={properties.remote || '不明'}
                                onChange={(e) => handleChange('remote', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                            >
                                <option value="フルリモート">フルリモート</option>
                                <option value="週一部リモート">週一部リモート</option>
                                <option value="リモート可">リモート可</option>
                                <option value="なし">なし</option>
                                <option value="不明">不明</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">副業</label>
                            <input
                                type="text"
                                value={properties.side_job || ''}
                                onChange={(e) => handleChange('side_job', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">従業員数</label>
                            <input
                                type="text"
                                value={properties.employees || ''}
                                onChange={(e) => handleChange('employees', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">平均年齢</label>
                            <input
                                type="text"
                                value={properties.avg_age || ''}
                                onChange={(e) => handleChange('avg_age', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Skills (Text Area) */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                        必須・歓迎スキル (カンマ区切りで入力)
                    </label>
                    <textarea
                        value={skillsText}
                        onChange={(e) => handleSkillsChange(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-200 rounded text-sm bg-blue-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[60px]"
                        placeholder="Java, Python, AWS..."
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                        {properties.skills?.map((s: string, i: number) => (
                            <span key={i} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 4. Analysis Results */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">マッチ度 / カテゴリ</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-2">
                            <select
                                value={properties.match || ''}
                                onChange={(e) => handleChange('match', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                            >
                                <option value="◎完全一致">◎完全一致</option>
                                <option value="○ほぼ一致">○ほぼ一致</option>
                                <option value="△一部一致">△一部一致</option>
                                <option value="×不足あり">×不足あり</option>
                            </select>
                            <input
                                type="text"
                                value={properties.category || ''}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                                placeholder="職種カテゴリ"
                            />
                        </div>
                    </div>
                </div>

                {/* 5. Flags (Horizontal Row) */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">特徴フラグ</label>
                    <div className="flex flex-wrap gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                        {[
                            { key: 'autonomy', label: '裁量権あり' },
                            { key: 'teamwork', label: 'チームワーク' },
                            { key: 'overwork', label: '激務注意' },
                            { key: 'remote', label: 'リモート' },
                            { key: 'long_commute', label: '通勤注意' },
                            { key: 'feedback', label: 'FB文化あり' },
                        ].map((flag) => (
                            <label key={flag.key} className="inline-flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={properties[flag.key] || false}
                                    onChange={(e) => handleChange(flag.key, e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{flag.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 6. Actions */}
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                    <button
                        onClick={() => onSave()}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm shadow-green-200 disabled:opacity-70 transition-all hover:-translate-y-0.5"
                    >
                        {isSaving ? '保存中...' : (
                            <>
                                <Save className="w-5 h-5" />
                                Notionに保存
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
