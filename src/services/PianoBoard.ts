import { Note, Piano } from "services/Piano";
import { Scale, ScaleType } from "services/Scale";
import { PianoKey } from "models/PianoKey";

export class PianoBoard {
  public static pressAllScaleKeys(
    keys: PianoKey[],
    note: Note,
    scale: ScaleType
  ): PianoKey[] {
    const keyIndex = Piano.getPianoKeyIndex(note);
    const keysToPress = Scale.getScaleKeyIndexes(keyIndex, scale);
    return Piano.pressKeys(keys, keysToPress);
  }
}
