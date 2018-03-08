package components.button

import kotlinx.html.BUTTON
import react.RBuilder
import react.dom.RDOMBuilder
import react.dom.button
import utils.classNames

fun RBuilder.toggleButton(active: Boolean = false, block: RDOMBuilder<BUTTON>.() -> Unit) {
    val classes = mapOf(
        "btn" to true,
        "btn-active" to active
    )
    button(classes = classNames(classes), block = block)
}