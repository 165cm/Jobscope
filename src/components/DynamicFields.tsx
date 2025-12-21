import type { NotionProperty, NotionSchema } from '../lib/schema';
import { Check, X } from 'lucide-react';

interface DynamicFieldsProps {
    schema: NotionSchema;
    values: Record<string, any>;
    onChange: (field: string, value: any) => void;
}

// Map Notion property types to UI components
export function DynamicFields({ schema, values, onChange }: DynamicFieldsProps) {
    // Filter and sort properties for display
    const displayProps = schema.properties.filter(
        (p) => !['title', 'created_time', 'last_edited_time', 'created_by', 'last_edited_by'].includes(p.type)
    );

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {displayProps.map((prop) => (
                <DynamicField
                    key={prop.id}
                    property={prop}
                    value={values[prop.name]}
                    onChange={(val) => onChange(prop.name, val)}
                />
            ))}
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
