const canvas = document.getElementsByTagName("canvas")[0]

Constrain.fullWindowCanvas(canvas)

const figure = new Constrain.Figure(canvas)

with (figure) {
    const m = margin()
    const max_levels = 15

    function dragon_points(p0, p1, level, sign) {
        if (level == 0) return [p0]
        const p2 = relative(0.5, 0.5 * sign, p0, p1)
        let result = dragon_points(p0, p2, level-1, 1)
        result = result.concat(dragon_points(p2, p1, level-1, -1))
        return result
    }

    const ll = m.ll(), lr = m.lr()
    const p0 = point(), p1 = point()
    const w = 0.7
    equal(p0.y(), p1.y(), m.y())
    equal(p0.x(), plus(times(w, ll.x()), times(1 - w, lr.x())))
    equal(p1.x(), plus(times(1 - w, ll.x()), times(w, lr.x())))

    for (let level = max_levels - 1; level >= 0; level--) {
        const pts = dragon_points(p0, p1, level, -1)
        const opacity = 0.5 + 0.5/(level + 1)
        const f = 255*(max_levels - level)/max_levels
        const strokeStyle = (level == max_levels - 1)
            ? '#fff'
            : `rgb(${f}, ${f}, ${255-f/2})`
        const c = connector(...pts, p1)
            .setOpacity(opacity)
            .setLineWidth(times(0.05, distance(p0,p1), Math.pow(0.7071, level)))
            .setStrokeStyle(strokeStyle)
    }
}

Constrain.autoResize()
Constrain.setupTouchListeners()
figure.start()
