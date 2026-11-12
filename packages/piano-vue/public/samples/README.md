# Piano recordings

One note for every third key, from C3 to C7, taken from the
[Salamander Grand Piano V3](https://archive.org/details/SalamanderGrandPianoV3)
by Alexander Holm, licensed under
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). The files come from
the [Tone.js audio collection](https://github.com/Tonejs/audio/tree/master/salamander)
and have been shortened to four seconds with a fade-out and mixed down to mono:

```sh
ffmpeg -i C4.mp3 -t 4 -af "afade=t=out:st=2.5:d=1.5" -ac 1 -ar 44100 -b:a 64k C4.mp3
```
