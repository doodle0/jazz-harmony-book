"""Writes the A/B example sets for chapter 5 devices (src/lib/data/examples/<device>.json).
First pass authored by AI (status 'generated'); review in /review later."""
import json, pathlib

PROV = {"status": "generated", "origin": "ai", "model": "claude-opus-5-5/v1"}
OUT = pathlib.Path(__file__).resolve().parents[2] / "src/lib/data/examples"

def ex(id, title, style, key, tempo, variants, tune=None, era=None, note=None, comp=None):
    e = {"id": id, "title": title, "style": style, "key": key, "tempo": tempo,
         "variants": {k: {"label": l, "prog": p} for k, (l, p) in variants.items()}, "provenance": PROV}
    if tune: e["tune"] = tune
    if era: e["era"] = era
    if note: e["note"] = note
    if comp: e["comp"] = comp
    return e

SETS = {
 "secondary-dominant": ("세컨더리 도미넌트와 세컨더리 ii-V", "I이 아닌 코드 앞에 그 코드의 V7(또는 ii-V)을 놓으면, 목표 코드가 훨씬 또렷하게 도착합니다.", [
   ex("sec-a-train", "II7 – V – I", "swing", "C", 168, {
       "A": ("다이아토닉", "IΔ7 | % | ii-7 | % | ii-7 | V7 | IΔ7 | %"),
       "B": ("V7/V (II7)", "IΔ7 | % | V7(♭5)/V | % | ii-7 | V7 | IΔ7 | %")},
      tune={"title": "Take the A Train", "composer": "Billy Strayhorn", "year": 1939}, era="스윙 시대"),
   ex("sec-misty", "v-7 – I7 → IV", "ballad", "E♭", 62, {
       "A": ("바로 IV", "IΔ7 | % | IVΔ7 | %"),
       "B": ("IV로 가는 ii-V", "IΔ7 | v-7 I7 | IVΔ7 | %")},
      tune={"title": "Misty", "composer": "Erroll Garner", "year": 1954}, era="1950년대", note="뜬금없는 v-7이 보이면 IV로 가는 ii-V가 온다고 기대하세요."),
   ex("sec-waltz-vi", "vi와 ii를 준비하기", "waltz", "B♭", 156, {
       "A": ("다이아토닉", "IΔ7 | % | vi-7 | % | ii-7 | % | V7 | %"),
       "B": ("V7/vi, V7/ii", "IΔ7 | V7/vi | vi-7 | V7/ii | ii-7 | % | V7 | %")}),
   ex("sec-bossa-ii", "세컨더리 ii-V로 ii를 준비", "bossa", "D", 126, {
       "A": ("다이아토닉", "IΔ7 | % | ii-7 | V7"),
       "B": ("iiø7/ii – V7/ii", "IΔ7 | iiø7/ii V7/ii | ii-7 | V7")}),
 ]),
 "tritone-sub": ("트라이톤 대체", "V7을 트라이톤 떨어진 도미넌트로 바꾸면 베이스가 반음씩 내려갑니다(ii – ♭II – I). 가이드톤(3도·7도)은 그대로예요.", [
   ex("tt-ipanema", "ii – ♭II7 – I", "bossa", "F", 128, {
       "A": ("V7", "ii-7 | V7 | IΔ7 | %"),
       "B": ("subV7", "ii-7 | subV7(♯11) | IΔ7 | %")},
      tune={"title": "The Girl from Ipanema", "composer": "Antônio Carlos Jobim", "year": 1962}, era="1960년대"),
   ex("tt-swing", "스윙 턴어라운드", "swing", "C", 150, {
       "A": ("V7", "IΔ7 vi-7 | ii-7 V7"),
       "B": ("subV7", "IΔ7 vi-7 | ii-7 subV7")}),
   ex("tt-ballad", "발라드 종지", "ballad", "A♭", 60, {
       "A": ("V7", "ii-9 | V13 | IΔ9 | %"),
       "B": ("subV7", "ii-9 | subV7(♯11) | IΔ9 | %")}),
   ex("tt-latin", "라틴 ii-V-I", "latin", "E♭", 176, {
       "A": ("V7", "ii-7 | V7 | IΔ7 | %"),
       "B": ("subV7", "ii-7 | subV7 | IΔ7 | %")}),
 ]),
 "backdoor": ("백도어 진행", "ii-V-I이 앞문이라면 iv-7 – ♭VII7 – I은 뒷문입니다. 더 부드럽고 아련하게 도착해요.", [
   ex("bd-yardbird", "IV 다음의 백도어", "bebop", "C", 196, {
       "A": ("앞문 ii-V", "IΔ7 | % | v-7 | I7 | IVΔ7 | ii-7 V7 | IΔ7 | %"),
       "B": ("백도어", "IΔ7 | % | v-7 | I7 | IVΔ7 | iv-7 ♭VII7 | IΔ7 | %")},
      tune={"title": "Yardbird Suite", "composer": "Charlie Parker", "year": 1946}, era="1940년대"),
   ex("bd-ballad", "발라드 마지막 종지", "ballad", "E♭", 58, {
       "A": ("ii-V-I", "ii-7 | V7 | IΔ7 | %"),
       "B": ("iv-7 – ♭VII7 – I", "iv-7 | ♭VII7 | IΔ7 | %")}),
   ex("bd-bossa", "보사노바 백도어", "bossa", "G", 124, {
       "A": ("ii-V-I", "IΔ7 | % | ii-7 | V7"),
       "B": ("백도어", "IΔ7 | % | iv-7 | ♭VII7")}),
 ]),
 "deceptive": ("위종지", "V7이 I 대신 다른 곳에 착지합니다. 재즈에서 가장 흔한 건 ii – V – iii이에요.", [
   ex("dc-misty", "턴어라운드 위종지", "ballad", "E♭", 62, {
       "A": ("V → I", "ii-7 | V7 | IΔ7 | V7/ii"),
       "B": ("V → iii", "ii-7 | V7 | iii-7 | V7/ii"),
       "C": ("V → vi", "ii-7 | V7 | vi-7 | V7/ii")}, tune={"title": "Misty", "composer": "Erroll Garner", "year": 1954}),
   ex("dc-swing", "스윙 위종지", "swing", "F", 144, {
       "A": ("V → I", "ii-7 V7 | IΔ7 | ii-7 V7 | IΔ7"),
       "B": ("V → iii", "ii-7 V7 | iii-7 V7/ii | ii-7 V7 | IΔ7")}),
   ex("dc-waltz", "왈츠 위종지", "waltz", "C", 150, {
       "A": ("V → I", "ii-7 | V7 | IΔ7 | %"),
       "B": ("V → vi", "ii-7 | V7 | vi-7 | V7/ii")}),
 ]),
 "iii-biii": ("iii – ♭III – ii – V – I", "VI7은 V7/ii이니, 그 트라이톤 대체인 ♭III7으로 바꾸면 iii부터 반음씩 미끄러져 내려갑니다.", [
   ex("ib-four", "Four의 엔딩", "bebop", "E♭", 200, {
       "A": ("iii – VI7", "iii-7 V7/ii | ii-7 V7 | IΔ7 | %"),
       "B": ("iii – ♭III7", "iii-7 subV7/ii | ii-7 V7 | IΔ7 | %")}, tune={"title": "Four", "composer": "Miles Davis", "year": 1954}),
   ex("ib-swing", "스윙 엔딩", "swing", "G", 150, {
       "A": ("iii – VI7", "iii-7 V7/ii | ii-7 V7 | IΔ7 | %"),
       "B": ("iii – ♭III7", "iii-7 subV7/ii | ii-7 V7 | IΔ7 | %")}),
   ex("ib-bossa", "보사 엔딩", "bossa", "C", 120, {
       "A": ("iii – VI7", "iii-7 | V7/ii | ii-7 | V7 | IΔ7 | %"),
       "B": ("iii – ♭III7", "iii-7 | subV7/ii | ii-7 | subV7 | IΔ7 | %")}),
 ]),
 "extended-dominants": ("익스텐디드 도미넌트", "5도권을 따라 내려가는 도미넌트의 사슬. 하나 걸러 트라이톤 대체하면 베이스가 반음계로 내려옵니다.", [
   ex("ed-swing", "도미넌트 사슬", "swing", "C", 160, {
       "A": ("5도 사슬", "VII7 | III7 | VI7 | II7 | V7 | % | IΔ7 | %"),
       "B": ("하나 걸러 대체", "VII7 | subV7/vi | VI7 | subV7/V | V7 | % | IΔ7 | %")}),
   ex("ed-hardbop", "하드밥 사슬", "hard-bop", "F", 176, {
       "A": ("5도 사슬", "III7 | VI7 | II7 | V7"),
       "B": ("전부 대체", "subV7/vi | subV7/ii | subV7/V | subV7")}),
   ex("ed-samba", "삼바 사슬", "samba", "D", 112, {
       "A": ("5도 사슬", "VI7 | II7 | V7 | IΔ7"),
       "B": ("하나 걸러 대체", "VI7 | subV7/V | V7 | IΔ7")}),
 ]),
 "chromatic-ii-v": ("반음 하행 ii-V", "도미넌트를 대체한 뒤 다시 ii-V로 쪼개면, ii-V가 반음씩 미끄러져 내려갑니다.", [
   ex("cv-four", "Four의 브리지", "bebop", "E♭", 196, {
       "A": ("iii – VI7", "IΔ7 | iii-7 V7/ii | ii-7 V7 | IΔ7"),
       "B": ("♭iii-7 – ♭VI7", "IΔ7 | ♭iii-7 ♭VI7 | ii-7 V7 | IΔ7")}, tune={"title": "Four", "composer": "Miles Davis", "year": 1954}),
   ex("cv-alice", "Blues for Alice 식 사슬", "swing", "F", 168, {
       "A": ("5도 사슬", "IΔ7 | viiø7 III7 | vi-7 II7 | v-7 I7 | IV7"),
       "B": ("반음 하행", "IΔ7 | viiø7 III7 | vi-7 II7 | v-7 I7 | IV7 | iv-7 ♭VII7 | iii-7 VI7 | ♭iii-7 ♭VI7 | ii-7 V7")},
      tune={"title": "Blues for Alice", "composer": "Charlie Parker", "year": 1951}),
   ex("cv-latin", "라틴 사슬", "latin", "C", 180, {
       "A": ("한 번의 ii-V", "ii-7 | V7 | IΔ7 | %"),
       "B": ("위에서 내려오기", "iii-7 | ♭iii-7 | ii-7 | subV7")}),
 ]),
 "sharp-four": ("샤프 포 워크다운", "♯ivø7 – VII7 – iii – VI7 – ii – V – I. 턴어라운드를 두 마디로 늘리는 고전적인 방법이에요.", [
   ex("s4-close-eyes", "I'll Close My Eyes 식", "swing", "F", 150, {
       "A": ("I에 머물기", "IΔ7 | % | iii-7 VI7 | ii-7 V7"),
       "B": ("샤프 포 워크다운", "♯ivø7 VII7 | iii-7 VI7 | ii-7 V7 | IΔ7")},
      tune={"title": "I'll Close My Eyes", "composer": "Billy Reid", "year": 1945}),
   ex("s4-ballad", "발라드 워크다운", "ballad", "E♭", 60, {
       "A": ("I에 머물기", "IΔ7 | % | ii-7 | V7"),
       "B": ("워크다운", "♯ivø7 | VII7 | iii-7 VI7 | ii-7 V7")}),
   ex("s4-waltz", "왈츠 워크다운", "waltz", "B♭", 150, {
       "A": ("I에 머물기", "IΔ7 | % | % | % | ii-7 | % | V7 | %"),
       "B": ("워크다운", "♯ivø7 | VII7 | iii-7 | VI7 | ii-7 | % | V7 | %")}),
 ]),
 "dim-sub": ("디미니시드 대체", "근음을 뺀 V7(♭9)는 곧 viio7. 세컨더리 도미넌트를 목표의 반음 아래 o7로 바꾸면 베이스가 반음계로 올라갑니다.", [
   ex("dim-swing", "IΔ7 – ♯io7 – ii-7", "swing", "E♭", 144, {
       "A": ("세컨더리 도미넌트", "IΔ7 V7/ii | ii-7 V7/iii | iii-7 V7/ii | ii-7 V7"),
       "B": ("o7 대체", "IΔ7 ♯io7 | ii-7 ♯iio7 | iii-7 V7/ii | ii-7 V7")}),
   ex("dim-ballad", "발라드 o7", "ballad", "F", 64, {
       "A": ("V7/ii", "IΔ7 | V7/ii | ii-7 | V7"),
       "B": ("♯io7", "IΔ7 | ♯io7 | ii-7 | V7")}),
   ex("dim-bossa", "보사 o7", "bossa", "C", 124, {
       "A": ("V7/ii", "IΔ7 | V7/ii | ii-7 | V7"),
       "B": ("♯io7", "IΔ7 | ♯io7 | ii-7 | V7")}),
 ]),
 "modal-interchange": ("모달 인터체인지", "같은 으뜸음의 다른 모드에서 코드를 빌려옵니다. I 앞의 iv-6나 ♭VIΔ7은 메이저 엔딩을 단숨에 어둡게 만들어요.", [
   ex("mi-ballad", "빌려온 iv-6", "ballad", "C", 64, {
       "A": ("IVΔ7", "ii-7 | IVΔ7 | IΔ7 | %"),
       "B": ("iv-6", "ii-7 | iv-6 | IΔ7 | %"),
       "C": ("♭VIΔ7", "ii-7 | ♭VIΔ7 | IΔ7 | %")}),
   ex("mi-soul", "소울 재즈 인터체인지", "hard-bop", "F", 112, {
       "A": ("다이아토닉", "IΔ7 | IVΔ7 | IΔ7 | V7"),
       "B": ("빌려온 코드", "IΔ7 | iv-7 | ♭VIΔ7 | ♭VII7")}),
   ex("mi-bossa", "보사 인터체인지", "bossa", "D", 120, {
       "A": ("IVΔ7", "IΔ7 | % | IVΔ7 | %"),
       "B": ("iv-6", "IΔ7 | % | iv-6 | %")}),
 ]),
 "tonicization": ("으뜸음화", "세컨더리 목표가 손님이 아니라 새 집처럼 들리기 시작하면 으뜸음화입니다.", [
   ex("tz-bell", "III로 으뜸음화", "swing", "F", 168, {
       "A": ("키 안에 머물기", "IΔ7 | % | ii-7 | V7 | IΔ7 | % | ii-7 | V7"),
       "B": ("III로 외출", "IΔ7 | % | ii-7/III | V7/III | IIIΔ7 | % | ii-7 | V7")},
      tune={"title": "If I Were a Bell", "composer": "Frank Loesser", "year": 1950}),
   ex("tz-dolphin", "5도권을 타고 ♭III로", "latin", "E♭", 172, {
       "A": ("키 안에 머물기", "IΔ7 | % | ii-7 | V7"),
       "B": ("♭III로", "IΔ7 | % | ii-7/♭III V7/♭III | ♭IIIΔ7 | ii-7 | V7")},
      tune={"title": "On Green Dolphin Street", "composer": "Bronisław Kaper", "year": 1947}),
   ex("tz-ballad", "발라드 으뜸음화", "ballad", "B♭", 64, {
       "A": ("한 마디 외출", "IΔ7 | ii-7/IV V7/IV | IVΔ7 | V7"),
       "B": ("두 마디 머물기", "IΔ7 | ii-7/IV V7/IV | IVΔ7 | % | ii-7/IV V7/IV | IVΔ7 | ii-7 | V7")}),
 ]),
}

for concept, (title, summary, examples) in SETS.items():
    path = OUT / f"{concept}.json"
    path.write_text(json.dumps({"concept": concept, "title": title, "summary": summary, "examples": examples}, ensure_ascii=False, indent="\t") + "\n")
    print(path.name, len(examples))
