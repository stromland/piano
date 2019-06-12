package com.github.stromland.piano.utils

fun <E> List<E>.sliceToLast(from: Int): List<E> {
    return this.slice(from until this.size)
}