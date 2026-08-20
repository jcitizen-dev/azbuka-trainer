#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Builds vocab.js from a curated entry table.

Declension is done by explicit class, never by blind suffixing: each class
implements a real Serbian paradigm (stem changes, sibilarization, jotation,
fleeting -a), and any form that class would get wrong is passed in by hand.
The output is a plain data file — all seven cases written out literally — so
vocab.js stays readable and editable without rerunning this script.
"""
import io, json, unicodedata

ENTRIES = []
SEEN = {}

CASES = ["nominative","genitive","dative","accusative","vocative","instrumental","locative"]
PALATAL = ("č","ć","đ","dž","j","lj","nj","š","ž","c")
SIBILARIZE = {"k":"c","g":"z","h":"s"}
PALATALIZE = {"k":"č","g":"ž","h":"š","c":"č","z":"ž"}

def slug(s):
    s = unicodedata.normalize("NFKD", s.lower())
    out = []
    for ch in s:
        if ch in "čćšžđ": out.append({"č":"c","ć":"c","š":"s","ž":"z","đ":"d"}[ch])
        elif ch.isalnum(): out.append(ch)
        elif ch in " -": out.append("-")
    return "".join(out)

def ends_palatal(stem):
    return stem.endswith(PALATAL)

def add(entry, supplied):
    """Register an entry, merging repeat supplied forms onto the same lemma."""
    key = entry["word"]
    if key in SEEN:
        e = SEEN[key]
        if supplied and supplied not in e["supplied"]:
            e["supplied"].append(supplied)
        return e
    entry["id"] = slug(key)
    entry["supplied"] = [supplied] if supplied else []
    SEEN[key] = entry
    ENTRIES.append(entry)
    return entry

# ---------------------------------------------------------------- paradigms
def fem_a(w, dat=None, voc=None, ins=None, gen=None, acc=None):
    """Feminine a-stem: kuća, zemlja, majka."""
    stem = w[:-1]
    dl = dat
    if dl is None:
        if stem[-1] in SIBILARIZE:            # sibilarization: ruka -> ruci
            dl = stem[:-1] + SIBILARIZE[stem[-1]] + "i"
        else:
            dl = stem + "i"
    if voc is None:
        voc = stem + "e" if w.endswith("ica") else stem + "o"
    return {
        "nominative": w,
        "genitive": gen or stem + "e",
        "dative": dl,
        "accusative": acc or stem + "u",
        "vocative": voc,
        "instrumental": ins or stem + "om",
        "locative": dl,
    }

def fem_i(w, ins):
    """Feminine i-stem: reč, ljubav, stvar. Instrumental is always supplied."""
    return {
        "nominative": w, "genitive": w + "i", "dative": w + "i",
        "accusative": w, "vocative": w + "i", "instrumental": ins, "locative": w + "i",
    }

def masc(w, en_stem=None, anim=False, voc=None, ins=None, gen=None):
    """Masculine consonant stem. en_stem covers fleeting -a and l/o changes
    (momak -> momk-, posao -> posl-, ranac -> ranc-)."""
    stem = en_stem or w
    if ins is None:
        ins = stem + ("em" if ends_palatal(stem) else "om")
    if voc is None:
        if stem.endswith("c"):                       # pisac -> pišče is overridden
            voc = stem[:-1] + "če"
        elif ends_palatal(stem):
            voc = stem + "u"
        elif stem[-1] in PALATALIZE:                 # vojnik -> vojniče
            voc = stem[:-1] + PALATALIZE[stem[-1]] + "e"
        else:
            voc = stem + "e"
    g = gen or stem + "a"
    return {
        "nominative": w, "genitive": g, "dative": stem + "u",
        "accusative": g if anim else w,
        "vocative": voc, "instrumental": ins, "locative": stem + "u",
    }

def neut(w, kind="o", ins=None):
    """Neuter. kind: o (selo), e (polje), et (parče), en (vreme)."""
    base = w[:-1]
    if kind == "et": stem, i = base + "et", "om"
    elif kind == "en": stem, i = base + "en", "om"
    elif kind == "e":  stem, i = base, "em"
    else:              stem, i = base, "om"
    return {
        "nominative": w, "genitive": stem + "a", "dative": stem + "u",
        "accusative": w, "vocative": w, "instrumental": ins or stem + i,
        "locative": stem + "u",
    }

def plural_only(n, g, dat):
    """Plurale tantum: makaze, vrata."""
    return {"nominative": n, "genitive": g, "dative": dat, "accusative": n,
            "vocative": n, "instrumental": dat, "locative": dat}

# ---------------------------------------------------------------- helpers
def NOUN(word, en, cases, gender, anim=False, supplied=None, plural=None,
         note=None, flag=None, tags=(), practice=True, number="singular"):
    e = {"word": word, "type": "noun", "en": en, "gender": gender,
         "animacy": "animate" if anim else "inanimate", "number": number,
         "cases": cases, "tags": list(tags), "practice": practice}
    if plural: e["plural"] = plural
    if note: e["note"] = note
    if flag: e["flag"] = flag
    return add(e, supplied or word)

def M(word, en, anim=False, supplied=None, **kw):
    par = {k: kw.pop(k) for k in ("en_stem","voc","ins","gen") if k in kw}
    return NOUN(word, en, masc(word, anim=anim, **par), "masculine", anim, supplied, **kw)

def F(word, en, supplied=None, **kw):
    par = {k: kw.pop(k) for k in ("dat","voc","ins","gen","acc") if k in kw}
    return NOUN(word, en, fem_a(word, **par), "feminine", False, supplied, **kw)

def FI(word, en, ins, supplied=None, **kw):
    return NOUN(word, en, fem_i(word, ins), "feminine", False, supplied, **kw)

def N(word, en, kind="o", supplied=None, **kw):
    par = {k: kw.pop(k) for k in ("ins",) if k in kw}
    return NOUN(word, en, neut(word, kind, **par), "neuter", False, supplied, **kw)

def ADJ(word, en, f=None, n=None, pl=None, supplied=None, note=None, flag=None):
    stem = word
    e = {"word": word, "type": "adjective", "en": en,
         "forms": {"masculine": word,
                   "feminine": f or (stem + "a"),
                   "neuter": n or (stem + "o"),
                   "plural": pl or (stem + "i")},
         "practice": True}
    if note: e["note"] = note
    if flag: e["flag"] = flag
    return add(e, supplied or word)

def V(inf, en, aspect=None, supplied=None, note=None, flag=None):
    e = {"word": inf, "type": "verb", "en": en, "practice": True}
    if aspect: e["aspect"] = aspect
    if note: e["note"] = note
    if flag: e["flag"] = flag
    return add(e, supplied or inf)

def W(word, en, kind, supplied=None, note=None, flag=None, practice=True, case=None):
    e = {"word": word, "type": kind, "en": en, "practice": practice}
    if case: e["governs"] = case
    if note: e["note"] = note
    if flag: e["flag"] = flag
    return add(e, supplied or word)

def PHRASE(word, en, **kw):  return W(word, en, "phrase", **kw)
def ADV(word, en, **kw):     return W(word, en, "adverb", **kw)
def PREP(word, en, **kw):    return W(word, en, "preposition", **kw)
def CONJ(word, en, **kw):    return W(word, en, "conjunction", **kw)
def PRON(word, en, **kw):    return W(word, en, "pronoun", **kw)
def UNCLEAR(word, en, flag): return W(word, en, "unclear", flag=flag, practice=False)

# ================================================================ VOCABULARY
# Order follows the supplied list. Repeats of a lemma merge onto the first
# entry and keep the supplied form in `supplied`.

V("stati", "to stop; to stand", "perfective", supplied="stanem", note="stanem = 1sg present")
V("početi", "to begin", "perfective", supplied="počnem", note="počnem = 1sg present")
V("dobiti", "to get, receive", "perfective", supplied="dobijem", note="dobijem = 1sg present")
V("pisati", "to write", "imperfective", supplied="pišem", note="pišem = 1sg present")
NOUN("deca", "children", fem_a("deca"), "feminine", False, "deca",
     note="Collective noun: declines like a feminine a-stem but takes plural agreement.",
     tags=("person",))
M("roditelj", "parent", anim=True, supplied="roditelji", plural="roditelji",
  voc="roditelju", ins="roditeljem", tags=("person",))
V("biti", "to be", supplied="su", note="su = 3rd person plural present")
F("zemlja", "country; land; earth", tags=("place",))
N("selo", "village", tags=("place",))
N("nebo", "sky", note="Plural is irregular: nebesa.")
M("zid", "wall", tags=("thing",))
F("sveska", "notebook", dat=["svesci","sveski"], tags=("thing",),
  note="Sibilarization (svesci) is the standard form; sveski is common in speech.")
M("jastuk", "pillow", tags=("thing",))
CONJ("ako", "if")
F("avantura", "adventure", tags=("abstract",))
ADJ("blesav", "silly, goofy")
F("čarapa", "sock", tags=("clothing",))
ADJ("čist", "clean", supplied="čisto", note="čisto = neuter form, also used as the adverb 'cleanly'")
M("dom", "home", tags=("place",))
M("drug", "friend", anim=True, supplied="druga", tags=("person",),
  flag="Supplied as 'druga', which is ambiguous: genitive of 'drug', the feminine noun 'druga', or the adjective 'drugi' (second/other). Stored as the dictionary form 'drug'.")
ADV("gotovo", "almost; done")
M("jezik", "language; tongue", tags=("thing","abstract"))
V("krenuti", "to set off, start moving", "perfective", supplied="krenula",
  note="krenula = feminine singular past")
V("koristiti", "to use", "imperfective")
F("lopta", "ball", tags=("thing",))
M("most", "bridge", tags=("thing","place"))
PREP("od", "from; of", case="genitive")
ADV("odmah", "right away")
ADJ("opasan", "dangerous", f="opasna", n="opasno", supplied="opasno")
V("prati", "to wash", "imperfective", supplied="perem", note="perem = 1sg present")
V("pomagati", "to help", "imperfective", supplied="pomažem", note="pomažem = 1sg present")
V("pozvati", "to call; to invite", "perfective", supplied="pozovem", note="pozovem = 1sg present")
ADJ("prljav", "dirty", supplied="prljavo")
FI("reč", "word", ins=["rečju","reči"], tags=("thing","abstract"))
V("sakriti", "to hide", "perfective", supplied="sakrila", note="sakrila = feminine singular past")
ADJ("slobodan", "free", f="slobodna", n="slobodno", supplied="slobodno")
ADJ("spreman", "ready", f="spremna", n="spremno", supplied="spremna")
M("sud", "dish; pot", supplied="sudovi", plural="sudovi", tags=("thing",),
  note="Plural 'sudovi' is the everyday word for dirty dishes.")
N("posuđe", "dishes, dishware", kind="e", tags=("thing",), note="Collective noun.")
F("šminka", "makeup", dat=["šminki","šminci"], tags=("thing",))
PRON("sve", "everything; all")
ADV("tako", "so, like that")
ADV("tamo", "there")
ADJ("ukusan", "tasty", f="ukusna", n="ukusno", supplied="ukusno")
F("ulaznica", "admission ticket", tags=("thing",))
F("učiteljica", "teacher (female)", tags=("person",))
N("voće", "fruit", kind="e", tags=("food",), note="Collective noun.")
F("vežba", "exercise", tags=("abstract",))
V("zaboraviti", "to forget", "perfective", supplied="zaboravio", note="zaboravio = masculine singular past")
ADV("zajedno", "together")
CONJ("zato", "that's why; because")
N("zdravlje", "health", kind="e", tags=("abstract",))
V("značiti", "to mean", "imperfective", supplied="znači", note="znači = 3sg present")
PREP("pored", "next to", case="genitive")
ADV("ovde", "here")
V("umiti", "to wash (someone's face)", "perfective")
ADJ("loš", "bad", supplied="loše", note="loše = neuter form, also the adverb 'badly'")
F("novinarka", "journalist (female)", dat="novinarki", tags=("person",))
M("lekar", "doctor", anim=True, voc=["lekaru","lekare"], tags=("person",))
ADV("trenutno", "currently")
F("pevačica", "singer (female)", tags=("person",))
ADV("često", "often")
ADV("uveče", "in the evening")
V("čitati", "to read", "imperfective")
V("ručati", "to have lunch", supplied="ručate", note="ručate = 2nd person plural present")
ADV("mnogo", "a lot")
ADV("daleko", "far")
ADJ("lak", "easy; light", f="laka", n="lako",
    flag="Also a masculine noun meaning 'varnish, polish'. Stored as the adjective.")
ADJ("težak", "hard; heavy", f="teška", n="teško", pl="teški")
ADV("retko", "rarely")
ADV("blizu", "near")
V("sviđati se", "to like, to appeal to", "imperfective", supplied="sviđa",
  note="sviđa = 3sg present. Used as: to mi se sviđa = I like it.")
PRON("to", "that")
F("boja", "color", tags=("thing","abstract"))
M("posao", "job, work", en_stem="posl", tags=("abstract","place"),
  note="Irregular stem: posao → posl-.")
ADJ("tih", "quiet", f="tiha", supplied="tiha")
PRON("svi", "everyone; all")
ADV("rano", "early")
V("družiti se", "to hang out", "imperfective", supplied="družim", note="družim = 1sg present")
V("ustajati", "to get up", "imperfective", supplied="ustajem", note="ustajem = 1sg present")
ADV("dugo", "for a long time")
ADJ("dug", "long", f="duga", n="dugo", pl="dugi", supplied="duge",
    flag="Also a masculine noun meaning 'debt'. Stored as the adjective.")
V("igrati", "to play; to dance", "imperfective")
M("saobraćaj", "traffic", tags=("abstract",))
ADJ("širok", "wide", f="široka", n="široko", pl="široki", supplied="široki")
ADJ("zanimljiv", "interesting", supplied="zanimljivi")
F("ulica", "street", supplied="ulice", plural="ulice", tags=("place",))
F("reka", "river", dat="reci", supplied="reke", plural="reke", tags=("place",))
F("gužva", "crowd; traffic jam", tags=("abstract",))
F("zgrada", "building", supplied="zgrade", plural="zgrade", tags=("place","thing"))
ADJ("visok", "tall, high", f="visoka", n="visoko", pl="visoki", supplied="visoke")
ADJ("važan", "important", f="važna", n="važno", pl="važni", supplied="važno")
ADJ("nevažan", "unimportant", f="nevažna", n="nevažno", pl="nevažni", supplied="nevažno")
F("država", "country, state", tags=("place",))
ADJ("strašan", "scary; terrible", f="strašna", n="strašno", pl="strašni")
ADJ("zabavan", "fun", f="zabavna", n="zabavno", pl="zabavni")
ADJ("poznat", "well-known", supplied="poznat")
N("pozorište", "theater", kind="e", tags=("place",))
ADJ("skup", "expensive", supplied="skupi")
ADV("pravo", "straight ahead",
    flag="Also a neuter noun meaning 'right; law'. Stored as the adverb.")
ADV("nazad", "back")
ADJ("narodni", "folk, national", f="narodna", n="narodno", pl="narodni", supplied="narodno")
PREP("ispred", "in front of", case="genitive")
PREP("iza", "behind", case="genitive")
N("igralište", "playground", kind="e", tags=("place",))
N("takmičenje", "competition", kind="e", tags=("abstract",))
N("putovanje", "trip, travel", kind="e", tags=("abstract",))
N("letovalište", "summer resort", kind="e", tags=("place",))
N("letovanje", "summer vacation", kind="e", tags=("abstract",))
F("pesma", "song", supplied="pesme", plural="pesme", tags=("thing","abstract"))
ADJ("ceo", "whole", f="cela", n="celo", pl="celi", supplied="cela")
ADJ("drugačiji", "different", f="drugačija", n="drugačije", pl="drugačiji")
F("potreba", "need", supplied="potrebe", plural="potrebe", tags=("abstract",))
V("kretati se", "to move; to set off", "imperfective", supplied="kreće", note="kreće = 3sg present")
ADV("onda", "then")
F("planina", "mountain", tags=("place",))
F("žurka", "party", dat="žurki", tags=("abstract","place"))
PREP("na", "on; to", case="accusative or locative")

F("promena", "change", supplied="promema", tags=("abstract",),
  flag="Supplied as 'promema' — almost certainly a typo for 'promena' (change). Stored under the corrected spelling.")
V("praviti", "to make", "imperfective")
ADV("ponekad", "sometimes")
ADV("uvek", "always")
N("ostrvo", "island", tags=("place",))
V("stići", "to arrive", "perfective", supplied="stignem", note="stignem = 1sg present")
N("druženje", "hanging out, socializing", kind="e", tags=("abstract",))
V("zaposliti", "to hire, to employ", "perfective", supplied="zaposlem",
  flag="Supplied as 'zaposlem'; the standard 1sg present is 'zaposlim'.")
ADV("kasnije", "later")
ADV("možda", "maybe")
ADV("naravno", "of course")
ADV("sada", "now")
M("ronilac", "diver", anim=True, en_stem="ronioc", voc="ronioče", supplied="ronilac",
  plural="ronioci", tags=("person",), note="Stem change: ronilac → ronioc-.")
ADV("duboko", "deep, deeply")
ADJ("naporan", "strenuous, exhausting", f="naporna", n="naporno", pl="naporni", supplied="naporno")
V("lečiti", "to treat (medically)", "imperfective")
ADJ("bolestan", "sick", f="bolesna", n="bolesno", pl="bolesni", supplied="bolesne")
ADJ("jak", "strong", f="jaka", n="jako", pl="jaki")
F("oprema", "equipment", supplied="opremu", tags=("thing",),
  note="Supplied as the accusative 'opremu'.")
ADJ("hrabar", "brave", f="hrabra", n="hrabro", pl="hrabri")
M("vojnik", "soldier", anim=True, tags=("person",))
ADJ("različit", "different, various", supplied="različiti")
ADJ("iskren", "honest, sincere")
ADJ("fin", "nice, fine")
M("duh", "spirit; ghost", anim=True, voc="duše", tags=("abstract",))
ADJ("ljubazan", "kind, polite", f="ljubazna", n="ljubazno", pl="ljubazni")
ADV("obično", "usually")
ADJ("običan", "ordinary", f="obična", n="obično", pl="obični")
NOUN("makaze", "scissors", plural_only("makaze","makaza","makazama"), "feminine",
     False, "makaze", number="plural", tags=("thing",),
     note="Plurale tantum — exists only in the plural, so its cases are plural forms.")
PRON("neko", "someone")
M("pisac", "writer", anim=True, en_stem="pisc", voc="pišče", tags=("person",),
  note="Irregular stem change: pisac → pisc-; vocative palatalizes to pišče.")
FI("stvar", "thing", ins=["stvarju","stvari"], supplied="stvari", plural="stvari", tags=("thing",))
PHRASE("u pravu", "right, correct (as in 'you are right')", supplied="upravu",
       flag="Supplied as one word 'upravu'; written as two words 'u pravu' (biti u pravu = to be right).")
N("zanimanje", "occupation, profession", kind="e", tags=("abstract",))
F("plata", "salary", tags=("abstract",))
M("ples", "dance", tags=("abstract",))
F("izložba", "exhibition", tags=("abstract","place"))
N("jezero", "lake", tags=("place",))
PHRASE("na sreću", "fortunately")
PHRASE("zar ne", "right?, isn't it?")
PHRASE("je l' da", "right?, isn't that so?", supplied="jel da",
       flag="Supplied as 'jel da' — colloquial spelling of 'je l' da'.")
CONJ("jer", "because")
ADV("već", "already")
ADV("nekada", "once, in the past")
PHRASE("šteta je", "it's a shame")
ADV("više", "more")
ADV("nažalost", "unfortunately")
F("životinja", "animal", supplied="životinje", plural="životinje", tags=("animal",))
V("duvati", "to blow", "imperfective", supplied="duva", note="duva = 3sg present")
M("vetar", "wind", en_stem="vetr", voc="vetre", tags=("thing",), note="Fleeting a: vetar → vetr-.")
N("vreme", "weather; time", kind="en", tags=("abstract",),
  note="-en- stem: vreme → vremen-.")
PHRASE("na poslu", "at work")
V("odmarati", "to rest", "imperfective")
ADV("opušteno", "in a relaxed way")
W("neka", "let it be; okay", "particle")
PREP("o", "about", case="locative")
M("mir", "peace; calm", tags=("abstract",))
UNCLEAR("nature", "nature",
        "English word in the source list. The Serbian equivalent is 'priroda', but no Serbian word was supplied, so nothing is practiced here.")
ADJ("bolji", "better", f="bolja", n="bolje", pl="bolji", note="Comparative of 'dobar'.")
ADV("veoma", "very")
PRON("svako", "everyone")
V("leteti", "to fly", "imperfective", supplied="letim", note="letim = 1sg present")
ADJ("omiljeni", "favorite", f="omiljena", n="omiljeno", pl="omiljeni")
F("ajkula", "shark", supplied="ajkule", plural="ajkule", tags=("animal",))
ADJ("mokar", "wet", f="mokra", n="mokro", pl="mokri", supplied="mokri")
M("momak", "guy; boyfriend", anim=True, en_stem="momk", voc="momče", tags=("person",),
  note="Fleeting a: momak → momk-; vocative momče.")
ADJ("vozački", "driver's (as in driver's license)", f="vozačka", n="vozačko",
    pl="vozački", supplied="vozačka", note="Collocation: vozačka dozvola = driver's license.")
F("dozvola", "permit, license", tags=("thing",))
M("radnik", "worker", anim=True, tags=("person",))
UNCLEAR("zavici", "unclear",
        "Not a standard Serbian word as supplied. Possibly 'zavičaj' (homeland) or 'zanati' (trades). Left unpracticed rather than guessed.")
V("tražiti", "to look for", "imperfective", supplied="traži", note="traži = 3sg present")
PREP("kroz", "through", case="accusative")
M("odmor", "rest; vacation", tags=("abstract",))
M("lek", "medicine", voc="leče", tags=("thing",))
F("glavobolja", "headache", tags=("abstract",))
M("bol", "pain", tags=("abstract",),
  flag="Usually masculine ('bol' → 'bola'). In the sense of emotional pain it can be feminine (bol → boli). Stored as masculine.")
FI("bolest", "illness", ins=["bolešću","bolesti"], tags=("abstract",))
M("ranac", "backpack", en_stem="ranc", tags=("thing",), note="Fleeting a: ranac → ranc-.")
FI("ljubav", "love", ins=["ljubavlju","ljubavi"], supplied="ljubavi", tags=("abstract",))
N("društvo", "company; society", tags=("abstract",))
F("prodavnica", "store", supplied="prodavnica", tags=("place",))
M("smeštaj", "accommodation", tags=("abstract",))
F("poruka", "message", dat="poruci", tags=("thing","abstract"))
N("pismo", "letter", tags=("thing",))
V("birati", "to choose", "imperfective")
V("posetiti", "to visit", "perfective")
ADJ("preporučen", "recommended", f="preporučena", n="preporučeno", pl="preporučeni",
    supplied="preporučena")
F("razglednica", "postcard", supplied="razglendince", plural="razglednice", tags=("thing",),
  flag="Supplied as 'razglendince' — a typo for 'razglednice' (postcards). Stored under the singular 'razglednica'.")
ADJ("najbolji", "best", f="najbolja", n="najbolje", pl="najbolji", note="Superlative of 'dobar'.")
F("nagrada", "prize, award", tags=("thing","abstract"))
F("ponuda", "offer", tags=("abstract",))
F("patika", "sneaker", dat="patiki", supplied="patike", plural="patike", tags=("clothing",))
F("odeća", "clothing", tags=("clothing",), note="Collective noun.")
F("obuća", "footwear", tags=("clothing",), note="Collective noun.")
F("majica", "T-shirt", tags=("clothing",))
F("košulja", "shirt", tags=("clothing",))
F("svadba", "wedding", tags=("abstract",))
ADJ("svečan", "formal, festive", supplied="svečano")
F("trenerka", "tracksuit", dat="trenerki", tags=("clothing",))
ADJ("donji", "lower", f="donja", n="donje", pl="donji", supplied="donja")
ADJ("gornji", "upper", f="gornja", n="gornje", pl="gornji", supplied="gonja",
    flag="Supplied as 'gonja' — not a Serbian word; read as a typo for 'gornja' (upper), the counterpart of the preceding 'donja'.")
F("čizma", "boot", supplied="čizme", plural="čizme", tags=("clothing",))
F("cipela", "shoe", supplied="cipele", plural="cipele", tags=("clothing",))
F("štikla", "high heel", dat="štikli", supplied="štikle", plural="štikle", tags=("clothing",))
F("sandala", "sandal", supplied="sandale", plural="sandale", tags=("clothing",))
M("kaiš", "belt", tags=("clothing",))
F("kapa", "cap, beanie", tags=("clothing",))
M("šešir", "hat", voc=["šeširu","šešire"], tags=("clothing",))
M("kačket", "flat cap", tags=("clothing",))
M("kaput", "coat", tags=("clothing",))
M("mantil", "trench coat", tags=("clothing",))
F("kravata", "necktie", tags=("clothing",))
PHRASE("žensko odelo", "women's suit")
M("kišobran", "umbrella", tags=("thing",))
M("nakit", "jewelry", tags=("thing",), note="Collective noun.")
M("prsten", "ring", tags=("thing",))
F("ogrlica", "necklace", tags=("thing",))
F("minđuša", "earring", supplied="minđuše", plural="minđuše", tags=("thing",))
M("sat", "clock, watch; hour", tags=("thing",))
PHRASE("zidni sat", "wall clock")
PHRASE("ručni sat", "wristwatch")
M("šorts", "shorts", tags=("clothing",))
PHRASE("kupaći kostim", "swimsuit")
FI("jesen", "fall, autumn", ins=["jeseni","jesenju"], tags=("abstract",))
ADV("obavezno", "definitely, without fail")
ADJ("ljubičast", "purple")
F("kabanica", "raincoat", tags=("clothing",))
ADV("dovoljno", "enough")
F("suknja", "skirt", tags=("clothing",))
N("leto", "summer", tags=("abstract",))
M("vatrogasac", "firefighter", anim=True, en_stem="vatrogasc", voc="vatrogasče",
  supplied="vatrogasci", plural="vatrogasci", tags=("person",),
  note="Fleeting a: vatrogasac → vatrogasc-.")
ADJ("neobičan", "unusual", f="neobična", n="neobično", pl="neobični")
M("zapad", "west", tags=("place",))
V("naći", "to find", "perfective", supplied="nači",
  flag="Also supplied as 'nači' — a typo for 'naći'.")
M("hram", "temple", tags=("place",))
FI("prošlost", "the past", ins=["prošlošću","prošlosti"], tags=("abstract",))
FI("sadašnjost", "the present", ins=["sadašnjošću","sadašnjosti"], tags=("abstract",))
N("iznenađenje", "surprise", kind="e", tags=("abstract",))
ADJ("ogroman", "huge", f="ogromna", n="ogromno", pl="ogromni")
ADV("ranije", "earlier")
ADJ("takav", "such, like that", f="takva", n="takvo", pl="takvi")
N("dvorište", "yard", kind="e", tags=("place",))
ADJ("uzak", "narrow", f="uska", n="usko", pl="uski", supplied="uzak")
ADJ("pretrpan", "overcrowded", f="pretrpana", n="pretrpano", pl="pretrpani")
ADJ("uzbudljiv", "exciting", supplied="uzbudljivo")
ADJ("vlažan", "damp, humid", f="vlažna", n="vlažno", pl="vlažni")
ADV("stalno", "constantly")
ADJ("bogat", "rich")
ADJ("siromašan", "poor", f="siromašna", n="siromašno", pl="siromašni")
ADJ("koristan", "useful", f="korisna", n="korisno", pl="korisni")
ADJ("jeftin", "cheap")
ADJ("prijatan", "pleasant", f="prijatna", n="prijatno", pl="prijatni")
V("rezervisati", "to reserve, to book")
ADV("juče", "yesterday")
UNCLEAR("again", "again",
        "English word in the source list. Serbian would be 'opet' or 'ponovo', but no Serbian word was supplied, so nothing is practiced here.")
M("sastanak", "meeting", en_stem="sastank", voc="sastanče", tags=("abstract",),
  note="Fleeting a: sastanak → sastank-.")
ADJ("prošli", "last, previous", f="prošla", n="prošlo", pl="prošli", supplied="prošle")
M("sajam", "fair, expo", en_stem="sajm", voc="sajme", tags=("place","abstract"),
  note="Fleeting a: sajam → sajm-.")
ADJ("siv", "gray", supplied="sivo")
ADJ("kožni", "leather", f="kožna", n="kožno", pl="kožni", supplied="kožna")
F("strava", "horror; (slang) awesome", tags=("abstract",),
  flag="In speech 'strava' is slang for 'awesome'; the literal noun means 'horror, dread'.")
M("svet", "world", tags=("place","abstract"))
N("inostranstvo", "abroad, foreign countries", tags=("place",))
ADJ("staklen", "glass (made of glass)", f="staklena", n="stakleno", pl="stakleni",
    supplied="staklena")
F("flaša", "bottle", tags=("thing",))
F("čaša", "drinking glass", tags=("thing",))
F("železnica", "railroad", tags=("place","abstract"))
M("ljubimac", "pet", anim=True, en_stem="ljubimc", voc="ljubimče", tags=("animal",),
  note="Fleeting a: ljubimac → ljubimc-.")
ADJ("vredan", "hardworking; valuable", f="vredna", n="vredno", pl="vredni")
ADJ("lenj", "lazy", f="lenja", n="lenjo", pl="lenji")
F("godišnjica", "anniversary", tags=("abstract",))
F("veza", "relationship; connection", tags=("abstract",))
PREP("u", "in; to", case="accusative or locative")
PREP("iznad", "above", case="genitive")
PREP("ispod", "below", case="genitive")
PREP("između", "between", case="genitive")
PREP("kod", "at (someone's place)", case="genitive")
PHRASE("daleko od", "far from")
PHRASE("levo od", "to the left of")
PHRASE("desno od", "to the right of")
PHRASE("preko puta", "across from")
PHRASE("u sredini", "in the middle")
PHRASE("spavaća soba", "bedroom")
PHRASE("dnevna soba", "living room")
F("trpezarija", "dining room", tags=("place",))
N("kupatilo", "bathroom", tags=("place",))
F("vešernica", "laundry room", tags=("place",))
F("kuhinja", "kitchen", tags=("place",))
F("terasa", "terrace, balcony", tags=("place",))
PHRASE("radni sto", "desk")
M("sto", "table", en_stem="stol", tags=("thing",), note="Irregular stem: sto → stol-.")
F("stolica", "chair", supplied="stolice", plural="stolice", tags=("thing",))
M("kauč", "couch", tags=("thing",))
M("trosed", "three-seat sofa", tags=("thing",))
M("dvosed", "loveseat", tags=("thing",))
F("fotelja", "armchair", tags=("thing",))
M("krevet", "bed", tags=("thing",))
M("orman", "wardrobe, closet", tags=("thing",))
M("garderober", "wardrobe unit", tags=("thing",))
M("lavabo", "bathroom sink", gen="lavaboa", ins="lavaboom", voc="lavabo", tags=("thing",),
  note="Foreign noun ending in -o: keeps the -o through the stem (lavaboa, lavabou).")
F("sudopera", "kitchen sink", tags=("thing",))
M("šporet", "stove", tags=("thing",))
F("rerna", "oven", tags=("thing",))
F("ringla", "stovetop burner", dat="ringli", supplied="ringle", plural="ringle", tags=("thing",))
M("bojler", "water heater", tags=("thing",))
M("radijator", "radiator", tags=("thing",))
FI("peć", "stove, furnace", ins=["peći","peću"], tags=("thing",))
PHRASE("peć na drva", "wood stove")
PHRASE("električna peć", "electric stove")
PHRASE("peć na gas", "gas stove")
F("lampa", "lamp", tags=("thing",))
M("televizor", "TV set", tags=("thing",))
F("slika", "picture, painting", dat="slici", supplied="slike", plural="slike", tags=("thing",))
M("tepih", "rug, carpet", tags=("thing",))
F("polica", "shelf", supplied="police", plural="police", tags=("thing",))
F("kada", "bathtub", tags=("thing",),
  flag="Also the adverb/conjunction 'kada' (when). Stored as the noun 'bathtub'.")
F("komoda", "dresser", tags=("thing",))
M("luster", "chandelier", tags=("thing",))
ADJ("stran", "foreign")
ADJ("udoban", "comfortable", f="udobna", n="udobno", pl="udobni")
NOUN("vrata", "door", plural_only("vrata","vrata","vratima"), "neuter", False, "vrata",
     number="plural", tags=("thing",),
     note="Plurale tantum — always plural, even for a single door.")
N("parče", "piece", kind="et", tags=("thing","food"),
  note="-et- stem: parče → parčet-.")
ADV("ikad", "ever")
V("naručiti", "to order", "perfective")
F("kaša", "porridge", tags=("food",))
M("kukuruz", "corn", tags=("food",))
PREP("tokom", "during", case="genitive")

# ================================================================ COVERAGE
EXTRA_SUPPLIED = {
    # supplied form -> lemma it belongs to (forms of a word already entered)
    "krenula":"krenuti", "zaboravio":"zaboraviti", "znači":"značiti", "pišem":"pisati",
    "duge":"dug", "visoke":"visok", "cela":"ceo", "celo":"ceo", "uska":"uzak", "usko":"uzak",
    "korisna":"koristan", "poznata":"poznat", "važno":"važan", "ronioci":"ronilac",
    "stvari":"stvar", "prodavnicama":"prodavnica", "stolicu":"stolica", "nači":"naći",
    "ljubavi":"ljubav", "opremu":"oprema", "iza":"iza", "ispred":"ispred",
    "pored":"pored", "blizu":"blizu",
}

def register_extra():
    for form, lemma in EXTRA_SUPPLIED.items():
        e = SEEN.get(lemma)
        if e and form not in e["supplied"] and form != lemma:
            e["supplied"].append(form)

def coverage(path="tools/source_list.txt"):
    src = [l.strip() for l in io.open(path, encoding="utf-8") if l.strip()]
    known = set()
    for e in ENTRIES:
        known.add(e["word"])
        for s in e["supplied"]: known.add(s)
    missing = [w for w in src if w not in known]
    return src, missing

# ================================================================ EMIT
def emit(path="vocab.js"):
    register_extra()
    src, missing = coverage()
    if missing:
        raise SystemExit("Not covered: " + ", ".join(missing))
    counts = {}
    for e in ENTRIES: counts[e["type"]] = counts.get(e["type"], 0) + 1
    body = ",\n".join("  " + json.dumps(e, ensure_ascii=False, sort_keys=False) for e in ENTRIES)
    head = f"""/* vocab.js — Serbian vocabulary database for Padez Trainer.
 *
 * Generated by tools/build_vocab.py, but this file is the source of truth the
 * app reads: every case form is written out literally. To add a word, append an
 * object below — nothing else needs to change.
 *
 * Source list: {len(src)} entries -> {len(ENTRIES)} unique lemmas.
 * {", ".join(f"{k}: {v}" for k, v in sorted(counts.items()))}
 *
 * Noun fields: word, gender, animacy, number, cases (all seven, singular unless
 * number is "plural"), plural (nominative plural where supplied), tags, note,
 * flag. A case value may be an array when Serbian allows more than one form —
 * the app accepts any of them and shows the first as the primary answer.
 */
const VOCAB = [
"""
    io.open(path, "w", encoding="utf-8").write(head + body + "\n];\n")
    print(f"{path}: {len(ENTRIES)} lemmas from {len(src)} supplied forms")
    for k, v in sorted(counts.items()): print(f"  {k:14} {v}")

if __name__ == "__main__":
    emit()
