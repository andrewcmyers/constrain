(() => {

const evaluate = Constrain.evaluate
const sqdist = Constrain.sqdist
const arrows = Constrain.arrows
const PI2 = Math.PI * 2

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


class Selectable {
    constructor(editable, aligns) {
        this.aligns = aligns
        this.editable = editable
        this.dragging = false
    }
    render(ctx) {
        console.error("unimplemented")
    }
    xy() {
        console.error("unimplemented")
    }
    selectablePoints() {
        return []
    }
    setDragging(dragging) {
        this.dragging = dragging
    }
}

const selectionDist2 = 16 // minimum squared distance for selectability

class SelectablePoint extends Selectable {
    constructor(editable, ex, ey, aligns) {
        super(editable, aligns)
        this.expr = [ex, ey]
    }
    x() {
        return this.expr[0]
    }
    y() {
        return this.expr[1]
    }
    xy() {
        return this.expr
    }
    // squared distance to (mx, my) if it is close, or null otherwise
    distanceTo(mx, my) {
        const [vx, vy] = evaluate(this.expr)
        const d = sqdist(mx - vx, my - vy)
        if (d > selectionDist2) return null
        return d
    }
    render(ctx) {
        const [x, y] = evaluate(this.expr)
        const editable = this.editable
        ctx.beginPath()
        ctx.fillStyle = "black"
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, PI2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, PI2)
        const j = this.aligns[0], k = this.aligns[1]
        if (this.selected) {
            ctx.fillStyle = "magenta"
        } else if (j >= 0 && editable.constraints[j] && editable.constraints[j].size > 0 ||
                    k >= 0 && editable.constraints[k] && editable.constraints[k].size > 0) {
            ctx.fillStyle = "orange"
        } else {
            ctx.fillStyle = "yellow"
        }
        ctx.fill()
    }
    selectablePoints() {
        return [this]
    }
}

function distToOrthLine(mx, my, x1, x2, y) {
    const dy = my - y, dysq = dy*dy,
          dx1 = mx - x1, dx2 = mx - x2,
          dxsq = Math.sign(x1 - mx) != Math.sign(x2 - mx)
                ? 0
                : Math.min(dx1*dx1, dx2*dx2)
    return dxsq + dysq
}

function hwline(ctx, x1, y1, x2, y2) {
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    arrows.arrow(ctx, x1, y1, x2, y2, 8)
    arrows.arrow(ctx, x2, y2, x1, y1, 8)
}

class SelectableHorzLine extends Selectable {
    constructor(editable, ex1, ex2, ey) {
        super(editable)
        this.ex1 = ex1
        this.ex2 = ex2
        this.ey = ey
    }
    distanceTo(mx, my) {
        const [vx1, vx2, vy] = evaluate([this.ex1, this.ex2, this.ey])
        const d2 = distToOrthLine(mx, my, vx1, vx2, vy)
        if (d2 > selectionDist2) return null
        return d2
    }
    render(ctx) {
        ctx.fillStyle = this.dragging ? "magenta" :
            this.constrained ? "orange" : "yellow"
        const [vx1, vx2, vy] = evaluate([this.ex1, this.ex2, this.ey])
        hwline(ctx, vx1, vy, vx2, vy)
    }
}

class SelectableVertLine extends Selectable {
    constructor(editable, ex, ey1, ey2) {
        super(editable)
        this.ex = ex
        this.ey1 = ey1
        this.ey2 = ey2
    }
    distanceTo(mx, my) {
        const [vx, vy1, vy2] = evaluate([this.ex, this.ey1, this.ey2])
        const d2 = distToOrthLine(my, mx, vy1, vy2, vx)
        if (d2 > selectionDist2) return null
        return d2
    }
    render(ctx) {
        ctx.fillStyle = this.dragging ? "magenta" :
            this.constrained ? "orange" : "yellow"
        const [vx, vy1, vy2] = evaluate([this.ex, this.ey1, this.ey2])
        hwline(ctx, vx, vy1, vx, vy2)
    }
}

class EditableGraphic extends Constrain.Control {
    constructor(figure, graphic) {
        super(figure, graphic, 4)
        this.graphic = graphic
        this.isActive = false
        this.dragStart = null // [mx, my] if dragging
        this.min_align_dist = 4
        this.selectionDist2 = 16
        this.selectedControl = null
        this.constraints = [] // constraints associated with each coordinate: x0, xc, x1, y0, yc, y1
    }
    active() {
        return this.isActive
    }
    mousedown(x, y, e) {
        if (!this.active() && !this.inBounds(x, y)) return false
        if (this.active() && !this.inBounds(x, y)) {
            this.selectedControl = null
            this.isActive = false
            this.figure.delayedRender()
            return false
        }
        const figure = this.figure
        this.isActive = true
        this.dragging = true
        const selectables = this.selectableControls()
        let bestd = this.selectionDist2 + 1, bestControl = null
        for (let i = 0; i < selectables.length; i++) {
            const s = selectables[i],
                  d = s.distanceTo(x, y)
            if (d != null && d < bestd) {
                bestd = d
                bestControl = s
            }
        }
        if (bestControl) {
            this.selectedControl = bestControl
            bestControl.setDragging(true)
            this.dragStart = [x,y]
            this.updateConstraints(bestControl, x, y)
            figure.setFocus(this)
        }
        figure.delayedRender()
        return true
    }
    removeConstraints(control) {
        const aligns = control.aligns
        console.log('trying to remove constraints on ', control)
        for (c of aligns) {
            console.log('trying to remove constraint ', c)
            if (c) this.disableConstraints(c)
        }
    }
    updateConstraints(control, mx, my) {
        const aligns = control.aligns
        console.log("updating constraints", aligns)
        if (aligns && aligns[0]) {
            const xv = aligns[0]
            this.disableConstraints(xv)
            const s = this.constraints[xv] = new Set()
            const x = control.x()
            if (x) s.add(figure.equal(mx, x))
            this.enableConstraints(xv)
        }
        if (aligns && aligns[1]) {
            const yv = aligns[1]
            this.disableConstraints(yv)
            const s = this.constraints[yv] = new Set()
            const y = control.y()
            if (y) s.add(figure.equal(my, y))
            this.enableConstraints(yv)
        }
        this.figure.discardSolverHints()
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
            if (this.dragStart) {
                if (this.bestHorizontal || this.bestVertical) {
                    const selectables = this.selectableControls()
                    const control = this.selectedControl
                    if (this.bestHorizontal) {
                        const j = control.aligns[0]
                        if (j >= 0) {
                            this.disableConstraints(j)
                            this.constraints[j] = new Set()
                            this.constraints[j].add(this.figure.equal(expr[i][0], this.bestHorizontal.expr))
                            this.enableConstraints(j)
                        }
                    }
                    if (this.bestVertical) {
                        const j = control.aligns[1]
                        if (j >= 0) {
                            this.disableConstraints(j)
                            this.constraints[j] = new Set()
                            this.constraints[j].add(this.figure.equal(expr[i][1], this.bestVertical.expr))
                            this.enableConstraints(j)
                        }
                    }
                }
                this.figure.discardSolverHints()
                this.dragStart = null
                if (this.selectedControl) {
                    this.selectedControl.setDragging(false)
                    this.selectedControl = false
                }
            }
        }
    }
    mousemove(x, y, e) {
        if (this.selectedControl) {
            const c = this.selectedControl
            this.updateConstraints(c, x, y)
            this.findAlignments(x,y,c.x(), c.y())
            this.figure.delayedRender()
        }
    }
    keydown(e) {
        if (e.key === ' ' && this.isActive) {
            if (this.selectedControl) {
                const c = this.selectedControl
                this.removeConstraints(c)
                this.selectedControl = null
                this.figure.delayedRender()
            }
        }
    }

    alignablePoints() {
        const result = []
        for (const control of this.selectableControls()) {
            for (const pt of control.selectablePoints()) {
                result.push(pt.xy())
            }
        }
        return result
    }

    // Return an array of selectable points both in unevaluated and evaluated form
    // as an object o = {evaluated, expr, aligns}
    // o.aligns is a 2-element array specifying what coordinates each of the selectable points
    // aligns to, as an index between 0 and 5, or null if no alignment on that axis should
    // occur.
    selectableControls() {
        const g = this.graphic, figure = this.figure
        const coords = [g.x0(), g.x(), g.x1(), g.y0(), g.y(), g.y1()]
        const values = evaluate(coords)
        const selectables = []
        // const evaluated = [], expr = [], aligns = []
        for (let i = 0; i < 9; i++) {
            const j = i%3, k = 3 + Math.floor(i/3)
            const aligns = [null, null]
            if (i != 1 && i != 7) aligns[0] = coords[j]
            if (i != 3 && i != 5) aligns[1] = coords[k]
            selectables.push(new SelectablePoint(this, coords[j], coords[k], aligns))
        }
        selectables.push(new SelectableHorzLine(this, coords[0], coords[2], figure.average(coords[3], coords[4])))
        selectables.push(new SelectableVertLine(this, figure.average(coords[0], coords[1]), coords[3], coords[5]))
        return selectables
    }

    // Find the best alignments of the mouse position (mx, my), against things
    // in the figure. xs and ys are the expressions representing the control
    // point whose position is being adjusted.
    // Effect: Sets the fields bestHorizontal, bestVertical to
    // either null (if no suitable alignment is found) or an object { dist,
    // pos, expr }. Each of xs and ys may be null to indicate no alignment
    // should be done on that axis.
    findAlignments(mx, my, xs, ys) {
        const min_align_dist = this.min_align_dist
        let bestHorizontal = null, bestVertical = null
        for (const io of this.figure.interactives) {
            if (io === this) continue
            if (io.alignablePoints) {
                const points = io.alignablePoints()
                for (const p of points) {
                    const [x2, y2] =  evaluate(p),
                          dx = Math.abs(x2 - mx),
                          dy = Math.abs(y2 - my) 
                    if (xs && dx < min_align_dist &&
                        (bestHorizontal === null || dx < bestHorizontal.dist)) {
                        bestHorizontal = { dist : dx, pos : x2, expr : p[0] }
                    }
                    if (ys && dy < min_align_dist &&
                        (bestVertical === null || dy < bestVertical.dist)) {
                        bestVertical = { dist : dy, pos : y2, expr : p[1] }
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
        const [x0, x1, y0, y1] = evaluate([this.graphic.x0(), this.graphic.x1(), this.graphic.y0(), this.graphic.y1()])
        const [xc, yc] = evaluate([this.graphic.x(), this.graphic.y()])
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y0)
        ctx.lineTo(x1, y1)
        ctx.lineTo(x0, y1)
        ctx.closePath()
        ctx.stroke()
        const selectable = this.selectableControls()
        for (const control of selectable) {
            control.render(ctx)
        }

        if (this.dragStart) {
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

