Constrain.Graph = function() {

const {
    Loss, Minus, CanvasRect, Min, Max, Times, Distance, Plus, Divide, Sqrt,
    Conditional, LayoutObject, Variable, evaluate, Expression, exprVariables,
    Global, DebugExpr, SolverCallback
} = Constrain

// How strongly graph constraints are enforced, by default. << 1 because these are supposed to
// be soft constraints, i.e., regular constraints will "give" very little to accommodate them
const GRAPH_COST = 0.01

// How densely laid out nodes in a graph are, relative to their size, by default.
const GRAPH_SPARSITY = 1

// gravity force on directed edges
const GRAPH_GRAVITY = 40

// 1/r^2 force pushing all nodes apart from each other
const GRAPH_REPULSION = 1000

// Torsional force spreading edges apart
const GRAPH_BRANCH_SPREAD = 400

// How much it costs to use fully squeezed dimensions
const LARGE_DIM_COST = 1000000

// cost of partially squeezed dimensions
const DIM_COST = 100

// A NodePos computes a higher-dimensional position in which
// the first two coordinates are the (x,y) position of the object
// and the remaining coordinates are the "extra dimensions" specified
// by the graph.
class NodePos extends LayoutObject {
    constructor(object, graph) {
        super()
        this.obj = object
        this.graph = graph
        const n = this.graph.numExtraDims + 2
        if (n > 2) {
            this.obj.extraDims = new Array(n-2)
            for (let i = 2; i < n; i++) {
                this.obj.extraDims[i-2] = new Variable(graph.figure, "np" + i)
                this.obj.extraDims[i-2].hint = Math.random() - 0.5
            }
        }
    }
    object() {
        return this.obj
    }
    x() {
        return this.obj.x()
    }
    y() {
        return this.obj.y()
    }
    w() {
        return this.obj.w()
    }
    h() {
        return this.obj.h()
    }
    evaluate(valuation, doGrad) {
        let result = evaluate(this.obj, valuation, doGrad)
        const n = this.graph.numExtraDims + 2
        if (n == 2) return result
        result = result.slice(0)
        for (let i = 2; i < n; i++) {
            const extra = evaluate(this.obj.extraDims[i-2], valuation, doGrad) 
            if (doGrad) {
                result[0].push(extra[0])
                result[1].push(extra[1])
            } else {
                result.push(extra)
            }
        }
        return result
    }
    initDiff() {
        this.bpDiff = new Array(this.graph.numExtraDims + 2).fill(0)
    }
    backprop(task) {
        const d = this.bpDiff,
              n = 2 + this.graph.numExtraDims
        if (d.length != n) {
            console.error("wrong number of dimensions being propagated through NodePos")
        }
        task.propagate(this.obj, d.slice(0, 2))
        for (let i = 2; i < n; i++) {
            task.propagate(this.obj.extraDims[i-2], d[i])
        }
    }
    addDependencies(task) {
        task.prepareBackProp(this.obj)
        for (let i = 0; i < this.graph.numExtraDims; i++) {
            task.prepareBackProp(this.obj.extraDims[i])
        }
    }
    variables() {
        let result = this.obj.variables()
        for (let i = 0; i < this.graph.numExtraDims; i++) {
            const vs = exprVariables(this.obj.extraDims[i])
            if (vs.length > 0) result = result.concat(vs)
        }
        return result
    }
}

var graphIndex = 0

class Graph {
    constructor(figure) {
        this.figure = figure
        this.sparsity = GRAPH_SPARSITY
        this.cost = GRAPH_COST
        this.gravity = GRAPH_GRAVITY
        this.repulsion = GRAPH_REPULSION
        this.branchSpread = GRAPH_BRANCH_SPREAD
        this.horizontalLayout = false
        this.hintsComputed = false
        this.nodes = []
        this.edges = []
        this.numExtraDims = 0
        this.setEffectiveDimension(() => this.numExtraDims+2)
        figure.registerCallback(new SolverCallback("graph" + graphIndex,
            (it, x0, f0, g0, H1) => {
                const d = 2 + (1.0 - it/1000.0) * this.numExtraDims
                // console.log("graph callback seen iter " + it + " value " + f0 + " dim=" + d);
                this.setEffectiveDimension(() => d)
                return false
            }))
    }
    setExtraDims(d) {
        this.numExtraDims = d
    }
    // Define the effective dimensionality of points as a function f
    // that returns the effective dimensionality when queried. This
    // can be any real number at or above 2. Position coordinates
    // whose dimension is at least 1 full dimension too large
    // incur a cost multiplier of LARGE_DIM_COST. Dimensions
    // that are too large by x incur a cost multiplier of x/(1-x)
    //
    setEffectiveDimension(f) {
        this.effectiveDimensionFunction = f
    }
    // The NodePos associated with graphical object g. One is created if
    // none exists yet in this graph.
    addNode(g) {
        const fig = this.figure
        for (let i = 0; i < this.nodes.length; i++) {
            // if (g === this.nodes[i])
            if (g === this.nodes[i].object()) 
            {
                return this.nodes[i]
            }
        }
        g = new NodePos(g, this)
        // nodes would like to be far apart
        const cr = fig.canvasRect().inset(2),
              sz = fig.min(cr.w(), cr.h()),
              n = this.numExtraDims + 2
        for (let i = 0; i < this.nodes.length; i++) {
            let g2 = this.nodes[i],
                dist = fig.distance(g2, g, n), cr = new CanvasRect(this.figure),
                bdist = new Min(new Max(dist, 1), cr.w(), cr.h()),
                   // repulsion cuts off below 1 pixel and at canvas size
                potential = fig.divide(this.repulsion * this.sparsity, bdist)
            // potential = new DebugExpr("potential between " + g + " and " + g2, potential)
            fig.costEqual(this.cost, potential, 0)
        }
        if (this.effectiveDimensionFunction) {
            // Add the "squeeze" loss to keep nodes inside the effective dimensionality
            let dimension = new Global(v => (this.effectiveDimensionFunction)(v), "dimension")
            for (let d = 2; d < n; d++) {
                const x = fig.minus(d, dimension),
                      x2 = fig.minus(1, x);
                new Loss(fig, new Conditional(x,
                                fig.times(fig.sq(fig.projection(g, d, n)),
                                          new Conditional(x2,
                                                          fig.times(DIM_COST, fig.divide(x, x2)),
                                                          LARGE_DIM_COST)),
                                0))
            }
        }
        this.nodes.push(g)
        // but keep the node inside the figure
        fig.keepInside(g, cr)
        return g
    }
    // Add an undirected edge between objects g1 and g2, adding the objects as nodes if necessary.
    // Return the (straight) connector between them.
    edge(g1, g2) {
        const fig = this.figure
        g1 = this.addNode(g1)
        g2 = this.addNode(g2)
        fig.costEqual(this.cost,
                      new Distance(g1, g2, this.numExtraDims + 2),
                      new Times(new Plus(g1.w(), g1.h(), g2.w(), g2.h()),
                                this.sparsity))
        // add same-direction penalty
        
        for (let i = 0; this.branchSpread != 0 && i < this.edges.length; i++) {
            let [a, b] = this.edges[i]
            let c = g1, d = g2
            if (b === c) {
                const t = b; b = a; a = t
            } else if (b === d) {
                const t = b; b = a; a = t
                d = c
            } else if (a === d) {
                d = c
            } else if (a !== c) {
                continue
            }
// now a == c, have edges a -> b and a -> d
// dot product = (b - a) • (d - a) = |b-a|·|d-a|·cos(theta)
            let dot = new Plus(new Times(new Minus(b.x(), a.x()),
                                         new Minus(d.x(), a.x())),
                               new Times(new Minus(b.y(), a.y()),
                                         new Minus(d.y(), a.y())))
            // dot = new DebugExpr("dot", dot)
            let d1 = new Distance(a, b), d2 = new Distance(a, d)
            // d1 = new DebugExpr("d1", d1)
            // d2 = new DebugExpr("d2", d2)
            let normalization = new Times(new Max(d1, 0.001), new Max(d2, 0.001)),
                cos = new Divide(dot, normalization)
            // cos = new DebugExpr("cos", cos)
            fig.costEqual(this.cost * this.branchSpread * this.sparsity,
                            new Sqrt(new Minus(1, cos)), 2)
        }
        this.edges.push([g1, g2])
        return fig.connector(g1.object(), g2.object())
    }
    // Add an directed edge between objects g1 and g2, adding the objects as nodes if necessary.
    // Constraints are added to order them top-to-bottom or left-to-right, depending on the the figure's
    // horizontalLayout property.
    // Return the (straight) connector between the objects.
    dedge(g1, g2) {
        const fig = this.figure,
              result = this.edge(g1, g2)
        g1 = this.addNode(g1)
        g2 = this.addNode(g2)
        if (this.horizontalLayout) {
            fig.geq(fig.minus(g2.x0(), g1.x1()), fig.times(0.25, fig.plus(g1.w(), g2.w()))).changeCost(this.cost * this.gravity)
        } else {
            new Loss(fig, new Minus(g1.y(), g2.y())).changeCost(this.cost * this.gravity)
            // fig.geq(fig.minus(g2.y0(), g1.y1()), fig.times(0.25, fig.plus(g1.h(), g2.h()))).changeCost(this.cost * this.gravity)
        }
        return result
    }
    setupHints() {
        const graph = this
        if (graph.hintsComputed) return
        graph.hintsComputed = true
        if (this.nodes.length == 0) return
        let root = this.nodes[0], visited = []
        function traverse(n, level, x, y) {
            if (x === undefined) x = 200
            if (y === undefined) y = 100
            if (visited.includes(n)) return
            console.log("Hinting " + n + " at " + x + ", " + y)
            visited.push(n)
            let outgoing = 0
            graph.edges.forEach(e => {
                const [g1, g2] = e
                if (g1 == n) outgoing++
            })
            let kid = 0
            let spread = 256 >> level
            graph.edges.forEach(e => {
                let [g1, g2] = e
                if (g1 == n) {
                    const n2 = g1 == n ? g2 : g1,
                        x2 = x + ((++kid)/(outgoing + 1) - 0.5) * spread,
                        y2 = y + 100 * graph.sparsity
                    if (n2.x().setHint) n2.x().setHint(x2)
                    if (n2.y().setHint) n2.y().setHint(y2)
                    traverse(n2, level+1, x2, y2)
                }
            })
        }
        traverse(root, 0, root.x().hint, root.y().hint)
    }
}

Constrain.Figure.prototype.graph = function() {
    return new Graph(this)
}

return Graph

}()
