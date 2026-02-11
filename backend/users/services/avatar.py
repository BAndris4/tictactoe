import random

class AvatarService:
    TOP_TYPES_MALE = [
        "NoHair", "Eyepatch", "Hat", "Hijab", "Turban", "WinterHat1", "WinterHat2", "WinterHat3", 
        "WinterHat4", "LongHairBun", "ShortHairDreads01", "ShortHairDreads02", "ShortHairFrizzle", 
        "ShortHairShaggyMullet", "ShortHairShortCurly", "ShortHairShortFlat", "ShortHairShortRound", 
        "ShortHairShortWaved", "ShortHairSides", "ShortHairTheCaesar", "ShortHairTheCaesarSidePart"
    ]
    TOP_TYPES_FEMALE = [
        "LongHairBigHair", "LongHairBob", "LongHairBun", "LongHairCurly", "LongHairCurvy", 
        "LongHairDreads", "LongHairFrida", "LongHairFro", "LongHairFroBand", "LongHairNotTooLong", 
        "LongHairMiaWallace", "LongHairStraight", "LongHairStraight2", "LongHairStraightStrand"
    ]
    ACCESSORIES_TYPES = ["Blank", "Kurt", "Prescription01", "Prescription02", "Round", "Sunglasses", "Wayfarers"]
    HAIR_COLORS = ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "PastelPink", "Platinum", "Red", "SilverGray"]
    FACIAL_HAIR_TYPES = ["Blank", "BeardMedium", "BeardLight", "BeardMagestic", "MoustacheFancy", "MoustacheMagnum"]
    CLOTHE_TYPES = ["BlazerShirt", "BlazerSweater", "CollarSweater", "GraphicShirt", "Hoodie", "Overall", "ShirtCrewNeck", "ShirtScoopNeck", "ShirtVNeck"]
    EYE_TYPES = ["Close", "Cry", "Default", "Dizzy", "EyeRoll", "Happy", "Hearts", "Side", "Squint", "Surprised"]
    EYEBROW_TYPES = ["Angry", "AngryNatural", "Default", "DefaultNatural", "FlatNatural", "RaisedExcited", "RaisedExcitedNatural", "SadConcerned", "SadConcernedNatural", "UnibrowNatural", "UpDown", "UpDownNatural"]
    MOUTH_TYPES = ["Concerned", "Default", "Disbelief", "Eating", "Grimace", "Sad", "ScreamOpen", "Serious", "Smile", "Tongue", "Twinkle", "Vomit"]
    SKIN_COLORS = ["Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown", "Black"]

    @classmethod
    def generate_random_avatar(cls, gender='M'):
        is_male = gender == 'M'
        config = {
            "topType": random.choice(cls.TOP_TYPES_MALE if is_male else cls.TOP_TYPES_FEMALE),
            "accessoriesType": random.choice(cls.ACCESSORIES_TYPES),
            "hairColor": random.choice(cls.HAIR_COLORS),
            "facialHairType": random.choice(cls.FACIAL_HAIR_TYPES) if is_male else "Blank",
            "clotheType": random.choice(cls.CLOTHE_TYPES),
            "eyeType": random.choice(cls.EYE_TYPES),
            "eyebrowType": random.choice(cls.EYEBROW_TYPES),
            "mouthType": random.choice(cls.MOUTH_TYPES),
            "skinColor": random.choice(cls.SKIN_COLORS),
        }
        if not is_male and random.random() > 0.7:
             config["facialHairType"] = "Blank"
        return config
