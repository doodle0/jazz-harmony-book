"""One-off: place widgets and <Hear> pills into the chapters generated from the guide.
The .svx files are the master copy afterwards (plan §6)."""
import pathlib, re
C = pathlib.Path(__file__).resolve().parents[2] / "src/content"

IMPORTS = {
 "WhyV7Pulls": "#lib/widgets/WhyV7Pulls.svelte", "SameSongAnyKey": "#lib/widgets/SameSongAnyKey.svelte",
 "IIVIExplorer": "#lib/widgets/IIVIExplorer.svelte", "ModeBrightness": "#lib/widgets/ModeBrightness.svelte",
 "RubTest": "#lib/widgets/RubTest.svelte", "DominantPalette": "#lib/widgets/DominantPalette.svelte",
 "DeviceAB": "#lib/widgets/DeviceAB.svelte", "Hear": "#lib/widgets/Hear.svelte",
 "Heard": "#lib/components/Heard.svelte",
}

# (file, anchor text, insertion, where) where = 'after' (after the paragraph/table containing anchor) or 'before'
EDITS = {
 "01-function.svx": [
  ("| 마이너 (C) | Dø7 |", '\n<Hear prog="ii-7 | V7 | IΔ7 | %" key="C" style="swing" tempo={132} label="메이저 ii-V-I" /> <Hear prog="iiø7 | V7(♭9, ♭13) | i-6 | %" key="C-" style="swing" tempo={132} label="마이너 ii-V-i" />\n', "after"),
  ("**마이너에서 ø7과 도미넌트 V를 쓰는 이유:**", '\n<Hear prog="iiø7 | v-7 | i-7 | %" key="C-" style="ballad" tempo={70} label="v-7 → i (건조함)" /> <Hear prog="iiø7 | V7(♭9) | i-7 | %" key="C-" style="ballad" tempo={70} label="V7 → i (끌림)" />\n', "after"),
  ("ii-V-I에서 A → B → A(또는 B → A → B)로", "\n<IIVIExplorer />\n", "after"),
  ("**드릴:** 아무 리드시트나", '\n<Heard id="function:drill" />\n', "after"),
 ],
 "02-modes.svx": [
  ("| 로크리안 | 1 ♭2 ♭3 4 **♭5**", "\n<ModeBrightness />\n", "after"),
  ("| Cø7 | 로크리안 | D♭ |", '\n<Hear prog="ii-7 | V7 | IΔ7 | %" key="B♭" style="swing" tempo={120} label="C-7 = B♭의 ii (도리안)" /> <Hear prog="iii-7 | vi-7 | ii-7 | V7" key="A♭" style="swing" tempo={120} label="C-7 = A♭의 iii (프리지안)" />\n', "after"),
  ("G 마이너의 *Autumn Leaves*", '\n<Hear prog="iv-7 | ♭VII7 | ♭IIIΔ7 | ♭VIΔ7 | iiø7 | V7(♭9) | i-6 | %" key="G-" style="swing" tempo={126} label="Autumn Leaves 첫 8마디 (G 마이너)" />\n', "after"),
  ("**리디안과 도리안에는 기피음이 없습니다:**", "\n<RubTest />\n", "after"),
  ("정말 필요한 능력은 어떤 음이 부딪치는지", '\n🎧 [Corcovado (Jobim) 들어 보기](https://www.youtube.com/results?search_query=Corcovado+Jobim+Astrud+Gilberto+Stan+Getz): 멜로디가 기피음 위에 앉아 있는데도 아름답게 들리는 순간을 찾아보세요.\n', "after"),
  ("- **리디안 코드** (C Lyd)", '\n<Hear prog="IΔ7(9, ♯11, 13) | %" key="C" style="pad" tempo={70} label="리디안 코드" /> <Hear prog="i-7(9, 11) | %" key="C" style="pad" tempo={70} label="도리안 코드" />\n', "after"),
 ],
 "03-minor-dominant.svx": [
  ("| 멜로딕 마이너 (상행) | C D E♭ F G **A B**", '\n<Hear prog="iv-7 | v-7 | i-7 | %" key="C-" style="ballad" tempo={72} label="내추럴: v-7 → i" /> <Hear prog="iv-7 | V7(♭9, ♭13) | i-7 | %" key="C-" style="ballad" tempo={72} label="하모닉: V7 → i" /> <Hear prog="iv-7 | V7 | i-Δ7 | %" key="C-" style="ballad" tempo={72} label="멜로딕: i-Δ7" />\n', "after"),
  ("꼭 알아야 할 것은 하나뿐입니다: **5번 모드, 프리지안 도미넌트**", '\n<Hear prog="i-7 | ♭VII7 | ♭VIΔ7 | V7(♭9, ♭13)" key="A-" style="latin" tempo={150} label="안달루시안 케이던스 i–♭VII–♭VI–V" />\n', "after"),
  ("**도미넌트 스케일** = ♮3과 ♭7을 가진 스케일.", "\n<DominantPalette />\n", "before"),
 ],
 "04-bebop.svx": [
  ("**스케일 다섯 개를 외우지 마세요.**", '\n<Hear prog="I6 viio7 | I6 viio7 | I6 viio7 | I6" key="C" style="pad" tempo={96} label="C6 ↔ Bo7 번갈아" /> <Hear prog="i-6 viio7 | i-6 viio7 | i-6 viio7 | i-6" key="C-" style="pad" tempo={96} label="C-6 ↔ Bo7 번갈아" />\n', "after"),
  ("**연습:** *Fly Me to the Moon* 첫 부분을", '\n<Hear prog="vi-7 | ii-7 | V7 | IΔ7 | IVΔ7 | viiø7 | V7/vi | vi-7 V7/ii" key="C" style="swing" tempo={120} label="Fly Me to the Moon 첫 8마디 코드" />\n', "after"),
 ],
 "05-standards.svx": [
  ("숙련된 연주자는 **표면이 아니라 뼈대를 기억하고**", '\n<Hear prog="V7 | IΔ7" key="C" style="swing" tempo={120} label="먹었다: V7 – I" /> <Hear prog="ii-7 | V7 | IΔ7 | %" key="C" style="swing" tempo={120} label="치킨을 먹었다: ii – V7 – I" /> <Hear prog="V7/ii | ii-7 | V7 | IΔ7" key="C" style="swing" tempo={120} label="따뜻한 치킨을 먹었다" />\n', "after"),
  ("`IΔ7 – ♯io7 – ii-7 – ♯iio7 – iii-7`", '\n<DeviceAB set="secondary-dominant" />\n\n<DeviceAB set="sharp-four" color="var(--mustard)" />\n\n<DeviceAB set="dim-sub" color="var(--sky)" />\n', "after"),
  ("한 마디짜리 외출은 보통 으뜸음화라고 부를 가치가 없습니다.", '\n<DeviceAB set="tonicization" color="var(--teal)" />\n', "after"),
  ("**즉시 알아보기:** 목표보다 **반음 위에 있는**", '\n<DeviceAB set="tritone-sub" color="var(--tomato)" />\n', "after"),
  ("5도권을 따라 내려가는 도미넌트의 연쇄", '\n<DeviceAB set="extended-dominants" color="var(--plum)" />\n', "after"),
  ("iii – VI7 – ii – V의 VI7은 V7/ii이므로", '\n<DeviceAB set="iii-biii" color="var(--sky)" />\n', "after"),
  ("- 그 밖에 *Ask Me Now*", '\n<DeviceAB set="chromatic-ii-v" color="var(--mustard)" />\n', "after"),
  ("*Ceora*는 이것들을 겹겹이 씁니다", '\n<DeviceAB set="deceptive" color="var(--plum)" />\n', "after"),
  ("소울, 네오소울, J-팝, 게임 음악에 흔합니다.", '\n<DeviceAB set="modal-interchange" color="var(--teal)" />\n', "after"),
  ("*Yardbird Suite*와 *Misty*에서 들을 수 있습니다", '\n<DeviceAB set="backdoor" color="var(--leaf)" />\n', "after"),
 ],
 "06-modal.svx": [
  ("필수 감상: *So What*", '\n<Hear prog="i-7(9, 11) | % | % | % | ♭ii-7(9, 11) | % | i-7(9, 11) | %" key="D-" style="modal" tempo={132} label="So What 식 도리안 뱀프 (반음 위로 평행 이동)" />\n', "after"),
  ("재즈에서 \"sus\"는 거의 항상 **7sus4**입니다", '\n<Hear prog="I7sus | % | I13sus | %" key="C" style="modal" tempo={100} label="C7sus → C13sus" /> <Hear prog="i-11 | %" key="C" style="pad" tempo={80} label="C-11 (♭3이 있음)" />\n', "after"),
 ],
 "07-workflow.svx": [
  ("모든 마디가 ii-V-I의 아이디어입니다.", '\n<Hear prog="IΔ7 | % | viiø7 V7/vi | vi-7 V7/V | v-7 I7 | IVΔ7 ♭VII7 | IΔ7 | % | ♯ivø7 VII7 | iii-7 VI7 | ii-7 V7 | IΔ7" key="F" style="swing" tempo={150} label="I\'ll Close My Eyes 분석 따라 듣기" />\n', "after"),
 ],
 "09-reference.svx": [
  ("| 코드가 바뀌는 동안 베이스가 순차 하행 | 라인 클리셰 |", '\n**패턴을 귀로:** <Hear prog="ii-7 | V7 | IΔ7 | %" label="ii-V-I" /> <Hear prog="ii-7 | subV7 | IΔ7 | %" label="트라이톤 대체" /> <Hear prog="iii-7 subV7/ii | ii-7 V7 | IΔ7 | %" label="iii–♭III–ii–V" /> <Hear prog="iv-7 | ♭VII7 | IΔ7 | %" label="백도어" /> <Hear prog="ii-7 | V7 | iii-7 | V7/ii" label="위종지" /> <Hear prog="IΔ7 | ♯io7 | ii-7 | V7" label="o7 = 근음 없는 V7♭9" /> <Hear prog="IΔ7 | v-7 I7 | IVΔ7 | %" label="v-7 → IV" /> <Hear prog="♯ivø7 | VII7 | iii-7 VI7 | ii-7 V7" label="샤프 포 워크다운" />\n', "after"),
 ],
}

def insert(text, anchor, block, where):
    i = text.find(anchor)
    if i < 0:
        raise SystemExit(f"anchor not found: {anchor!r}")
    if where == "before":
        start = text.rfind("\n\n", 0, i)
        return text[:start + 2] + block.strip() + "\n\n" + text[start + 2:]
    # end of paragraph / table / list item block containing the anchor
    end = text.find("\n\n", i)
    end = len(text) if end < 0 else end
    return text[:end] + "\n" + block + text[end:]

for f, edits in EDITS.items():
    p = C / f
    t = p.read_text()
    for anchor, block, where in edits:
        if block.strip() in t:
            continue
        t = insert(t, anchor, block, where)
    used = sorted({n for n in IMPORTS if re.search(rf"<{n}\b", t)})
    t = re.sub(r"^<script>.*?</script>\n", "", t, flags=re.S)
    script = "<script>\n" + "".join(f"\timport {n} from '{IMPORTS[n]}';\n" for n in used) + "</script>\n"
    p.write_text(script + t)
    print(f, used)
