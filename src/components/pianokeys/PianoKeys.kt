package components.pianokeys

import com.github.stromland.piano.models.PianoKey
import react.RBuilder
import react.ReactElement
import react.dom.div
import react.dom.span
import utils.classNames

fun RBuilder.pianoKeys(keys: List<PianoKey>) {
    div("key-container") {
        keys.mapIndexed(renderKeyGroup(keys, this))
    }
}

private fun renderKeyGroup(keys: List<PianoKey>, builder: RBuilder) = fun(index: Int, key: PianoKey): ReactElement? =
    with(builder) {
        if (key.black) return null
        val nextKey = keys.getOrNull(index + 1)

        div("key-group") {
            pianoKey(key)
            if (nextKey != null && nextKey.black) pianoKey(nextKey)
        }
    }

private fun RBuilder.pianoKey(key: PianoKey) {
    val classes = mapOf(
        "key" to true,
        "black-key" to key.black,
        "pressed" to key.pressed
    )

    div(classNames(classes)) {
        span { +key.note }
    }
}
