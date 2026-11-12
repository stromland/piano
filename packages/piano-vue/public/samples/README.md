# Piano recordings

One note for every third key, from C3 to C7, taken from the
[Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3)
by Alexander Holm, licensed under
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) as stated in the
[README of the collection](https://github.com/Tonejs/audio/blob/master/salamander/README)
the files were taken from. Unlike the rest of this repository, they are not
under the MIT license.

The files have been shortened to four seconds with a fade-out and mixed down to
mono:

```sh
ffmpeg -i C4.mp3 -t 4 -af "afade=t=out:st=2.5:d=1.5" -ac 1 -ar 44100 -b:a 64k C4.mp3
```
