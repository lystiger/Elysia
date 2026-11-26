pragma ComponentBehavior: Bound
import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui

Column {
  id: root

  property bool panelOpened: false
  property color foreground: Color.foreground
  property color dim: Qt.darker(foreground, 1.55)
  property color urgent: Color.urgent
  property string fontFamily: Style.font.family

  readonly property string home: Quickshell.env("HOME") || ""
  // "awake" | "asleep" | "unknown" | "working"
  property string state: "unknown"
  readonly property bool awake: state === "awake"
  readonly property bool working: state === "working"

  spacing: Style.space(12)

  function refresh() {
    if (statusProc.running || actionProc.running) return
    statusProc.running = true
  }

  function toggle() {
    if (actionProc.running) return
    actionProc.command = ["docker", root.awake ? "stop" : "start", "elysia"]
    root.state = "working"
    actionProc.running = true
  }

  Timer {
    interval: 3000
    running: root.panelOpened && root.visible
    repeat: true
    triggeredOnStart: true
    onTriggered: root.refresh()
  }

  Process {
    id: statusProc
    command: ["docker", "inspect", "-f", "{{.State.Running}}", "elysia"]
    stdout: StdioCollector {
      onStreamFinished: {
        if (actionProc.running) return
        var t = String(text).trim()
        root.state = t === "true" ? "awake" : (t === "false" ? "asleep" : "unknown")
      }
    }
  }

  Process {
    id: actionProc
    onExited: root.refresh()
  }

  Process {
    id: chatProc
    command: ["foot", "--app-id=org.lysomarchy.elysia", "-e", root.home + "/.local/bin/elysia-chat"]
  }

  Image {
    anchors.horizontalCenter: parent.horizontalCenter
    width: Style.space(96)
    height: Style.space(96)
    source: Qt.resolvedUrl("assets/elysia.png")
    fillMode: Image.PreserveAspectFit
    mipmap: true
    opacity: root.awake ? 1.0 : 0.45
  }

  Text {
    width: parent.width
    horizontalAlignment: Text.AlignHCenter
    text: "Elysia"
    color: root.foreground
    font.family: root.fontFamily
    font.pixelSize: Style.font.body
    font.bold: true
  }

  Text {
    width: parent.width
    horizontalAlignment: Text.AlignHCenter
    text: root.working ? "Working…" : (root.awake ? "Awake" : (root.state === "asleep" ? "Asleep" : "Status unknown"))
    color: root.awake ? root.foreground : root.dim
    font.family: root.fontFamily
    font.pixelSize: Style.font.caption
  }

  Button {
    width: parent.width
    text: root.awake ? "Sleep" : "Wake"
    enabled: !root.working && root.state !== "unknown"
    bordered: true
    foreground: root.foreground
    fontFamily: root.fontFamily
    fontSize: Style.font.bodySmall
    verticalPadding: Style.spacing.controlPaddingY
    onClicked: root.toggle()
  }

  Button {
    width: parent.width
    text: "Chat"
    enabled: root.awake
    bordered: true
    foreground: root.foreground
    fontFamily: root.fontFamily
    fontSize: Style.font.bodySmall
    verticalPadding: Style.spacing.controlPaddingY
    onClicked: chatProc.running = true
  }
}
