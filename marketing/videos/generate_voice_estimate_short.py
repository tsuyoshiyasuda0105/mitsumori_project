from __future__ import annotations

import math
import sys
from pathlib import Path

sys.path.insert(0, r"C:\mitsumori_project\tools\py_video_deps")

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont


WIDTH = 540
HEIGHT = 960
FPS = 24
DURATION = 15
FRAME_COUNT = FPS * DURATION

OUT = Path(r"C:\mitsumori_project\web\public\videos\voice-estimate-short.mp4")
FONT_REG = r"C:\Windows\Fonts\YuGothR.ttc"
FONT_BOLD = r"C:\Windows\Fonts\YuGothB.ttc"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size=size)


F16 = font(16)
F18 = font(18)
F22 = font(22, True)
F26 = font(26, True)
F32 = font(32, True)
F40 = font(40, True)
F52 = font(52, True)


def ease(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def text_size(draw: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont) -> tuple[int, int]:
    b = draw.textbbox((0, 0), text, font=f)
    return b[2] - b[0], b[3] - b[1]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for char in text:
        candidate = current + char
        if text_size(draw, candidate, f)[0] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = char
    if current:
        lines.append(current)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    f: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    max_width: int,
    line_gap: int = 8,
) -> int:
    x, y = xy
    for line in wrap_text(draw, text, f, max_width):
        draw.text((x, y), line, font=f, fill=fill)
        y += text_size(draw, line, f)[1] + line_gap
    return y


def rounded(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def center_text(draw: ImageDraw.ImageDraw, text: str, y: int, f, fill, max_width: int = WIDTH - 80):
    lines = wrap_text(draw, text, f, max_width)
    total_h = sum(text_size(draw, line, f)[1] for line in lines) + (len(lines) - 1) * 8
    cy = y - total_h // 2
    for line in lines:
        tw, th = text_size(draw, line, f)
        draw.text(((WIDTH - tw) // 2, cy), line, font=f, fill=fill)
        cy += th + 8


def background(draw: ImageDraw.ImageDraw, frame: int):
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(6 + 18 * ratio)
        g = int(16 + 30 * ratio)
        b = int(38 + 70 * ratio)
        draw.line((0, y, WIDTH, y), fill=(r, g, b))

    # Soft diagonal bands.
    offset = int((frame * 1.8) % 240)
    for i in range(-4, 8):
        x0 = i * 140 + offset - 240
        draw.polygon(
            [(x0, 0), (x0 + 90, 0), (x0 + 520, HEIGHT), (x0 + 430, HEIGHT)],
            fill=(20, 80, 130),
        )


def draw_phone_scene(draw: ImageDraw.ImageDraw, t: float):
    rounded(draw, (68, 236, 472, 810), 40, (244, 248, 252), outline=(15, 23, 42), width=10)
    rounded(draw, (92, 266, 448, 780), 28, (255, 255, 255))
    draw.text((116, 300), "ボイス見積", font=F22, fill=(15, 23, 42))
    draw.text((116, 332), "録音中", font=F18, fill=(225, 29, 72))
    cx, cy = WIDTH // 2, 470
    pulse = 1 + 0.08 * math.sin(t * 8)
    r = int(74 * pulse)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(225, 29, 72))
    draw.line((cx, cy - 34, cx, cy + 16), fill=(255, 255, 255), width=7)
    draw.arc((cx - 22, cy - 20, cx + 22, cy + 36), 0, 180, fill=(255, 255, 255), width=6)
    draw.line((cx, cy + 38, cx, cy + 56), fill=(255, 255, 255), width=6)
    draw.line((cx - 24, cy + 56, cx + 24, cy + 56), fill=(255, 255, 255), width=6)

    base = 630
    for i in range(15):
        h = 18 + int(44 * (0.5 + 0.5 * math.sin(t * 7 + i * 0.8)))
        x = 132 + i * 18
        rounded(draw, (x, base - h, x + 8, base + h), 5, (79, 70, 229))

    rounded(draw, (116, 700, 424, 744), 10, (238, 242, 255))
    draw.text((132, 712), "話した内容を明細候補に", font=F18, fill=(67, 56, 202))


def draw_ui_scene(draw: ImageDraw.ImageDraw, scene: str, t: float):
    rounded(draw, (44, 214, 496, 788), 18, (248, 250, 252), outline=(203, 213, 225), width=2)
    rounded(draw, (44, 214, 496, 274), 18, (15, 23, 42))
    draw.text((70, 232), "見積編集", font=F22, fill=(255, 255, 255))

    rows = [
        ("外壁", "シリコン塗装", "180㎡", "432,000"),
        ("足場", "くさび式足場", "210㎡", "189,000"),
        ("屋根", "高圧洗浄", "95㎡", "42,750"),
    ]
    y = 304
    reveal = min(3, int(ease(t) * 4))
    for i, row in enumerate(rows[: max(1, reveal)]):
        rounded(draw, (70, y, 470, y + 70), 12, (255, 255, 255), outline=(226, 232, 240))
        draw.text((88, y + 16), row[0], font=F18, fill=(51, 65, 85))
        draw.text((158, y + 16), row[1], font=F18, fill=(15, 23, 42))
        draw.text((322, y + 16), row[2], font=F18, fill=(51, 65, 85))
        draw.text((390, y + 16), row[3], font=F18, fill=(15, 23, 42))
        y += 86

    if scene == "master":
        rounded(draw, (70, 620, 470, 740), 14, (239, 246, 255), outline=(147, 197, 253), width=2)
        draw.text((92, 642), "単価マスター", font=F22, fill=(29, 78, 216))
        draw.text((92, 682), "品目・単位・単価を統一", font=F22, fill=(15, 23, 42))
    else:
        rounded(draw, (70, 602, 470, 748), 14, (240, 253, 244), outline=(134, 239, 172), width=2)
        draw.text((92, 626), "外部IDつきデータ", font=F22, fill=(22, 101, 52))
        for i, label in enumerate(["Excel", "CSV", "他システム"]):
            rounded(draw, (92 + i * 120, 682, 188 + i * 120, 724), 10, (255, 255, 255), outline=(187, 247, 208))
            draw.text((108 + i * 120, 693), label, font=F16, fill=(22, 101, 52))


def draw_frame(frame: int) -> Image.Image:
    t = frame / FPS
    img = Image.new("RGB", (WIDTH, HEIGHT), (7, 15, 35))
    draw = ImageDraw.Draw(img)
    background(draw, frame)

    # Brand pill
    rounded(draw, (34, 34, 228, 76), 12, (255, 255, 255), outline=(226, 232, 240))
    draw.text((54, 45), "ボイス見積", font=F22, fill=(15, 23, 42))

    if t < 3.6:
        local = t / 3.6
        center_text(draw, "入力が苦手でも", 138, F40, (255, 255, 255))
        center_text(draw, "音声で見積作成", 192, F40, (186, 230, 253))
        draw_phone_scene(draw, t)
    elif t < 7.6:
        local = (t - 3.6) / 4.0
        center_text(draw, "現場で話した内容を", 128, F32, (255, 255, 255))
        center_text(draw, "明細候補に", 174, F52, (186, 230, 253))
        draw_ui_scene(draw, "draft", local)
    elif t < 11.4:
        local = (t - 7.6) / 3.8
        center_text(draw, "単価マスターで", 128, F36 if False else F32, (255, 255, 255))
        center_text(draw, "価格を統一", 174, F52, (167, 243, 208))
        draw_ui_scene(draw, "master", local)
    else:
        local = (t - 11.4) / 3.6
        center_text(draw, "見積データを", 128, F32, (255, 255, 255))
        center_text(draw, "他システムへ出力", 174, F40, (191, 219, 254))
        draw_ui_scene(draw, "export", local)

    # Bottom safety note / CTA.
    if t < 12.8:
        rounded(draw, (42, 842, 498, 894), 14, (255, 255, 255))
        draw.text((66, 856), "AIは下書き。最後は人が確認。", font=F22, fill=(15, 23, 42))
    else:
        rounded(draw, (64, 824, 476, 900), 16, (255, 255, 255))
        center_text(draw, "先行公開中。デモで確認", 862, F26, (15, 23, 42), max_width=380)

    return img


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with imageio.get_writer(
        OUT,
        fps=FPS,
        codec="libx264",
        quality=8,
        macro_block_size=1,
        ffmpeg_log_level="error",
        output_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart"],
    ) as writer:
        for frame in range(FRAME_COUNT):
            writer.append_data(np.asarray(draw_frame(frame)))
    print(OUT)


if __name__ == "__main__":
    main()
