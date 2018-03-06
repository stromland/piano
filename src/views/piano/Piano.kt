package views.piano

import com.github.stromland.piano.models.PianoKey
import components.pianokeys.pianoKeys
import kotlinx.html.DIV
import react.RBuilder
import react.dom.RDOMBuilder
import react.dom.div

fun RBuilder.piano(keys: List<PianoKey>, block: RDOMBuilder<DIV>.() -> Unit) {
    div {
        pianoKeys(keys)
        block()
    }
}
