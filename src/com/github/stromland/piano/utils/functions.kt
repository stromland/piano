package com.github.stromland.piano.utils

fun classNames(classes: Map<String, Boolean>): String {
    return classes.filter { it.value }.map { it.key }.joinToString(" ")
}

