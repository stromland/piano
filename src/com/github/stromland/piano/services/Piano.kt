package com.github.stromland.piano.services

import com.github.stromland.piano.models.PianoKey
import kotlin.math.ceil

object Piano {
    val pianoKeys = listOf(
        PianoKey("C"),
        PianoKey("C#", true),
        PianoKey("D"),
        PianoKey("D#", true),
        PianoKey("E"),
        PianoKey("F"),
        PianoKey("F#", true),
        PianoKey("G"),
        PianoKey("G#", true),
        PianoKey("A"),
        PianoKey("Bb", true),
        PianoKey("B")
    )

    fun getPianoKeyIndex(note: String): Int {
        return pianoKeys
            .mapIndexed { index, pianoKey -> pianoKey.note to index }
            .find { it.first == note }
            ?.second ?: throw IllegalArgumentException("Not a valid note ($note)")
    }

    fun getPianoKeySets(sets: Int) = List(sets) { pianoKeys }.reduce { allKeys, keys -> allKeys + keys }

    fun getPianoKeys(keys: Int): List<PianoKey> {
        val sets = ceil(keys / pianoKeys.size.toDouble()).toInt()
        return getPianoKeySets(sets).slice(0 until keys)
    }

    fun pressKeys(pianoKeys: List<PianoKey>, keysToPress: List<Int>): List<PianoKey> {
        return pianoKeys.mapIndexed { index, pianoKey ->
            keysToPress.find { index == it }?.let { pianoKey.copy(pressed = true) } ?: pianoKey
        }
    }
}
