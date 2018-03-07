package com.github.stromland.piano.models

data class PianoKey(
    val note: String,
    val black: Boolean = false,
    val pressed: Boolean = false
)