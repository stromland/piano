package views.app

import com.github.stromland.piano.models.PianoKey
import com.github.stromland.piano.services.Piano
import com.github.stromland.piano.services.Scale
import com.github.stromland.piano.services.TriadChord
import components.button.buttonGroup
import components.button.toggleButton
import components.pianokeys.pianoKeys
import components.selector.selector
import kotlinx.html.js.onClickFunction
import react.RBuilder
import react.RComponent
import react.RProps
import react.RState
import react.dom.div
import react.dom.jsStyle
import react.setState
import views.footer.footer

sealed class PressType(val type: String)
class PressScale : PressType("SCALE")
class PressChord : PressType("CHORD")

interface AppState : RState {
    var selectedNote: String
    var selectedScale: String
    var selectedChord: String
    var pressKeys: PressType
    var selectedInversion: String
}

class App : RComponent<RProps, AppState>() {
    override fun AppState.init() {
        selectedNote = "C"
        selectedScale = "major"
        selectedChord = "C"
        selectedInversion = "root"
        pressKeys = PressScale()
    }

    var pianoKeys = Piano.getPianoKeys(41)

    private fun selectNote(key: String) {
        setState {
            selectedNote = key
            selectedChord = findFirstChord(key, state.selectedScale)
        }
    }

    private fun selectScale(key: String) {
        setState {
            selectedScale = key
            selectedChord = findFirstChord(state.selectedNote, key)
        }
    }

    private fun selectChord(key: String) {
        setState {
            selectedChord = key
        }
    }

    private fun selectInversion(key: String) {
        setState {
            selectedInversion = key
        }
    }

    private fun pressKeys(type: PressType) {
        setState {
            pressKeys = type
        }
    }

    fun findFirstChord(note: String, scale: String): String {
        return getAllChords(note, scale).first().let { it.note + it.suffix }
    }

    fun getAllChords(note: String, scale: String): List<TriadChord.Chord> {
        val keyIndex = Piano.getPianoKeyIndex(note)
        val scaleKeys = Scale.getScaleKeyIndexes(keyIndex, scale, 2)
        return scaleKeys.slice(0..6).map { TriadChord.findChord(pianoKeys, scaleKeys, it) }
    }

    fun pressChordKeys(): List<PianoKey> {
        val chord =
            getAllChords(state.selectedNote, state.selectedScale).first { it.note + it.suffix == state.selectedChord }
        val inversions = TriadChord.getTriadInversions(chord.keyIndexes)
        val index = TriadChord.inversions().indexOf(state.selectedInversion)
        return Piano.pressKeys(pianoKeys, inversions[index])
    }

    fun pressAllScaleKeys(): List<PianoKey> {
        val keyIndex = Piano.getPianoKeyIndex(state.selectedNote)
        val keysToPress = Scale.getScaleKeyIndexes(keyIndex, state.selectedScale)
        return Piano.pressKeys(pianoKeys, keysToPress)
    }

    override fun RBuilder.render() {
        val keyNames = Piano.pianoKeys.map { it.note }
        val scaleNames = Scale.scales().map { it.key }
        val chordNames = getAllChords(state.selectedNote, state.selectedScale).map { it.note + it.suffix }

        val pressedKeys = when (state.pressKeys) {
            is PressScale -> pressAllScaleKeys()
            is PressChord -> pressChordKeys()
        }

        div("container") {
            pianoKeys(pressedKeys)
            buttonGroup {
                toggleButton(state.pressKeys is PressScale) {
                    attrs.onClickFunction = { pressKeys(PressScale()) }
                    +"Scales"
                }
                toggleButton(state.pressKeys is PressChord) {
                    attrs.onClickFunction = { pressKeys(PressChord()) }
                    +"Chords"
                }
            }
            selectorLabel(LabelSizes(small = true)) {
                attrs.jsStyle.marginTop = "5px"
                +"Press Keys"
            }
            selectorContainer {
                selectorLabel { +"Scale" }
                selector(::selectNote, keyNames, state.selectedNote)
                selector(::selectScale, scaleNames, state.selectedScale, true)
                selectorLabel { +"Chord" }
                selector(::selectChord, chordNames, state.selectedChord)
                selector(::selectInversion, TriadChord.inversions(), state.selectedInversion, true)
            }
            footer()
        }
    }
}

fun RBuilder.app() = child(App::class) {}
