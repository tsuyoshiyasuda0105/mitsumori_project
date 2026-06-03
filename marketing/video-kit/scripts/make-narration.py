from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, r"C:\mitsumori_project\tools\py_video_deps")

import edge_tts


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = ROOT / "out" / "audio"

NARRATION = (
    "みつもりを作るの、後回しになっていませんか。"
    "現場で話した内容を、エーアイが明細の下書きに。"
    "単価表で価格をそろえ、エクセルやほかのシステムにも出力できます。"
)


async def save_voice(path: Path, voice: str, rate: str = "+2%", pitch: str = "+0Hz") -> None:
    communicate = edge_tts.Communicate(
        NARRATION,
        voice=voice,
        rate=rate,
        volume="+0%",
        pitch=pitch,
    )
    await communicate.save(str(path))


async def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    # Main LP voice. Kana and short pauses are intentionally used to improve accent.
    await save_voice(PUBLIC / "narration.mp3", "ja-JP-NanamiNeural", rate="+2%", pitch="+0Hz")

    # Keep alternatives so we can switch quickly if the client prefers a different voice.
    await save_voice(OUT / "narration-nanami.mp3", "ja-JP-NanamiNeural", rate="+2%", pitch="+0Hz")
    await save_voice(OUT / "narration-keita.mp3", "ja-JP-KeitaNeural", rate="+2%", pitch="+0Hz")

    print(PUBLIC / "narration.mp3")


if __name__ == "__main__":
    asyncio.run(main())
