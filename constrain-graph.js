Constrain.Graph = function() {

const Loss = Constrain.Loss, Minus = Constrain.Minus,
      CanvasRect = Constrain.CanvasRect, Min = Constrain.Min,
      Max = Constrain.Max, Times = Constrain.Times, Distance = Constrain.Distance,
      Plus = Constrain.Plus, Divide = Constrain.Divide,
      Sqrt = Constrain.Sqrt

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
    }
    addNode(g) {
        const fig = this.figure
        for (let i = 0; i < this.nodes.length; i++) {
            if (g === this.nodes[i]) return false
        }
        // nodes would like to be far apart
        const cr = fig.canvasRect().inset(2),
              sz = fig.min(cr.w(), cr.h())
        for (let i = 0; i < this.nodes.length; i++) {
            let g2 = this.nodes[i],
                dist = fig.distance(g2, g), cr = new CanvasRect(this.figure),
                bdist = new Min(new Max(dist, 1), new Times(1.0, cr.w()), new Times(1.0, cr.h())),
                   // repulsion cuts off below 1 pixel and at canvas size
                potential = fig.divide(this.repulsion * this.sparsity, bdist)
            // potential = new DebugExpr("potential between " + g + " and " + g2, potential)
            fig.costEqual(this.cost, potential, 0)
        }
        this.nodes.push(g)
        // but keep the node inside the figure
        fig.keepInside(g, cr)
        return true
    }
    // Add an undirected edge between objects g1 and g2, adding the objects as nodes if necessary.
    // Return the (straight) connector between them.
    edge(g1, g2) {
        const fig = this.figure
        this.addNode(g1)
        this.addNode(g2)
        fig.costEqual(this.cost,
                      new Distance(g1, g2),
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
        return fig.connector(g1, g2)
    }
    // Add an directed edge between objects g1 and g2, adding the objects as nodes if necessary.
    // Constraints are added to order them top-to-bottom or left-to-right, depending on the the figure's
    // horizontalLayout property.
    // Return the (straight) connector between the objects.
    dedge(g1, g2) {
        const fig = this.figure
        if (this.horizontalLayout) {
            fig.geq(fig.minus(g2.x0(), g1.x1()), fig.times(0.25, fig.plus(g1.w(), g2.w()))).changeCost(this.cost * this.gravity)
        } else {
            new Loss(fig, new Minus(g1.y(), g2.y())).changeCost(this.cost * this.gravity)
            // fig.geq(fig.minus(g2.y0(), g1.y1()), fig.times(0.25, fig.plus(g1.h(), g2.h()))).changeCost(this.cost * this.gravity)
        }
        return this.edge(g1, g2)
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

return Graph

}()
