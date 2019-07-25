/* RevealFig.init() :
 *      set up Reveal to animate figures.
 */

// Figures can be fragments or regular components.
// In the latter case, the frames of the figure happen
// with the Reveal fragments.
// In the former case, the entire figure happens between
// Reveal fragments.
var ConstrainReveal = function() {

    let currentFigure = null, slideFigures = []

    const Figures = Constrain.Figures

    function newSlideHook(e) {
        console.log("new slide hook: " + e.type)
        currentFigure = null
        const slide = Reveal.getCurrentSlide() 
        canvases = slide.querySelectorAll('canvas')
        slideFigures.forEach(f => f.endCurrentFrame())
        slideFigures = []
        for (let i = 0; i < canvases.length; i++) {
            for (let j = 0; j < Figures.length; j++) {
                if (Figures[j].canvas == canvases[i]) {
                    slideFigures.push(Figures[j])
                    Figures[j].start()
                }
            }
        }
         console.log(Figures.length + " figures")
         console.log(slideFigures.length + " figures on this slide")
    }

    function hasClass(elem, cls) {
        return elem.classList.contains(cls)
    }

    function fragmentFigure(fig) {
        return hasClass(fig.canvas, "fragment")
    }

// Whether a figure is ready to be advanced
    function activeFigure(fig) {
        const ff = fragmentFigure(fig)
        if (!ff && !fig.isComplete()) return true
        if (ff && hasClass(fig.canvas, "current-fragment") && !fig.isComplete()) return true
        return false
    }

// Whether a figure is ready to be rewound (must be visible and not on first frame)
    function rewindableFigure(fig) {
        const ff = fragmentFigure(fig)
        if (!ff && !fig.isReset()) return true
        if (ff && hasClass(fig.canvas, "current-fragment") && !fig.isReset()) return true
        return false
    }

// Whether some fragment is ready to be advanced
    function activeFragment() {
        let r = false
        slideFigures.forEach(fig => {
            const active = (activeFigure(fig) && fragmentFigure(fig))
            if (active) { console.log("a figure is active: "); console.log(fig) }
            r = r || active
        })
        return r
    }

    function advanceActiveFragments() {
        // console.log("advancing active fragments")
        let sawFragment = false
        slideFigures.forEach(f => {
            if (fragmentFigure(f) && activeFigure(f)) {
                f.advance()
                console.log("advanced to frame " + f.currentFrame.index)
            }
        })
    }

    function advanceNonFragments() {
        slideFigures.forEach(f => {
            if (!fragmentFigure(f) && !f.isComplete()) {
                f.advance()
            }
        })
    }

    function rewindNonFragments() {
        slideFigures.forEach(f => {
            if (!fragmentFigure(f) && !f.isReset()) {
                f.rewind()
            }
        })
    }

    function completeNonFragments() {
        slideFigures.forEach(f => {
            if (!fragmentFigure(f) && !f.isComplete()) {
                f.reset()
                f.complete()
            }
        })
    }

    function rewindableFragment() {
        let r = false
        slideFigures.forEach(fig => {
            const cond = (rewindableFigure(fig) && fragmentFigure(fig))
            if (cond) { console.log("a figure can be rewound: "); console.log(fig) }
            r = r || cond
        })
        return r
    }

    function rewindActiveFragments() {
        slideFigures.forEach(f =>  {
            if (fragmentFigure(f) && rewindableFigure(f)) {
                f.rewind()
                console.log("rewound to frame " + f.currentFrame.index)
            }
        })
    }

    function completeActiveFragments() {
        slideFigures.forEach(f => {if (fragmentFigure(f) && activeFigure(f)) f.complete()})
    }

    function resetActiveFragments() {
        slideFigures.forEach(f => {if (fragmentFigure(f) && rewindableFigure(f)) f.reset()})
    }

    return {
        initialize: function() {
        console.log("initializing ConstrainReveal")
            Reveal.addEventListener( 'slidechanged', newSlideHook);
            Reveal.addEventListener( 'ready', newSlideHook);

            const reveal_next = Reveal.navigateNext,
                  reveal_right = Reveal.navigateRight,
                  reveal_left = Reveal.navigateLeft,
                  reveal_prev = Reveal.navigatePrev

            Reveal.navigateNext = function() {
                if (!activeFragment()) {
                    completeActiveFragments()
                    advanceNonFragments()
                    reveal_next.call(this)
                } else {
                    advanceActiveFragments()
                }
            }
            Reveal.navigatePrev = function() {
                if (!rewindableFragment()) {
                    reveal_prev.call(this)
                } else {
                    rewindActiveFragments()
                }
            }
            Reveal.navigateRight = Reveal.navigateNext
            Reveal.navigateLeft = Reveal.navigatePrev

            Constrain.setupResize()
        }
    }
}()
