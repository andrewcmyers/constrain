const canvas = document.getElementsByTagName("canvas")[0]

Constrain.fullWindowCanvas(canvas)

const figure = new Constrain.Figure(canvas)

with (figure) {
    const m = margin()
    const max_levels = 14


    function dragon(p0, p1, levels) {
        if (levels == 0) return
        // console.log(Array(10 - levels).join("  ") + levels + " dragon")
        const p2 = relative(0.5, 0.5, p0, p1)
        setLineWidth(times(distance(p0, p1), 0.02))
        const opacity = 0.5 + 0.5/levels
        const f = 255*levels/max_levels
        const c = connector(p0, p2, p2, p1)
            .setOpacity(opacity)
        if (levels == 1) {
            c.setStrokeStyle('#fff')
        } else {
            c.setStrokeStyle(`rgb(${f}, ${f}, ${255-f/2})`)
        }
        dragon(p0, p2, levels - 1)
        dragon(p1, p2, levels - 1)
    }

    const ll = m.ll(), lr = m.lr()
    const p0 = point(), p1 = point()
    const w = 0.7
    equal(p0.y(), p1.y(), m.y())
    equal(p0.x(), plus(times(w, ll.x()), times(1 - w, lr.x())))
    equal(p1.x(), plus(times(1 - w, ll.x()), times(w, lr.x())))
    setStrokeStyle('white')
    dragon(p1, p0, max_levels)
}

Constrain.autoResize()
Constrain.setupTouchListeners()
figure.start()
