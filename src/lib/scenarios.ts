// "Ninde utambuka mbere?": right-of-way scenes drawn as an intersection seen from above (Rwanda drives on the right).
//
// Every approach is drawn as the south one, then rotated about the centre: a vehicle waits at (230, 330) facing north,
// in the right-hand lane, and its paths below are in those coordinates. Roundabout vehicles give their own pose.

export type Approach = "s" | "w" | "n" | "e";
export type Move = "straight" | "left" | "right";
export type SignKind = "stop" | "yield" | "priority" | "roundabout";
export type Light = "red" | "green" | "off";

export type Vehicle = {
  id: string;
  from: Approach;
  move: Move;
  kind?: "car" | "ambulance";
  /** Roundabout vehicles: own start pose and paths, in scene coordinates (no rotation). */
  custom?: { x: number; y: number; angle: number; drive: string; arrow: string };
};

export type Scenario = {
  id: string;
  /** Short label of the rule being practised. */
  tag: string;
  layout: "cross" | "t" | "roundabout";
  vehicles: Vehicle[];
  signs?: Partial<Record<Approach, SignKind>>;
  lights?: Partial<Record<Approach, Light>>;
  /** An arm that is a dirt road rather than a paved one. */
  dirt?: Approach;
  /** The vehicle that goes first, or the whole order when there are several to place. */
  answer: string[];
  /** Order the vehicles drive off in once answered (default: the answer, then the others); absent ones stay. */
  sequence?: string[];
  explanation: string;
  law?: string;
};

export const ROTATION: Record<Approach, number> = { s: 0, w: 90, n: 180, e: 270 };
export const START = { x: 230, y: 330 };

export const DRIVE: Record<Move, string> = {
  straight: "M230 330 L230 -70",
  right: "M230 330 L230 268 Q230 230 268 230 L470 230",
  left: "M230 330 L230 222 Q230 170 178 170 L-70 170",
};

export const ARROW: Record<Move, string> = {
  straight: "M230 300 L230 118",
  right: "M230 300 L230 268 Q230 230 268 230 L304 230",
  left: "M230 300 L230 222 Q230 170 178 170 L102 170",
};

export const COLORS: Record<string, { body: string; edge: string }> = {
  A: { body: "#e5484d", edge: "#a51d24" },
  B: { body: "#1a8fe0", edge: "#0b5d99" },
  C: { body: "#f5b301", edge: "#a87900" },
};

export const MOVE_LABEL: Record<Move, string> = {
  straight: "Ikomeza imbere",
  left: "Ikatira ibumoso",
  right: "Ikatira iburyo",
};

export const SIGN_LABEL: Record<SignKind, string> = {
  stop: "STOP: hagarara, utange inzira",
  yield: "Tanga inzira (B.1)",
  priority: "Umuhanda utambukwamo mbere (B.3)",
  roundabout: "Inkomane banyuramo bazengurutse (D.3)",
};

/** A point of the south-approach drawing, moved to another approach. */
export function rotate(x: number, y: number, degrees: number): { x: number; y: number } {
  const r = (degrees * Math.PI) / 180;
  const dx = x - 200;
  const dy = y - 200;
  return { x: 200 + dx * Math.cos(r) - dy * Math.sin(r), y: 200 + dx * Math.sin(r) + dy * Math.cos(r) };
}

const LAW = "Iteka rya Perezida n° 85/01";

export const SCENARIOS: Scenario[] = [
  {
    id: "iburyo",
    tag: "Itegeko ry’iburyo",
    layout: "cross",
    vehicles: [
      { id: "A", from: "s", move: "straight" },
      { id: "B", from: "e", move: "straight" },
    ],
    answer: ["B"],
    explanation:
      "Iyo nta cyapa, itara cyangwa umupolisi bigena ukundi, ikinyabiziga kiguturutse iburyo ni cyo gitambuka mbere. B iri iburyo bwa A, bityo A irategereza.",
    law: `${LAW}, ingingo ya 16`,
  },
  {
    id: "iburyo-2",
    tag: "Itegeko ry’iburyo",
    layout: "cross",
    vehicles: [
      { id: "A", from: "s", move: "straight" },
      { id: "B", from: "w", move: "straight" },
    ],
    answer: ["A"],
    explanation:
      "Itegeko ni rimwe: ureka ikinyabiziga kiguturutse iburyo. Kuri B, A iri iburyo bwayo, bityo B ni yo itegereza.",
    law: `${LAW}, ingingo ya 16`,
  },
  {
    id: "ibumoso",
    tag: "Gukatira ibumoso",
    layout: "cross",
    vehicles: [
      { id: "A", from: "s", move: "left" },
      { id: "B", from: "n", move: "straight" },
    ],
    answer: ["B"],
    explanation:
      "Ushaka gukatira ibumoso areka ibinyabiziga bimuturutse imbere bigakomeza. A ikatira ibumoso, igomba gutegereza ko B itambuka.",
    law: `${LAW}, ingingo ya 25`,
  },
  {
    id: "stop",
    tag: "Icyapa STOP",
    layout: "cross",
    signs: { s: "stop" },
    vehicles: [
      { id: "A", from: "s", move: "straight" },
      { id: "B", from: "w", move: "straight" },
    ],
    answer: ["B"],
    explanation:
      "Iyo nta cyapa, A yari gutambuka mbere kuko B iri ibumoso bwayo. Ariko icyapa STOP gitegeka A guhagarara burundu ku murongo, no guha inzira abari mu muhanda yinjiramo.",
    law: `${LAW}, ingingo ya 93`,
  },
  {
    id: "umuhanda-mbere",
    tag: "Umuhanda utambukwamo mbere",
    layout: "cross",
    signs: { s: "priority", n: "priority", e: "yield", w: "yield" },
    vehicles: [
      { id: "A", from: "s", move: "straight" },
      { id: "B", from: "e", move: "straight" },
    ],
    answer: ["A"],
    explanation:
      "A iri mu muhanda utambukwamo mbere (icyapa B.3). B ifite icyapa cyo gutanga inzira (B.1): n’ubwo iri iburyo bwa A, igomba kuyireka igatambuka mbere.",
    law: `${LAW}, ingingo ya 93`,
  },
  {
    id: "bazengurukamo",
    tag: "Inkomane bazengurukamo",
    layout: "roundabout",
    signs: { s: "roundabout" },
    vehicles: [
      {
        id: "A",
        from: "s",
        move: "straight",
        custom: {
          x: 230,
          y: 345,
          angle: 0,
          drive: "M230 345 L230 270.9 A77 77 0 0 0 230 129.1 L230 -70",
          arrow: "M230 318 L230 270.9 A77 77 0 0 0 236 132",
        },
      },
      {
        id: "B",
        from: "w",
        move: "right",
        custom: {
          x: 145.6,
          y: 254.4,
          angle: 135,
          drive: "M145.6 254.4 A77 77 0 0 0 270.9 230 L470 230",
          arrow: "M156 263 A77 77 0 0 0 270.9 230 L306 230",
        },
      },
    ],
    answer: ["B"],
    explanation:
      "Ugiye kwinjira mu isangano bazengurukamo areka ibinyabiziga byamaze kugeramo bigatambuka mbere. B yamaze kwinjira, A irategereza.",
    law: `${LAW}, ingingo ya 16`,
  },
  {
    id: "ndakumirwa",
    tag: "Ikinyabiziga ndakumirwa",
    layout: "cross",
    vehicles: [
      { id: "A", from: "s", move: "straight" },
      { id: "B", from: "w", move: "straight", kind: "ambulance" },
    ],
    answer: ["B"],
    explanation:
      "Ubusanzwe A yari gutambuka mbere kuko iri iburyo bwa B. Ariko B ni imbangukiragutabara iri mu butumwa bwihutirwa (amatara y’ubururu n’intabaza): ugomba kuyihigamira ako kanya, ndetse ugahagarara niba ari ngombwa.",
    law: `${LAW}, ingingo ya 37`,
  },
  {
    id: "amatara",
    tag: "Amatara",
    layout: "cross",
    lights: { s: "green", n: "green", e: "red", w: "red" },
    vehicles: [
      { id: "A", from: "s", move: "straight" },
      { id: "B", from: "e", move: "straight" },
    ],
    answer: ["A"],
    sequence: ["A"],
    explanation:
      "Iyo amatara akora, ni yo agena utambuka. A ifite itara ry’icyatsi irakomeza; B ihagarara ku itara ritukura n’ubwo iri iburyo bwa A.",
  },
  {
    id: "amatara-azimye",
    tag: "Amatara adakora",
    layout: "cross",
    lights: { s: "off", n: "off", e: "off", w: "off" },
    vehicles: [
      { id: "A", from: "s", move: "straight" },
      { id: "B", from: "e", move: "straight" },
    ],
    answer: ["B"],
    explanation:
      "Iyo amatara y’isangano adakora, ucamo witonze nk’aho nta kimenyetso gihari: itegeko ry’iburyo ni ryo rikurikizwa. B iri iburyo bwa A, ni yo itambuka mbere.",
    law: `${LAW}, ingingo ya 16 na 104`,
  },
  {
    id: "igitaka",
    tag: "Inzira y’igitaka",
    layout: "t",
    dirt: "s",
    vehicles: [
      { id: "A", from: "s", move: "right" },
      { id: "B", from: "w", move: "straight" },
    ],
    answer: ["B"],
    explanation:
      "A ivuye mu nzira y’igitaka yinjira mu nzira nyabagendwa isanzwe: igomba gutanga inzira, n’ubwo B iri ibumoso bwayo.",
  },
  {
    id: "batatu",
    tag: "Ibinyabiziga bitatu",
    layout: "cross",
    vehicles: [
      { id: "A", from: "s", move: "straight" },
      { id: "B", from: "e", move: "straight" },
      { id: "C", from: "w", move: "straight" },
    ],
    answer: ["B", "A", "C"],
    explanation:
      "Nta cyapa: buri wese areka uri iburyo bwe. B nta kinyabiziga kiri iburyo bwayo, ni yo ibanza. A ikurikiraho kuko B yamaze gutambuka. C ni yo iheruka kuko A yari iburyo bwayo.",
    law: `${LAW}, ingingo ya 16`,
  },
  {
    id: "uruvange",
    tag: "Ibyapa no gukatira ibumoso",
    layout: "cross",
    signs: { s: "priority", n: "priority", e: "yield", w: "yield" },
    vehicles: [
      { id: "A", from: "s", move: "left" },
      { id: "B", from: "n", move: "straight" },
      { id: "C", from: "e", move: "straight" },
    ],
    answer: ["B", "A", "C"],
    explanation:
      "C ifite icyapa cyo gutanga inzira, ni yo iheruka. A na B bari mu muhanda utambukwamo mbere, ariko A ikatira ibumoso: igomba kureka B iyituruka imbere ikabanza.",
    law: `${LAW}, ingingo ya 25 na 93`,
  },
];
