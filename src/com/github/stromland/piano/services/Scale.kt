package com.github.stromland.piano.services

object Scale {
    fun scales(): Map<String, List<Int>> {
        return mapOf(
            "major" to listOf(2, 2, 1, 2, 2, 2, 1),
            "minor" to listOf(2, 1, 2, 2, 1, 2, 2),
            "harmonicMinor" to listOf(2, 1, 2, 2, 1, 3, 1)
//            "pentatonicMajor" to listOf(2, 2, 3, 2, 3),
//            "pentatonicMinor" to listOf(3, 2, 2, 3, 2)
        )
    }

    fun getScaleKeyIndexes(noteIndex: Int, scaleName: String, sets: Int = 0): List<Int> {
        val scaleSpec = getScaleSpec(scaleName)
        val scale = (0..sets).fold(listOf<Int>()) { acc, _ -> acc + scaleSpec }

        return scale.fold(listOf()) { scaleKeys, nextKey ->
            when (scaleKeys.size) {
                0 -> listOf(noteIndex, noteIndex + nextKey)
                else -> scaleKeys + (scaleKeys.last() + nextKey)
            }
        }
    }

    private fun getScaleSpec(scaleName: String): List<Int> {
        return scales()[scaleName] ?: throw IllegalArgumentException("Not a valid scale scaleName ($scaleName)")
    }
}
