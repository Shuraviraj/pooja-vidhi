# Aarti ki recording (MP3) se bol nikalna — Whisper (faster-whisper) GPU pe.
#
# Setup (ek baar):
#   py -3.13 -m venv %USERPROFILE%\.whisper-venv
#   %USERPROFILE%\.whisper-venv\Scripts\pip install faster-whisper nvidia-cublas-cu12 "nvidia-cudnn-cu12==9.*"
# Chalana:
#   %USERPROFILE%\.whisper-venv\Scripts\python scripts\transcribe.py "assets\*.mp3"
#
# Output: assets/transcripts/<naam>.txt (gitignored). Ye sirf milane ke liye hai — Whisper gaane
# mein shabd galat bhi sun sakta hai, isliye content YAML mein bol hamesha dhyan se likho.

import glob
import os
import site
import sys
import time
from pathlib import Path

# Windows: CUDA ki DLLs pip packages (nvidia-*) ke andar hoti hain — unhe dhoondhne layak banao.
for base in site.getsitepackages():
    for d in glob.glob(os.path.join(base, "nvidia", "*", "bin")):
        os.add_dll_directory(d)
        os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]

import av  # noqa: E402
import numpy as np  # noqa: E402
from faster_whisper import WhisperModel  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def load_audio(path: str) -> np.ndarray:
    """MP3 → 16 kHz mono float32. Apna decoder — faster-whisper ka decoder naye PyAV (19+) pe toot jaata hai."""
    resampler = av.AudioResampler(format="s16", layout="mono", rate=16000)
    chunks = []
    with av.open(path) as container:
        for frame in container.decode(audio=0):
            chunks += [f.to_ndarray() for f in resampler.resample(frame)]
    chunks += [f.to_ndarray() for f in resampler.resample(None)]
    return np.concatenate(chunks, axis=1).flatten().astype(np.float32) / 32768.0


OUT = Path(os.environ.get("TRANSCRIPT_DIR", ROOT / "assets" / "transcripts"))
MODEL = os.environ.get("WHISPER_MODEL", "large-v3")

# File ke naam se Devi ka sahi naam — Whisper ko "hotwords" dete hain taaki naam sahi likhe
# ("जैशल पूत्री" nahi, "जय शैलपुत्री").
DEVI = {
    "shail": "शैलपुत्री", "brahm": "ब्रह्मचारिणी", "chandra": "चंद्रघंटा", "kush": "कूष्मांडा",
    "skand": "स्कंदमाता", "kath": "कात्यायनी", "katy": "कात्यायनी", "kaal": "कालरात्रि", "kal": "कालरात्रि",
    "maha": "महागौरी", "siddh": "सिद्धिदात्री",
}


def hotwords(name: str) -> str:
    devi = next((v for k, v in DEVI.items() if name.lower().startswith(k)), "दुर्गा")
    return f"{devi} माँ मैया आरती जय"


def main(files: list[str]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    model = WhisperModel(MODEL, device="cuda", compute_type="float16")
    for f in files:
        name = Path(f).stem
        t0 = time.time()
        segments, info = model.transcribe(
            load_audio(f),
            language="hi",
            beam_size=5,
            # VAD band: gaane mein music ke saath aawaaz ko VAD "speech" nahi maanta aur sab kaat deta hai.
            # Prompt bhi nahi: Whisper use hi dohra deta hai.
            vad_filter=False,
            condition_on_previous_text=False,  # ek line ki galti agli lines mein na faile
            hallucination_silence_threshold=2.0,  # lambe sirf-music hisse mein jo "sune" use chhodo
            word_timestamps=True,  # (hallucination_silence_threshold ke liye zaroori)
            hotwords=hotwords(name),
        )
        lines = [f"[{s.start:6.1f}] {s.text.strip()}" for s in segments]
        (OUT / f"{name}.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
        print(f"✓ {name}: {len(lines)} lines, {info.duration:.0f}s audio, {time.time() - t0:.0f}s", flush=True)


if __name__ == "__main__":
    files = sorted({g for a in sys.argv[1:] for g in glob.glob(a)})
    if not files:
        sys.exit("koi audio file nahi mili — jaise: scripts\\transcribe.py \"assets\\*.mp3\"")
    main(files)
