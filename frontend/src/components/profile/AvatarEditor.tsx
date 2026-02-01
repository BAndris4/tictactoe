import { useState } from "react";
import Avatar from 'avataaars';
import {
    TOP_TYPES,
    UNISEX_TOP_TYPES,
    MALE_TOP_TYPES,
    FEMALE_TOP_TYPES,
    ACCESSORIES_TYPES,
    HAIR_COLORS,
    FACIAL_HAIR_TYPES,
    CLOTHE_TYPES,
    EYE_TYPES,
    EYEBROW_TYPES,
    MOUTH_TYPES,
    SKIN_COLORS,
    CLOTHE_COLORS
} from "../../data/avatarOptions";

interface AvatarEditorProps {
    config: any;
    gender?: 'M' | 'F';
    onChange: (newConfig: any) => void;
}

type Category = 'Head' | 'Face' | 'Clothes' | 'Accessories';

export default function AvatarEditor({ config, gender, onChange }: AvatarEditorProps) {
    const [activeCategory, setActiveCategory] = useState<Category>('Head');

    const handleChange = (key: string, value: string) => {
        onChange({ ...config, [key]: value });
    };

    const categories: Category[] = ['Head', 'Face', 'Clothes', 'Accessories'];
    
    // Filter options based on gender
    // Default to MALE_TOP_TYPES if no gender is specified, or mix if preferred. 
    // Using TOP_TYPES as fallback if needed, but for editor specific filtering is better.
    let topOptions = TOP_TYPES;
    if (gender === 'F') topOptions = FEMALE_TOP_TYPES;
    if (gender === 'M') topOptions = MALE_TOP_TYPES;

    const showFacialHair = gender !== 'F';

    // ... imports

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left: Live Preview */}
            <div className="w-full md:w-1/3 flex flex-col items-center sticky top-0">
                <div className="w-48 h-48 rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden relative shadow-inner mb-4">
                    <div className="w-[110%] h-[110%] mt-2 ml-[calc(-5%)]">
                         <Avatar
                            style={{ width: '100%', height: '100%' }}
                            avatarStyle="Transparent"
                            {...config}
                        />
                    </div>
                </div>
                <div className="text-xs font-bold text-deepblue/40 uppercase tracking-widest text-center">
                    Preview
                </div>
            </div>

            {/* Right: Controls */}
            <div className="w-full md:w-2/3 flex flex-col gap-4">
                {/* Category Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                ${activeCategory === cat 
                                    ? 'bg-white text-deepblue shadow-sm' 
                                    : 'text-deepblue/40 hover:text-deepblue/60'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Options Grid */}
                <div className="space-y-6 max-h-[400px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-2">
                    {/* ... (Keep existing conditional rendering logic for categories) ... */}
                    {activeCategory === 'Head' && (
                        <>
                            <SelectionGrid 
                                label="Hair Style" 
                                selected={config.topType} 
                                options={topOptions} 
                                onChange={(v) => handleChange('topType', v)} 
                            />
                            <ColorPicker 
                                label="Hair Color" 
                                selected={config.hairColor} 
                                options={HAIR_COLORS} 
                                onChange={(v) => handleChange('hairColor', v)} 
                            />
                            {(config.topType && (config.topType.includes("Hat") || config.topType.includes("Hijab") || config.topType.includes("Turban"))) && (
                                 <ColorPicker 
                                    label="Hat Color" 
                                    selected={config.hatColor} 
                                    options={CLOTHE_COLORS} 
                                    onChange={(v) => handleChange('hatColor', v)} 
                                />
                            )}
                            {showFacialHair && (
                                <>
                                    <SelectionGrid 
                                        label="Facial Hair" 
                                        selected={config.facialHairType} 
                                        options={FACIAL_HAIR_TYPES} 
                                        onChange={(v) => handleChange('facialHairType', v)} 
                                    />
                                    {config.facialHairType !== 'Blank' && (
                                        <ColorPicker 
                                            label="Facial Hair Color" 
                                            selected={config.facialHairColor} 
                                            options={HAIR_COLORS} 
                                            onChange={(v) => handleChange('facialHairColor', v)} 
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {activeCategory === 'Face' && (
                        <>
                             <ColorPicker 
                                label="Skin Color" 
                                selected={config.skinColor} 
                                options={SKIN_COLORS} 
                                onChange={(v) => handleChange('skinColor', v)} 
                            />
                             <SelectionGrid 
                                label="Eyes" 
                                selected={config.eyeType} 
                                options={EYE_TYPES} 
                                onChange={(v) => handleChange('eyeType', v)} 
                            />
                            <SelectionGrid 
                                label="Eyebrows" 
                                selected={config.eyebrowType} 
                                options={EYEBROW_TYPES} 
                                onChange={(v) => handleChange('eyebrowType', v)} 
                            />
                             <SelectionGrid 
                                label="Mouth" 
                                selected={config.mouthType} 
                                options={MOUTH_TYPES} 
                                onChange={(v) => handleChange('mouthType', v)} 
                            />
                        </>
                    )}

                    {activeCategory === 'Clothes' && (
                        <>
                            <SelectionGrid 
                                label="Clothing" 
                                selected={config.clotheType} 
                                options={CLOTHE_TYPES} 
                                onChange={(v) => handleChange('clotheType', v)} 
                            />
                            <ColorPicker 
                                label="Clothing Color" 
                                selected={config.clotheColor} 
                                options={CLOTHE_COLORS} 
                                onChange={(v) => handleChange('clotheColor', v)} 
                            />
                             <SelectionGrid 
                                label="Clothing Graphic" 
                                selected={config.graphicType} 
                                options={['Bat', 'Cumbia', 'Deer', 'Diamond', 'Hola', 'Pizza', 'Resist', 'Selena', 'Bear', 'SkullOutline', 'Skull']} 
                                onChange={(v) => handleChange('graphicType', v)} 
                            />
                        </>
                    )}

                    {activeCategory === 'Accessories' && (
                        <SelectionGrid 
                            label="Accessories" 
                            selected={config.accessoriesType} 
                            options={ACCESSORIES_TYPES} 
                            onChange={(v) => handleChange('accessoriesType', v)} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function SelectionGrid({ label, selected, options, onChange }: { label: string, selected: string, options: string[], onChange: (v: string) => void }) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-1 block">{label}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {options.map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        className={`
                            px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 text-center truncate
                            ${selected === opt 
                                ? 'bg-deepblue text-white border-deepblue shadow-md' 
                                : 'bg-white text-deepblue/60 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}
                        `}
                    >
                        {opt.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                ))}
            </div>
        </div>
    )
}

function ColorPicker({ label, selected, options, onChange }: { label: string, selected: string, options: string[], onChange: (v: string) => void }) {
    return (
        <div className="space-y-3">
             <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-1 block">{label}</label>
             <div className="flex flex-wrap gap-2">
                 {options.map(color => (
                     <button
                        key={color}
                        type="button"
                        onClick={() => onChange(color)}
                        title={color}
                        className={`
                            w-8 h-8 rounded-full border-2 transition-all shadow-sm
                            ${selected === color ? 'border-deepblue ring-2 ring-deepblue/20 scale-110' : 'border-slate-100 hover:scale-105'}
                        `}
                        style={{ backgroundColor: getColorCode(color) }}
                     />
                 ))}
             </div>
        </div>
    )
}

// Helper to map Avataaars color names to CSS colors
function getColorCode(name: string): string {
    const map: Record<string, string> = {
        "Auburn": "#A55728",
        "Black": "#2C1B18",
        "Blonde": "#B58143",
        "BlondeGolden": "#D6B370",
        "Brown": "#724133",
        "BrownDark": "#4A312C",
        "PastelPink": "#F59797",
        "Platinum": "#ECDCBF",
        "Red": "#C93305",
        "SilverGray": "#E8E1E1",
        "Tanned": "#FD9841",
        "Yellow": "#F8D25C",
        "Pale": "#FFDBB4",
        "Light": "#EDB98A",
        // "Brown": "#D08B5B", // Conflict, prioritizing hair brown
        "DarkBrown": "#AE5D29",
        // Clothes colors
        "Blue01": "#65C9FF",
        "Blue02": "#5199E4",
        "Blue03": "#25557C",
        "Gray01": "#E6E6E6",
        "Gray02": "#A7A7A7",
        "Heather": "#3C4F5C",
        "PastelBlue": "#B1E2FF",
        "PastelGreen": "#A7FFC4",
        "PastelOrange": "#FFDEB5",
        "PastelRed": "#FFAFB9",
        "PastelYellow": "#FFFFB1",
        "Pink": "#FF488E",
        "White": "#FFFFFF"
    };
    return map[name] || name;
}
