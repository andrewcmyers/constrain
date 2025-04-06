(() => {

class EditableFigure extends Constrain.Figure {
    constructor(canvas) {
        super(canvas)
        document.addEventListener('keydown', e => {
            for (let i = 0; i < this.interactives.length; i++) {
                const h = this.interactives[i]
                if (h.keydown(e)) {
                    e.preventDefault()
                    e.stopImmediatePropagation()
                    return
                }
            }
        })
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
        this.selectionDist2 = 16 // minimum squared distance for selectability
        this.constraints = [] // constraints associated with each coordinate: x0, xc, x1, y0, yc, y1
    }
    active() {
        return this.isActive
    }
    mousedown(x, y, e) {
        if (!this.active() && !this.inBounds(x, y)) return false
        if (this.active() && !this.inBounds(x, y)) {
            this.selectedIndex = -1
            this.isActive = false
            this.figure.delayedRender()
            return false
        }
        const figure = this.figure
        this.isActive = true
        const {evaluated, expr} = this.selectablePts()
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
            this.updateConstraints(expr, besti, x, y)
            figure.setFocus(this)
        }
        figure.delayedRender()
        return true
    }
    updateConstraints(expr, i, x, y) {
        if (i !== 1 && i != 7) {
            const xi = i % 3;
            this.disableConstraints(xi)
            const s = this.constraints[xi] = new Set()
            if (x !== undefined) s.add(figure.equal(expr[i][0], x))
            this.enableConstraints(xi)
        }
        if (i !== 3 && i != 5) {
            const yi = 3 + Math.floor(i/3)
            this.disableConstraints(yi)
            const s = this.constraints[yi] = new Set()
            if (y !== undefined) s.add(figure.equal(expr[i][1], y))
            this.enableConstraints(yi)
        }
    }
    enableConstraints(i) {
        const s = this.constraints[i] || []
        for (const c of s) {
            this.figure.Constraints.push(c)
        }
    }
    disableConstraints(i) {
        const Constraints = this.figure.Constraints
        const s = this.constraints[i] || []
        for (let j = 0; j < Constraints.length; j++) {
            for (const c of s) {
                if (c === Constraints[j]) { Constraints.splice(j, 1); j-- }
            }
        }
    }
    mouseup(x, y, e) {
        if (this.figure.getFocus() === this) {
            this.figure.loseFocus()
            this.figure.delayedRender()
        }
    }
    mousemove(x, y, e) {
        const ctx = figure.ctx
        ctx.fillStyle = '#0ff';
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, 2*Math.PI)
        ctx.fill()

        if (this.selectedIndex >= 0) {
            const i = this.selectedIndex
            const {evaluated, expr} = this.selectablePts()
            this.updateConstraints(expr, i, x, y)
            this.figure.delayedRender()
        }
    }
    keydown(e) {
        if (this.isActive) {
            if (this.selectedIndex >= 0) {
                const {evaluated, expr} = this.selectablePts()
                this.updateConstraints(expr, this.selectedIndex)
                this.selectedIndex = -1
                this.figure.delayedRender()
            }
        }
    }

    // Return an array of selectable points both in unevaluated and evaluated form
    // as an object {evaluated, expr}
    selectablePts() {
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
        const selectable = this.selectablePts()
        const pi2 = 2 * Math.PI
        ctx.fillStyle = "black"
        for (const pt of selectable.evaluated) {
            const [x, y] = pt
            ctx.beginPath()
            ctx.arc(x, y, 2.5, 0, pi2)
            ctx.fill()
        }
        for (let i = 0; i < selectable.evaluated.length; i++) {
            const [x, y] = selectable.evaluated[i]
            console.log(x, y)
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, pi2)
            const j = i%3, k = 3 + Math.floor(i/3)
            ctx.fillStyle = "green"
            if (i === this.selectedIndex) {
                ctx.fillStyle = "magenta"
            } else if (this.constraints[j] && this.constraints[j].size > 0 ||
                       this.constraints[k] && this.constraints[k].size > 0) {
                ctx.fillStyle = "orange"
            } else {
                ctx.fillStyle = "yellow"
            }
            ctx.fill()
        }
        ctx.restore()
    }
}

Constrain.EditableFigure = EditableFigure

}
)()

