package views.footer

import react.RBuilder
import react.dom.a
import react.dom.div
import react.dom.img

@JsModule("src/views/footer/GitHub-Mark-Light-32px.png")
external val githubLogo: dynamic

fun RBuilder.footer() {
    div("footer") {
        a("https://github.com/stromland/piano", target = "blank") {
            img("GitHub Logo", githubLogo) {}
        }
    }
}