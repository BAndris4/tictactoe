// Unisex options (Hats, etc.)
export const UNISEX_TOP_TYPES = [
    "NoHair", "Eyepatch", "Hat", "Hijab", "Turban", 
    "WinterHat1", "WinterHat2", "WinterHat3", "WinterHat4"
];

export const MALE_TOP_TYPES = [
    ...UNISEX_TOP_TYPES,
    "ShortHairDreads01", "ShortHairDreads02", "ShortHairFrizzle", "ShortHairShaggyMullet", 
    "ShortHairShortCurly", "ShortHairShortFlat", "ShortHairShortRound", "ShortHairShortWaved", 
    "ShortHairSides", "ShortHairTheCaesar", "ShortHairTheCaesarSidePart"
];

export const FEMALE_TOP_TYPES = [
    ...UNISEX_TOP_TYPES,
    "LongHairBigHair", "LongHairBob", "LongHairBun", "LongHairCurly", "LongHairCurvy", 
    "LongHairDreads", "LongHairFrida", "LongHairFro", "LongHairFroBand", "LongHairNotTooLong", 
    "LongHairMiaWallace", "LongHairStraight", "LongHairStraight2", "LongHairStraightStrand"
];

// Fallback for types
export const TOP_TYPES = [...MALE_TOP_TYPES, ...FEMALE_TOP_TYPES];

export const ACCESSORIES_TYPES = [
    "Blank", "Kurt", "Prescription01", "Prescription02", "Round", "Sunglasses", "Wayfarers"
];

export const HAIR_COLORS = [
    "Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "PastelPink", 
    "Platinum", "Red", "SilverGray"
];

export const FACIAL_HAIR_TYPES = [
    "Blank", "BeardMedium", "BeardLight", "BeardMagestic", "MoustacheFancy", "MoustacheMagnum"
];

export const CLOTHE_TYPES = [
    "BlazerShirt", "BlazerSweater", "CollarSweater", "GraphicShirt", "Hoodie", 
    "Overall", "ShirtCrewNeck", "ShirtScoopNeck", "ShirtVNeck"
];

export const EYE_TYPES = [
    "Close", "Cry", "Default", "Dizzy", "EyeRoll", "Happy", "Hearts", "Side", "Squint", "Surprised"
];

export const EYEBROW_TYPES = [
    "Angry", "AngryNatural", "Default", "DefaultNatural", "FlatNatural", "RaisedExcited", 
    "RaisedExcitedNatural", "SadConcerned", "SadConcernedNatural", "UnibrowNatural", "UpDown", "UpDownNatural"
];

export const MOUTH_TYPES = [
    "Concerned", "Default", "Disbelief", "Eating", "Grimace", "Sad", "ScreamOpen", "Serious", 
    "Smile", "Tongue", "Twinkle", "Vomit"
];

export const SKIN_COLORS = [
    "Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown", "Black"
];

export const CLOTHE_COLORS = [
    "Black", "Blue01", "Blue02", "Blue03", "Gray01", "Gray02", "Heather", "PastelBlue", 
    "PastelGreen", "PastelOrange", "PastelRed", "PastelYellow", "Pink", "Red", "White"
];
