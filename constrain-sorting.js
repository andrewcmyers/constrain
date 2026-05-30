// Constrain extension for animated sorting visualizations.
// Provides a SortingArray class that manages an array of boxes
// and supports animated insert, swap, highlight, and sorted-region
// operations.
//
// Usage:
//   <script src="constrain.js"></script>
//   <script src="constrain-sorting.js"></script>
//   ...
//   with (new Constrain.Figure("canvas")) {
//       freeze()  // must be called before sortingArray()
//       const sa = sortingArray([5, 3, 8, 1, 9], { slideTime: 800 })
//       align("center", "center", sa, canvasRect())
//       // insertion sort:
//       for (let i = 1; i < 5; i++) {
//           let j = i
//           while (j > 0 && sa.valueAt(j - 1) > sa.valueAt(j)) j--
//           sa.highlight(i).markSorted(i).insert(i, j)
//       }
//       sa.finish()
//       align("right", "bottom", advanceButton(), canvasRect().inset(10))
//       start()
//   }

Constrain.Sorting = function() {

let { Box, Figure, ConstraintGroup } = Constrain

// A SortingArray creates and manages an animated row of boxes representing
// array elements. It is also a graphic and can be positioned with constraints.
class SortingArray extends Box {

    // Create a sorting array visualization.
    //   figure:  the Figure
    //   values:  array of numbers (or strings) to display
    //   style options:
    //     boxWidth:        width of each box (default: auto-sized)
    //     boxGap:             space between boxes (default: ~10% of boxWidth)
    //     slideTime:       animation duration in ms (default: 800)
    //     boxFill:         fill color for boxes (default: "#dde4ea")
    //     boxStroke:       stroke color for boxes (default: "#456")
    //     highlightStroke: highlight border color (default: "#e07020")
    //     sortedFill:      sorted background fill (default: "#b5d8a0")
    //     sortedStroke:    sorted background stroke (default: "#7ab35e")
    constructor(figure, values) {
        super(figure)
        const f = figure
        const n = values.length
        const gap = f.getStyle('boxGap') || 3
        const highlightStroke = f.getStyle('highlightStroke') || "#e07020"
        const boxStroke = f.getStyle('boxStroke') || "#456"
        const boxFill = f.getStyle('boxFill') || "#dde4ea"
        const sortedFill = f.getStyle('sortedFill') || "#b5d8a0"
        const sortedStroke = f.getStyle('sortedStroke') || "#7ab35e"
        this._sortedPad = f.getStyle('sortedPad') || 4

        this.figure = f
        this.n = n
        this.arr = values.slice()
        this.slideTime = f.getStyle('slideTime') || 800

        // Frame used to scope initial position constraints
        const initial = f.currentFrame

        this.slots = []
        const boxW = f.variable(),
              slotW = f.plus(boxW, gap)
        this.boxW = boxW
        for (let i = 0; i < n; i++) this.slots.push(f.box().setW(boxW))
        f.align("abut", "top bottom", ...this.slots)
        // Compute slot center-x positions relative to this box
        this.slotX = []
        for (let i = 0; i < n; i++) this.slotX[i] = this.slots[i].x()
        const allSlots = f.group(...this.slots)

        // --- Sorted region (single rectangle, created first → renders behind) ---
        this.sortedRect = f.rectangle()
            .setFillStyle(sortedFill)
            .setStrokeStyle(sortedStroke)
            .setLineWidth(3)
            .setCornerRadius(5)

        f.align("LR", "TB", this, allSlots)
        
        // Start offscreen with zero width
        this._sortedXConstraint = f.after(initial,
            f.equal(this.sortedRect.x(), -1000))
        this._sortedWConstraint = f.after(initial,
            f.equal(this.sortedRect.w(), 0))
        this.sortedEnd = 0 // exclusive: sorted region covers slots [0, sortedEnd)

        // --- Element boxes ---
        this.boxes = []
        for (let i = 0; i < n; i++) {
            const b = f.rectangle()
                .addText("" + values[i])
                .setCornerRadius(3)
                .setLineWidth(1.5)
                .setStrokeStyle(boxStroke)
                .setFillStyle(boxFill)
            f.equal(b.w(), boxW)
            f.equal(f.plus(b.h(), 4), this.sortedRect.h())
            this.boxes.push(b)
        }

        // --- Highlight (orange border tracking the active element) ---
        this.highlightGraphic = f.rectangle()
            .setFillStyle(null)
            .setStrokeStyle(highlightStroke)
            .setLineWidth(3)
            .setCornerRadius(3)
        f.equal(this.highlightGraphic.w(), f.plus(boxW, this._sortedPad))

        // Vertically center everything within this box
        f.align("none", "center",
            this.sortedRect, ...this.boxes, this.highlightGraphic, this)

        // --- Initial position constraints ---
        this.posConstraints = []
        for (let i = 0; i < n; i++) {
            this.posConstraints[i] = f.after(initial,
                f.equal(this.boxes[i].x(), this.slots[i].x()))
        }
        this.highlightConstraint = f.after(initial,
            f.equal(this.highlightGraphic.x(), -1000))

        // Slot ↔ box tracking
        this.slotBox = new Array(n) // slotBox[slot] → box index
        this.boxSlot = new Array(n) // boxSlot[box]  → slot index
        for (let i = 0; i < n; i++) {
            this.slotBox[i] = i
            this.boxSlot[i] = i
        }

        // Pending operations queued for the next insert/swap
        this._pendingHighlight = undefined
        this._pendingSortedEnd = 0

        // Named highlights and regions (for quicksort etc.)
        this._namedHighlights = {}
        this._pendingHighlightMoves = {}
        this._namedRegions = {}
        this._pendingRegionChanges = {}

        // Save initial frame for later addHighlight/addRegion calls
        this._initialFrame = initial
    }

    // No extra rendering needed; child graphics render themselves.
    render() {}

    // --- Queued operations (applied at the next insert/swap/step) ---

    // Highlight the element currently at the given slot.
    // The highlight tracks the element through subsequent animations.
    highlight(slot) {
        this._pendingHighlight = slot
        return this
    }

    // Extend the sorted region to include through the given slot.
    // The sorted region always starts at slot 0 and grows rightward.
    // markSorted(i) means slots 0..i are sorted.
    markSorted(slot) {
        this._pendingSortedEnd = Math.max(this._pendingSortedEnd, slot + 1)
        return this
    }

    // Internal: apply pending highlight and sorted marks to the given show frame.
    _flushPending(showFrame) {
        const f = this.figure

        if (this._pendingHighlight !== undefined) {
            const boxId = this.slotBox[this._pendingHighlight]
            this.highlightConstraint.endBefore(showFrame)
            this.highlightConstraint = f.after(showFrame,
                f.equal(this.highlightGraphic.x(), this.boxes[boxId].x()))
            this._pendingHighlight = undefined
        }

        if (this._pendingSortedEnd > this.sortedEnd) {
            this.sortedEnd = this._pendingSortedEnd
            const pad = this._sortedPad
            const w1 = f.plus(pad, f.times(this.boxW, 0.5))
            const leftX = f.minus(this.slots[0].x(), w1)
            const rightX = f.plus(this.slots[this.sortedEnd - 1].x(), w1)
            const centerX = f.times(0.5, f.plus(leftX, rightX))
            const width = f.minus(rightX, leftX)

            this._sortedXConstraint.endBefore(showFrame)
            this._sortedXConstraint = f.after(showFrame,
                f.equal(this.sortedRect.x(), centerX))
            this._sortedWConstraint.endBefore(showFrame)
            this._sortedWConstraint = f.after(showFrame,
                f.equal(this.sortedRect.w(), width))
        }

        // Named highlights
        for (const name of Object.keys(this._pendingHighlightMoves)) {
            const slot = this._pendingHighlightMoves[name]
            const h = this._namedHighlights[name]
            if (!h) continue
            h.constraint.endBefore(showFrame)
            if (slot === null || slot === undefined) {
                h.constraint = f.after(showFrame,
                    f.equal(h.graphic.x(), -1000))
            } else {
                h.constraint = f.after(showFrame,
                    f.equal(h.graphic.x(), this.slotX[slot]))
            }
        }
        this._pendingHighlightMoves = {}

        // Named regions
        for (const name of Object.keys(this._pendingRegionChanges)) {
            const range = this._pendingRegionChanges[name]
            const r = this._namedRegions[name]
            if (!r) continue
            r.xConstraint.endBefore(showFrame)
            r.wConstraint.endBefore(showFrame)
            if (range === null || range === undefined) {
                r.xConstraint = f.after(showFrame,
                    f.equal(r.graphic.x(), -1000))
                r.wConstraint = f.after(showFrame,
                    f.equal(r.graphic.w(), 0))
            } else {
                const pad = r.padding
                const w1 = f.plus(f.times(this.boxW, 0.5), pad)
                const leftX = f.minus(this.slotX[range.start], w1)
                const rightX = f.plus(this.slotX[range.end], w1)
                const centerX = f.times(0.5, f.plus(leftX, rightX))
                const width = f.minus(rightX, leftX)
                r.xConstraint = f.after(showFrame,
                    f.equal(r.graphic.x(), centerX))
                r.wConstraint = f.after(showFrame,
                    f.equal(r.graphic.w(), width))
            }
        }
        this._pendingRegionChanges = {}
    }

    // --- Named highlights ---

    // Create a named highlight (e.g. for left/right pointers).
    // Uses figure styles: {name}Stroke (fallback: highlightStroke).
    addHighlight(name) {
        const f = this.figure
        const stroke = f.getStyle(name + 'Stroke')
            || f.getStyle('highlightStroke') || "#e07020"
        const g = f.rectangle()
            .setFillStyle(null)
            .setStrokeStyle(stroke)
            .setLineWidth(3)
            .setCornerRadius(3)
        f.equal(g.w(), f.plus(this.boxW, this._sortedPad))
        f.align("none", "center", g, this)
        const constraint = f.after(this._initialFrame,
            f.equal(g.x(), -1000))
        this._namedHighlights[name] = { graphic: g, constraint }
        return this
    }

    // Queue moving a named highlight to the given slot.
    moveHighlight(name, slot) {
        this._pendingHighlightMoves[name] = slot
        return this
    }

    // Queue hiding a named highlight.
    hideHighlight(name) {
        this._pendingHighlightMoves[name] = null
        return this
    }

    // --- Named regions ---

    // Create a named background region rectangle.
    // Uses figure styles: {name}Fill, {name}Stroke, {name}Padding,
    // {name}LineWidth (with fallbacks to sorted region defaults).
    // Regions are rendered behind element boxes.
    addRegion(name) {
        const f = this.figure
        const fill = f.getStyle(name + 'Fill')
            || f.getStyle('sortedFill') || "#b5d8a0"
        const stroke = f.getStyle(name + 'Stroke')
            || f.getStyle('sortedStroke') || "#7ab35e"
        const lineWidth = f.getStyle(name + 'LineWidth') || 3
        const pad = f.getStyle(name + 'Padding') || this._sortedPad
        const rect = f.rectangle()
            .setFillStyle(fill)
            .setStrokeStyle(stroke)
            .setLineWidth(lineWidth)
            .setCornerRadius(5)
        f.equal(rect.h(), f.plus(this.h(), pad * 2))
        f.align("none", "center", rect, this)

        // Insert before boxes so it renders behind them
        const firstBoxIdx = f.Graphics.indexOf(this.boxes[0])
        const rectIdx = f.Graphics.indexOf(rect)
        if (rectIdx > firstBoxIdx) {
            f.Graphics.splice(rectIdx, 1)
            f.Graphics.splice(firstBoxIdx, 0, rect)
        }

        const xConstraint = f.after(this._initialFrame,
            f.equal(rect.x(), -1000))
        const wConstraint = f.after(this._initialFrame,
            f.equal(rect.w(), 0))
        this._namedRegions[name] = {
            graphic: rect, xConstraint, wConstraint, padding: pad
        }
        return this
    }

    // Queue setting a named region to cover slots [start, end].
    // If start > end, the region is hidden.
    setRegion(name, start, end) {
        if (start > end) {
            this._pendingRegionChanges[name] = null
        } else {
            this._pendingRegionChanges[name] = { start, end }
        }
        return this
    }

    // Queue hiding a named region.
    hideRegion(name) {
        this._pendingRegionChanges[name] = null
        return this
    }

    // --- Step (flush visuals without element movement) ---

    // Create a frame that applies pending highlight/region changes.
    // By default auto-advances so visual-only changes flow through.
    step(options = {}) {
        const autoAdvance = options.autoAdvance !== undefined
            ? options.autoAdvance : true
        const frame = this.figure.addFrame().setLength(1)
        if (autoAdvance) frame.setAutoAdvance(true)
        this._flushPending(frame)
        return this
    }

    // --- Animation operations ---

    // Move the element at slot `from` to slot `to`, shifting
    // intervening elements by one position. This is the core
    // operation for insertion sort.
    //
    // Creates two frames: a show frame (1 ms, highlight jumps +
    // sorted marks appear) followed by a slide frame (animated
    // movement, auto-advances from the show frame).
    //
    // If from === to, only the show frame is created (element is
    // already in place; no slide needed).
    insert(from, to) {
        const f = this.figure

        const showFrame = f.addFrame().setLength(1)
        this._flushPending(showFrame)

        if (from === to) {
            // Re-anchor in place (no slide)
            const boxId = this.slotBox[from]
            this.posConstraints[boxId].endBefore(showFrame)
            this.posConstraints[boxId] = f.after(showFrame,
                f.equal(this.boxes[boxId].x(), this.slotX[from]))
            return this
        }

        const slideFrame = f.addFrame()
            .setLength(this.slideTime)
            .setAutoAdvance(true)

        const insertBoxId = this.slotBox[from]

        if (from > to) {
            // Moving left → shift elements at [to .. from-1] rightward
            for (let k = from - 1; k >= to; k--) {
                const bId = this.slotBox[k]
                this.posConstraints[bId].endBefore(slideFrame)
                this.posConstraints[bId] = f.after(slideFrame,
                    f.equal(this.boxes[bId].x(),
                        f.smooth(slideFrame, this.slotX[k], this.slotX[k + 1])))
                this.slotBox[k + 1] = bId
                this.boxSlot[bId] = k + 1
            }
        } else {
            // Moving right → shift elements at [from+1 .. to] leftward
            for (let k = from + 1; k <= to; k++) {
                const bId = this.slotBox[k]
                this.posConstraints[bId].endBefore(slideFrame)
                this.posConstraints[bId] = f.after(slideFrame,
                    f.equal(this.boxes[bId].x(),
                        f.smooth(slideFrame, this.slotX[k], this.slotX[k - 1])))
                this.slotBox[k - 1] = bId
                this.boxSlot[bId] = k - 1
            }
        }

        // Move the inserted element to its destination
        this.posConstraints[insertBoxId].endBefore(slideFrame)
        this.posConstraints[insertBoxId] = f.after(slideFrame,
            f.equal(this.boxes[insertBoxId].x(),
                f.smooth(slideFrame, this.slotX[from], this.slotX[to])))
        this.slotBox[to] = insertBoxId
        this.boxSlot[insertBoxId] = to

        // Update the logical array
        const val = this.arr[from]
        if (from > to) {
            for (let k = from; k > to; k--) this.arr[k] = this.arr[k - 1]
        } else {
            for (let k = from; k < to; k++) this.arr[k] = this.arr[k + 1]
        }
        this.arr[to] = val

        return this
    }

    // Swap the elements at slots i and j.
    // Creates a show frame + slide frame, like insert().
    swap(i, j) {
        if (i === j) {
            const showFrame = this.figure.addFrame().setLength(1)
            this._flushPending(showFrame)
            return this
        }

        const f = this.figure
        const showFrame = f.addFrame().setLength(1)
        this._flushPending(showFrame)

        const slideFrame = f.addFrame()
            .setLength(this.slideTime)
            .setAutoAdvance(true)

        const boxI = this.slotBox[i], boxJ = this.slotBox[j]

        this.posConstraints[boxI].endBefore(slideFrame)
        this.posConstraints[boxI] = f.after(slideFrame,
            f.equal(this.boxes[boxI].x(),
                f.smooth(slideFrame, this.slotX[i], this.slotX[j])))

        this.posConstraints[boxJ].endBefore(slideFrame)
        this.posConstraints[boxJ] = f.after(slideFrame,
            f.equal(this.boxes[boxJ].x(),
                f.smooth(slideFrame, this.slotX[j], this.slotX[i])))

        this.slotBox[i] = boxJ
        this.slotBox[j] = boxI
        this.boxSlot[boxI] = j
        this.boxSlot[boxJ] = i

        const tmp = this.arr[i]
        this.arr[i] = this.arr[j]
        this.arr[j] = tmp

        return this
    }

    // Hide the highlight. Creates a short frame.
    // Also flushes any pending sorted marks.
    clearHighlight() {
        const f = this.figure
        const frame = f.addFrame().setLength(200)
        this._flushPending(frame)
        this.highlightConstraint.endBefore(frame)
        this.highlightConstraint = f.after(frame,
            f.equal(this.highlightGraphic.x(), -1000))
        return this
    }

    // Finish the animation (hides all highlights and regions).
    finish() {
        for (const name of Object.keys(this._namedHighlights)) {
            this.hideHighlight(name)
        }
        for (const name of Object.keys(this._namedRegions)) {
            this.hideRegion(name)
        }
        return this.clearHighlight()
    }

    // --- Accessors ---

    // Current value at the given slot (tracks inserts and swaps).
    valueAt(i) { return this.arr[i] }

    // Number of elements.
    get length() { return this.n }

    // The box graphic for the element currently at the given slot.
    boxAt(slot) { return this.boxes[this.slotBox[slot]] }

    // The highlight graphic (for additional styling by the caller).
    getHighlight() { return this.highlightGraphic }

    // The sorted-region rectangle graphic.
    getSortedRect() { return this.sortedRect }
}

// Register the factory method on Figure.
Figure.prototype.sortingArray = function(values) {
    this.ensureFrame()
    return new SortingArray(this, values)
}

Constrain.SortingArray = SortingArray

}()
