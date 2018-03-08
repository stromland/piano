package components.button

import kotlinx.html.DIV
import react.RBuilder
import react.dom.RDOMBuilder
import react.dom.div

fun RBuilder.buttonGroup(block: RDOMBuilder<DIV>.() -> Unit) {
    div("button-group") {
        block()
    }
}