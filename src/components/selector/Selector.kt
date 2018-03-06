package components.selector

import components.button.toggleButton
import kotlinx.html.js.onClickFunction
import react.RBuilder
import react.dom.div
import react.dom.jsStyle

typealias SelectOption = (String) -> Unit

fun RBuilder.selector(onSelect: SelectOption, options: List<String>, selected: String, formatText: Boolean = false) {
    div {
        attrs.jsStyle.display = "flex"
        options.map { option ->
            toggleButton(selected == option) {
                key = option
                attrs.onClickFunction = { onSelect(option) }
                if(formatText) +option.replace("[A-Z]".toRegex(), { " ${it.value}" }).capitalize()
                else +option
            }
        }
    }
}