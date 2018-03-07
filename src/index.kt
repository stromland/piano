import kotlinext.js.require
import kotlinext.js.requireAll
import react.dom.div
import react.dom.render
import views.app.app
import kotlin.browser.document

fun main(args: Array<String>) {
    requireAll(require.context("src", true, js("/\\.css$/")))

    render(document.getElementById("root")) {
        div("main-container") {
            app()
        }
    }
}
