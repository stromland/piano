import { Piano } from "services/Piano";
import { PianoKey } from "models/PianoKey";

export async function loadMidi(
  keys: PianoKey[],
  updateKeys: (keys: PianoKey[]) => void
): Promise<void> {
  if (navigator.requestMIDIAccess === undefined) {
    console.info("Midi not available");
    return;
  }
  try {
    const access = await navigator.requestMIDIAccess({ sysex: false });
    access.inputs.forEach((val) => {
      val.onmidimessage = readNote(keys, updateKeys);
    });

    access.onstatechange = function (e) {
      console.log(e.port.name, e.port.manufacturer, e.port.state);
    };
  } catch (e) {
    console.log((e as DOMException).message);
  }
}

enum KeyState {
  OFF = 128,
  ON = 144,
}

const readNote =
  (keys: PianoKey[], updateKeys: (keys: PianoKey[]) => void) =>
  (event: WebMidi.MIDIMessageEvent) => {
    const { data } = event;

    const state: KeyState = data[0];
    const key = data[1] % 12;
    const note = Piano.getNoteFromIndex(key);

    switch (state) {
      case KeyState.OFF:
        console.log("OFF", note);
        break;
      case KeyState.ON:
        console.log("ON", note);
        // updateKeys(Piano.pressKeys(keys, [key]));
        break;
    }
  };
