package views.app

import kotlinx.html.DIV
import react.RBuilder
import react.dom.RDOMBuilder
import react.dom.div
import react.dom.jsStyle

fun RBuilder.buttonGroupsContainer(block: RDOMBuilder<DIV>.() -> Unit) {
    div {
        attrs.jsStyle {
            width = "60%"
            display = "flex"
            flex = "1"
            flexDirection = "column"
            margin = "30px"
        }
        block()
    }
}