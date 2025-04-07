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
        this.dragging = false
        this.min_align_dist = 4
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
        this.dragging = true
        const {evaluated, expr, aligns} = this.selectablePts()
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
            this.updateConstraints(expr[besti], aligns[besti], x, y)
            figure.setFocus(this)
        }
        figure.delayedRender()
        return true
    }
    updateConstraints(expr, aligns, x, y) {
        if (aligns[0] >= 0) {
            const xi = aligns[0]
            this.disableConstraints(xi)
            const s = this.constraints[xi] = new Set()
            if (x !== undefined) s.add(figure.equal(expr[0], x))
            this.enableConstraints(xi)
        }
        if (aligns[1] >= 0) {
            const yi = aligns[1]
            this.disableConstraints(yi)
            const s = this.constraints[yi] = new Set()
            if (y !== undefined) s.add(figure.equal(expr[1], y))
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
            if (this.dragging) {
                if (this.bestHorizontal || this.bestVertical) {
                    const {evaluated, expr, aligns} = this.selectablePts()
                    const i = this.selectedIndex
                    if (this.bestHorizontal) {
                        const j = aligns[i][0]
                        if (j >= 0) {
                            this.disableConstraints(j)
                            this.constraints[j] = new Set()
                            this.constraints[j].add(this.figure.equal(expr[i][0], this.bestHorizontal.expr))
                            this.enableConstraints(j)
                        }
                    }
                    if (this.bestVertical) {
                        const j = aligns[i][1]
                        if (j >= 0) {
                            this.disableConstraints(j)
                            this.constraints[j] = new Set()
                            this.constraints[j].add(this.figure.equal(expr[i][1], this.bestVertical.expr))
                            this.enableConstraints(j)
                        }
                    }
                }
                this.dragging = false
            }
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
            const selectables =  this.selectablePts()
            const {evaluated, expr, aligns} = selectables
            this.updateConstraints(expr[i], aligns[i], x, y)
            this.findAlignments(x,y,i,selectables)
            this.figure.delayedRender()
        }
    }
    keydown(e) {
        if (e.key === ' ' && this.isActive) {
            if (this.selectedIndex >= 0) {
                const {evaluated, expr, aligns} = this.selectablePts()
                const i = this.selectedIndex
                this.updateConstraints(expr[i], aligns[i])
                this.selectedIndex = -1
                this.figure.delayedRender()
            }
        }
    }

    // Return an array of selectable points both in unevaluated and evaluated form
    // as an object o = {evaluated, expr, aligns}
    // o.aligns is a 2-element array specifying what coordinates each of the selectable points
    // aligns to, as an index between 0 and 5, or -1 if no alignment on that axis should
    // occur.
    selectablePts() {
        const g = this.graphic
        const coords = [g.x0(), g.x(), g.x1(), g.y0(), g.y(), g.y1()]
        const values = Constrain.evaluate(coords)
        const evaluated = [], expr = [], aligns = []
        for (let i = 0; i < 9; i++) {
            const j = i%3, k = 3 + Math.floor(i/3)
            expr[i] = [coords[j], coords[k]]
            evaluated[i] = [values[j], values[k]]
            aligns[i] = [-1, -1]
            if (i != 1 && i != 7) aligns[i][0] = j
            if (i != 3 && i != 5) aligns[i][1] = k
        }
        return { evaluated, expr, aligns }
    }
    findAlignments(x,y,i,selectable) {
        const {evaluated, expr, aligns} = selectable
        const [xi, yi] = aligns[i]
        const min_align_dist = this.min_align_dist
        let bestHorizontal = null, bestVertical = null
        console.log("findAlignments", selectable)
        for (const io of this.figure.interactives) {
            if (io === this) continue
            if (io.selectablePts) {
                const selectable2 = io.selectablePts()
                console.log("checking against ", selectable2)
                for (let j = 0; j < selectable2.evaluated.length; j++) {
                    const [x2, y2] =  selectable2.evaluated[j]
                    const dx = Math.abs(x2 - x) 
                    const dy = Math.abs(y2 - y) 
                    if (dx < min_align_dist &&
                        (bestHorizontal === null || dx < bestHorizontal.dist)) {
                        bestHorizontal = { dist : dx, pos : x2, expr : selectable2.expr[j][0] }
                        console.log(bestHorizontal)
                    }
                    if (dy < min_align_dist &&
                        (bestVertical === null || Math.abs(y2 - y) < bestVertical.dist)) {
                        bestVertical = { dist : dy, pos : y2, expr : selectable2.expr[j][1] }
                        console.log(bestVertical)
                    }
                }
            }
        }
        this.bestHorizontal = bestHorizontal
        this.bestVertical = bestVertical
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
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, pi2)
            const j = selectable.aligns[i][0], k = selectable.aligns[i][1]
            ctx.fillStyle = "green"
            if (i === this.selectedIndex) {
                ctx.fillStyle = "magenta"
            } else if (j >= 0 && this.constraints[j] && this.constraints[j].size > 0 ||
                       k >= 0 && this.constraints[k] && this.constraints[k].size > 0) {
                ctx.fillStyle = "orange"
            } else {
                ctx.fillStyle = "yellow"
            }
            ctx.fill()
        }
        if (this.dragging) {
            ctx.strokeStyle = "magenta"
            ctx.setLineDash([5,3])
            ctx.lineWidth = 0.75
            if (this.bestHorizontal) {
                ctx.beginPath()
                ctx.moveTo(this.bestHorizontal.pos, 0)
                ctx.lineTo(this.bestHorizontal.pos, this.figure.height)
                ctx.stroke()
            }
            if (this.bestVertical) {
                ctx.beginPath()
                ctx.moveTo(0, this.bestVertical.pos)
                ctx.lineTo(this.figure.width, this.bestVertical.pos)
                ctx.stroke()
            }
        }
        ctx.restore()
    }
}

Constrain.EditableFigure = EditableFigure

}
)()

