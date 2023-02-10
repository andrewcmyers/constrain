const canvas = document.getElementsByTagName("canvas")[0]

Constrain.fullWindowCanvas(canvas)

const figure = new Constrain.Figure(canvas)

// Bezier constant for a circular arc: (4/3) tan(theta/4)
function circularArcConstant(degrees) {
    return (4/3) * Math.tan(degrees * Math.PI / 180 / 4)
}

const bezier_k = circularArcConstant(90)

with (figure) {
var border = rectangle("gray", "white", 1, 500, 500, 1000, 1000),
    h = handle("yellow", 300, 300),
    m = margin()
    equal(border, m)

    align("left", "top", h, border)

class SpiralPiece extends Constrain.Square {
    constructor(figure, style, side) {
       super(figure, style, "white", 1, 300, 300, 300)
       this.side = side
    }
    render() {
        super.render()
        let [x0, x1, y0, y1] = Constrain.evaluate([this.x0(), this.x1(), this.y0(), this.y1()])
        let ax = x0, ay = y0, bx = x0, by = y1, cx = x1, cy = y1, dx = x1, dy = y0, s = this.side
        while (s--) {
            const tx = ax, ty = ay
            ax = bx; ay = by; bx = cx; by = cy; cx = dx; cy = dy; dx = tx; dy = ty
        }
        const ctx = this.figure.ctx, f = 0.8,
                    k2 = bezier_k*f, k1 = 1 - k2,
                    k4 = bezier_k/f, k3 = 1 - k4
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.bezierCurveTo(ax*k1 + bx*k2, ay*k1 + by*k2,
                          cx*k3 + bx*k4, cy*k3 + by*k4,
                          cx, cy)
        ctx.strokeStyle = "yellow"
        ctx.lineWidth = scale*Math.sqrt(x1-x0)/5
        ctx.stroke()
    }
}
var leftE = border.x0(), rightE = border.x1(), topE = border.y0(), bottomE = border.y1(), steps = 16
for (let i = 0; i < steps; i++) {
    let b2 = new SpiralPiece(figure, Constrain.rgbStyle(Math.sqrt((i+1)/steps)*255,0,0), i%4)
    let le = leftE, re = rightE, te = topE, be = bottomE

    if (i%4 == 0) le = b2.x1()
      else equal(b2.x1(), rightE)
    if (i%4 == 1) be = b2.y0()
      else equal(b2.y0(), topE)
    if (i%4 == 2) re = b2.x0()
      else equal(b2.x0(), leftE)
    if (i%4 == 3) te = b2.y1()
      else equal(b2.y1(), bottomE)
    leftE = le
    rightE = re
    topE = te
    bottomE = be
}

let c = nearZero(minus(border.w(), canvasRect().x()))
let success;

[figure.currentValuation, success] = updateValuation()

let mw = Constrain.evaluate(border.w()),
    mh = Constrain.evaluate(border.h())
let phi = mw/mh
    t = label("The Golden Ratio is approximately " + phi, 30, "Palatino", "yellow")
align("center", "none", t, border)
align("none", "top", t, m)

figure.removeConstraints(c)
}
Constrain.autoResize()
Constrain.setupTouchListeners()
figure.start()
