package com.github.stromland.piano.services

import com.github.stromland.piano.models.PianoKey
import com.github.stromland.piano.utils.sliceToLast

object TriadChord {

    fun inversions(): List<String> {
        return listOf("root", "firstInversion", "secondInversion")
    }

    fun findChord(pianoKeys: List<PianoKey>, scaleKeys: List<Int>, startKey: Int): Chord {
        return triadChords().map { chord ->
            Chord(
                pianoKeys[startKey].note,
                chord.value.suffix,
                chord.value.keyIndexes.map { it + startKey }
            )
        }.first { it.keyIndexes.all { scaleKeys.contains(it) } }
    }

    fun getTriadInversions(chordIndexes: List<Int>): List<List<Int>> {
        fun shiftIndexes(x: Int): List<Int> {
            return (List(x) { 12 }.mapIndexed { i, v -> chordIndexes[i] + v } + chordIndexes.sliceToLast(x)).sorted()
        }
        return listOf(chordIndexes, shiftIndexes(1), shiftIndexes(2))
    }

    private fun triadChords(): Map<String, ChordSpec> {
        return mapOf(
            "major" to ChordSpec("", listOf(0, 4, 7)),
            "minor" to ChordSpec("m", listOf(0, 3, 7)),
            "diminished" to ChordSpec("dim", listOf(0, 3, 6)),
            "augmented" to ChordSpec("aug", listOf(0, 4, 8))
        )
    }

    data class Chord(val note: String, val suffix: String, val keyIndexes: List<Int>)

    data class ChordSpec(val suffix: String, val keyIndexes: List<Int>)
}

