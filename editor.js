(() => {

class EditableFigure extends Constrain.Figure {
    constructor(canvas) {
        super(canvas)
    }
    rectangle() {
        const result = super.rectangle()
        new EditableRectangle(result)
        return result
    }
    square() {
        const result = super.square()
        new EditableGraphic(this, result)
        return result
    }
}

const sqdist = Constrain.sqdist

class EditableGraphic extends Constrain.Control {
    constructor(figure, graphic) {
        super(figure, graphic, 4)
        this.graphic = graphic
        this.isActive = false
        this.selectionDist2 = 9
    }
    active() {
        return this.isActive
    }
    mousedown(x, y, e) {
        if (!this.active() && !this.inBounds(x, y)) return false
        console.log("saw down click")
        this.isActive = true
        const {evaluated, expr} = this.selectables()
        let bestd = this.selectionDist2 + 1, besti = -1
        for (let i = 0; i < evaluated.length; i++) {
            const [x2, y2] = evaluated[i]
            const d = sqdist(x - x2, y - y2)
            if (d < bestd && d < this.selectionDist2) {
                bestd = d
                besti = i
            }
        }
        if (bestd <= this.selectionDist2) {
            this.selectedIndex = besti
        }
        this.figure.delayedRender()
    }
    closePoints(x1, y1, x2, y2) {
        return sqdist(x1 - x2, y1 - y2) < this.selectionDist2
    }
    mouseup(x, y, e) {
        if (!this.inBounds(x, y) && this.isActive) {
            this.isActive = false
            this.selectedIndex = -1
            this.figure.delayedRender()
            return false
        }
    }
    // Return an array of selectable points both in unevaluated and evaluated form
    // as an object {evaluated, expr}
    selectables() {
        const g = this.graphic
        const coords = [g.x0(), g.x(), g.x1(), g.y0(), g.y(), g.y1()]
        const values = Constrain.evaluate(coords)
        const evaluated = [], expr = []
        for (let i = 0; i < 9; i++) {
            const j = i%3, k = 3 + Math.floor(i/3)
            expr[i] = [coords[j], coords[k]]
            evaluated[i] = [values[j], values[k]]
        }
        return { evaluated, expr }
    }
    render() {
        const ctx = figure.ctx
        ctx.save()
        ctx.strokeStyle = "yellow"
        ctx.lineWidth = 1.5
        const [x0, x1, y0, y1] = Constrain.evaluate([this.graphic.x0(), this.graphic.x1(), this.graphic.y0(), this.graphic.y1()])
        const [xc, yc] = Constrain.evaluate([this.graphic.x(), this.graphic.y()])
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y0)
        ctx.lineTo(x1, y1)
        ctx.lineTo(x0, y1)
        ctx.closePath()
        ctx.stroke()
        ctx.fillStyle = "yellow"
        const selectable = this.selectables()
        const pi2 = 2 * Math.PI
        ctx.fillStyle = "black"
        for (const pt of selectable.evaluated) {
            const [x, y] = pt
            ctx.beginPath()
            ctx.arc(x, y, 2.5, 0, pi2)
            ctx.fill()
        }
        ctx.fillStyle = "yellow"
        let i = 0
        for (const pt of selectable.evaluated) {
            const [x, y] = pt
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, pi2)
            if (i === this.selectedIndex) {
                ctx.fillStyle = "magenta"
                ctx.fill()
                ctx.fillStyle = "yellow"
            } else {
                ctx.fill()
            }
            i++
        }
        ctx.restore()
    }
}

Constrain.EditableFigure = EditableFigure

}
)()

