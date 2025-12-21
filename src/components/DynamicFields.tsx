import type { NotionProperty, NotionSchema } from '../lib/schema';
import { Check, X } from 'lucide-react';

interface DynamicFieldsProps {
    schema: NotionSchema;
    values: Record<string, any>;
    onChange: (field: string, value: any) => void;
}

// Preferred display order for fields
const FIELD_ORDER = [
    // Basic Info
    'source', 'employment', 'remote', 'category',
    // Salary
    'salary_min', 'salary_max',
    // Location
    'location', 'Station',
    // Company
    'Employees', 'Avg Age', 'age_limit',
    // Skills
    'skills',
    // Boolean flags (shown at end)
    'autonomy', 'feedback', 'teamwork', 'long_commute', 'overwork',
];

// Helper function to get value with case-insensitive key lookup
function getValue(values: Record<string, any>, propName: string): any {
    // Direct match
    if (values[propName] !== undefined) return values[propName];
    // Case-insensitive match
    const lowerKey = propName.toLowerCase();
    const matchingKey = Object.keys(values).find(k => k.toLowerCase() === lowerKey);
    return matchingKey ? values[matchingKey] : undefined;
}

// Map Notion property types to UI components
export function DynamicFields({ schema, values, onChange }: DynamicFieldsProps) {
    // Filter and sort properties for display
    const displayProps = schema.properties
        .filter((p) => !['title', 'created_time', 'last_edited_time', 'created_by', 'last_edited_by'].includes(p.type))
        .sort((a, b) => {
            const aIndex = FIELD_ORDER.indexOf(a.name);
            const bIndex = FIELD_ORDER.indexOf(b.name);
            // Known fields come first, sorted by order
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            // Unknown fields: checkboxes at end, rest alphabetically
            if (a.type === 'checkbox' && b.type !== 'checkbox') return 1;
            if (b.type === 'checkbox' && a.type !== 'checkbox') return -1;
            return a.name.localeCompare(b.name);
        });

    // Separate checkboxes for grouped display
    const textFields = displayProps.filter(p => p.type !== 'checkbox');
    const checkboxFields = displayProps.filter(p => p.type === 'checkbox');

    return (
        <div className="space-y-4">
            {/* Text/Select/Number fields */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {textFields.map((prop) => (
                    <DynamicField
                        key={prop.id}
                        property={prop}
                        value={getValue(values, prop.name)}
                        onChange={(val) => onChange(prop.name, val)}
                    />
                ))}
            </div>
            {/* Checkbox flags */}
            {checkboxFields.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {checkboxFields.map((prop) => (
                        <DynamicField
                            key={prop.id}
                            property={prop}
                            value={getValue(values, prop.name)}
                            onChange={(val) => onChange(prop.name, val)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface DynamicFieldProps {
    property: NotionProperty;
    value: any;
    onChange: (value: any) => void;
}

function DynamicField({ property, value, onChange }: DynamicFieldProps) {
    const { name, type, options } = property;

    // Label
    const Label = () => (
        <label className="text-[10px] text-gray-400 font-medium uppercase">{name}</label>
    );

    // Select field
    if (type === 'select' && options) {
        return (
            <div className="flex flex-col">
                <Label />
                <select
                    className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5 w-full truncate"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">--</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        );
    }

    // Multi-select field (display as comma-separated input for simplicity)
    if (type === 'multi_select') {
        const currentValues = Array.isArray(value) ? value.join(', ') : (value || '');
        return (
            <div className="flex flex-col col-span-2">
                <Label />
                <input
                    className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5 w-full"
                    value={currentValues}
                    onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()))}
                    placeholder="Comma separated"
                />
            </div>
        );
    }

    // Checkbox field
    if (type === 'checkbox') {
        return (
            <div
                className={`flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer select-none transition-colors ${value ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                onClick={() => onChange(!value)}
            >
                {value ? <Check size={12} /> : <X size={12} />}
                {name}
            </div>
        );
    }

    // Number field
    if (type === 'number') {
        return (
            <div className="flex flex-col">
                <Label />
                <input
                    type="number"
                    className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5 w-full text-right"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                />
            </div>
        );
    }

    // URL field
    if (type === 'url') {
        return (
            <div className="flex flex-col col-span-2">
                <Label />
                <input
                    type="url"
                    className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5 w-full"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://..."
                />
            </div>
        );
    }

    // Default: Text field (rich_text, etc.)
    return (
        <div className="flex flex-col">
            <Label />
            <input
                type="text"
                className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5 w-full overflow-hidden text-ellipsis"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default DynamicFields;
