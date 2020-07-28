const canvas = document.getElementsByTagName("canvas")[0]

Constrain.fullWindowCanvas(canvas)

const figure = new Constrain.Figure(canvas)

with (figure) {
var border = rectangle("blue", "white")

    align("center", "center", border, canvasRect())
    border.addText(
        text("Constrain")
          .setFillStyle("white")
          .setJustification("center")
          .setVerticalAlign("center")
          .setFontSize(18)
    )
    border.setH(150)
    border.setW(300)

}
Constrain.autoResize()
figure.start()
