import asyncio
import os
import edge_tts

ITEMS = [
    {
        "name": "loose_furniture_screws",
        "en": "Fixing loose furniture screws is a quick, safe DIY repair. Remove the screw, check the hole for stripping, pack a wooden toothpick with glue if loose, and drive the screw tight with a Phillips screwdriver.",
        "ta": "தளபாடங்களில் உள்ள தளர்வான திருகுகளை சரிசெய்வது எளிதான, பாதுகாப்பான பழுது. திருகை கழற்றி, மர பசை மற்றும் பற்பசையை கொண்டு துளையை சரிசெய்து, திருகு திருப்பி கொண்டு இறுக்கமாக பொருத்தவும்."
    },
    {
        "name": "cabinet_hinges",
        "en": "Your cabinet door is sagging due to loose hinge mounting screws. Support the door from below, reinforce the stripped screw holes with glue and dowels, secure the hinge plate, and fine-tune the adjustment screws.",
        "ta": "அலமாரி கதவின் கீல் தளர்ந்து கதவு கீழே சாய்ந்துள்ளது. கதவை கீழிருந்து தாங்கி பிடித்து, கீல் துளைகளை சரிசெய்து, கீல் தகட்டை இறுக்கமாக பொருத்தி கதவை நேராக சீரமைக்கவும்."
    },
    {
        "name": "drawer_handles",
        "en": "This drawer handle is wobbly. Open the drawer, remove the interior screw, add a lock washer with threadlocker, hold the handle straight, and tighten firmly from inside.",
        "ta": "இழுப்பறை கைப்பிடி ஆடுகிறது. டிராயரை திறந்து, உட்புற திருகை கழற்றி, வாஷரை வைத்து, கைப்பிடியை நேராக பிடித்து உள்ளிருந்து திருப்புளி மூலம் இறுக்கமாக மாட்டவும்."
    },
    {
        "name": "torn_bags",
        "en": "The seam of this bag is torn. Trim loose threads, align the torn seam edges, thread a needle with heavy-duty nylon thread, and sew a reinforced backstitch across the tear.",
        "ta": "இந்த பையின் தையல் பிரிந்துள்ளது. தளர்வான நூல்களை வெட்டி, ஓரங்களை சீராக இணைத்து, நைலான் நூல் மற்றும் ஊசியை கொண்டு வலுவான பின் தையல் போட்டு சரிசெய்யவும்."
    },
    {
        "name": "bicycle_chain",
        "en": "Your bicycle chain has slipped off the cogs. Shift to the smallest gear, push the rear derailleur cage forward to create slack, guide the chain onto the chainring teeth, and rotate the pedals forward slowly.",
        "ta": "சைக்கிள் சங்கிலி பற்சக்கரத்திலிருந்து நழுவியுள்ளது. பின்புற கியரை மாற்றி, சங்கிலியை தளர்த்தி, பற்களின் மீது சங்கிலியை சரியாக பொருத்தி, பெடலை மெதுவாக சுழற்றவும்."
    },
    {
        "name": "danger_alert",
        "en": "Danger: This repair has been blocked by FixLens AI safety check. It involves high risk of fire, shock, or severe structural failure. Escalate to a certified technician immediately.",
        "ta": "அபாயம்: இந்த பழுது FixLens பாதுகாப்பு விதிகளால் தடை செய்யப்பட்டுள்ளது. மின் அதிர்ச்சி அல்லது கடுமையான சேதம் ஏற்பட வாய்ப்புள்ளதால் சான்றளிக்கப்பட்ட தொழில்நுட்ப நிபுணரை உடனடியாக அணுகவும்."
    }
]

VOICE_EN = "en-IN-NeerjaNeural"
VOICE_TA = "ta-IN-PallaviNeural"

async def main():
    os.makedirs("public/audio/en", exist_ok=True)
    os.makedirs("public/audio/ta", exist_ok=True)

    for item in ITEMS:
        path_en = f"public/audio/en/{item['name']}.mp3"
        path_ta = f"public/audio/ta/{item['name']}.mp3"

        print(f"Generating EN: {path_en}...")
        communicate_en = edge_tts.Communicate(item["en"], VOICE_EN, rate="-5%")
        await communicate_en.save(path_en)

        print(f"Generating TA: {path_ta}...")
        communicate_ta = edge_tts.Communicate(item["ta"], VOICE_TA, rate="-5%")
        await communicate_ta.save(path_ta)

    print("All FixLens neural voice tracks generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
