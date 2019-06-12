package views.app

import kotlinx.html.DIV
import kotlinx.html.LABEL
import react.RBuilder
import react.dom.RDOMBuilder
import react.dom.div
import react.dom.jsStyle
import react.dom.label
import utils.classNames

fun RBuilder.selectorContainer(block: RDOMBuilder<DIV>.() -> Unit) {
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

data class LabelSizes(
    val small: Boolean = false,
    val medium: Boolean = false
)

fun RBuilder.selectorLabel(sizes: LabelSizes = LabelSizes(medium = true), block: RDOMBuilder<LABEL>.() -> Unit = {}) {
    val classes = mapOf(
        "label" to true,
        "label--small" to sizes.small,
        "label--medium" to sizes.medium
    )
    label(classNames(classes)) { 
        block()
    }
}

