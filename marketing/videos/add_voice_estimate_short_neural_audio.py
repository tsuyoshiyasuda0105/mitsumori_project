from __future__ import annotations

import asyncio
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, r"C:\mitsumori_project\tools\py_video_deps")

import edge_tts


VIDEO_PATH = Path(r"C:\mitsumori_project\web\public\videos\voice-estimate-short.mp4")
AUDIO_PATH = Path(r"C:\mitsumori_project\marketing\videos\voice-estimate-short-narration-neural.mp3")
TEMP_PATH = Path(r"C:\mitsumori_project\web\public\videos\voice-estimate-short-with-neural-audio.mp4")
FFMPEG_PATH = Path(
    r"C:\mitsumori_project\tools\py_video_deps\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
)

NARRATION = (
    "見積入力、あと回しになっていませんか。"
    "ボイス見積なら、話した内容から明細の下書きを作成。"
    "単価マスターで価格をそろえ、エクセルや他システムにも出力できます。"
)


async def make_audio() -> None:
    communicate = edge_tts.Communicate(
        NARRATION,
        voice="ja-JP-NanamiNeural",
        rate="+14%",
        volume="+0%",
        pitch="-2Hz",
    )
    await communicate.save(str(AUDIO_PATH))


def replace_audio() -> None:
    if not VIDEO_PATH.exists():
        raise FileNotFoundError(VIDEO_PATH)
    if not AUDIO_PATH.exists():
        raise FileNotFoundError(AUDIO_PATH)
    if not FFMPEG_PATH.exists():
        raise FileNotFoundError(FFMPEG_PATH)

    args = [
        str(FFMPEG_PATH),
        "-y",
        "-i",
        str(VIDEO_PATH),
        "-i",
        str(AUDIO_PATH),
        "-filter_complex",
        "[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,highpass=f=90,lowpass=f=14500,apad=pad_dur=15,atrim=0:15[a]",
        "-map",
        "0:v:0",
        "-map",
        "[a]",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-movflags",
        "+faststart",
        str(TEMP_PATH),
    ]
    subprocess.run(args, check=True)
    TEMP_PATH.replace(VIDEO_PATH)


def main() -> None:
    AUDIO_PATH.parent.mkdir(parents=True, exist_ok=True)
    TEMP_PATH.parent.mkdir(parents=True, exist_ok=True)
    asyncio.run(make_audio())
    replace_audio()
    print(VIDEO_PATH)


if __name__ == "__main__":
    main()
