Constrain.Trees = function() {

    const DEBUG = false;
    // A mutable, ordered set of edges [src, dst]
    class Edges {
        constructor(oldEdges) {
            if (arguments.length == 0) {
                this.edges = []
            } else {
                this.edges = new Array(...oldEdges.edges)
            }
        }
        // Add edge [n1, n2] at position i among the children of n1, or as the last child
        // if i is not specified.
        addEdge(n1, n2, i) {
            if (i === undefined) {
                this.edges.push([n1, n2])
            } else {
                let seen = 0
                for (let j = 0; j < this.edges.length; j++) {
                    if (seen == i) {
                        this.edges.splice(j, 0, [n1, n2])
                        break
                    }
                    if (this.edges[j][0] == n1) seen++
                }
            }
            delete this.outgoing
            return this
        }
        // insert the edge [n1,n2] immediately before the edge [n3,n4]
        insertBefore(n1, n2, n3, n4) {
            const edges = this.edges
            for (let i = 0; i < edges.length; i++) {
                let [src, dst] = edges[i]
                if (src == n3 && dst == n4) {
                    edges.splice(i, 0, [n1, n2])
                    delete this.outgoing
                    return
                }
            }
            console.error("failed to find an edge to insert before")
        }

        // insert edge [n1,n2] immediately after the edge [n3,n4]
        insertAfter(n1, n2, n3, n4) {
            const edges = this.edges
            for (let i = 0; i < edges.length; i++) {
                let [src, dst] = edges[i]
                if (src == n3 && dst == n4) {
                    edges.splice(i+1, 0, [n1, n2])
                    return
                }
            }
            console.error("failed to find an edge to insert before")
        }

        // replace edge [n3, n4] with [n1, n2]
        replaceEdge(n1, n2, n3, n4) {
            const edges = this.edges
            for (let i = 0; i < edges.length; i++) {
                let [src, dst] = edges[i]
                if (src == n3 && dst == n4) {
                    edges[i] = [n1, n2]
                    return
                }
            }
        }
        // The parent of this node. If there is more than
        // one predecessor, the earliest one in the list is
        // returned.
        getParentNode(node) {
            for (const e of this.getEdges()) {
                let [src, dst] = e
                if (dst == node) return src
            }
        }
        // The children of this node, in order
        getChildren(node) {
            const result = []
            for (const e of this.getEdges()) {
                let [src, dst] = e
                if (src == node) result.push(dst)
            }
            return result
            
        }
        // Return the index of a node with respect to its parents.
        // The indices of child nodes start from 0.
        childIndex(node, parentNode) {
            let seen = 0
            for (const e of this.getEdges()) {
                const [src, dst] = e
                if (src == parentNode) {
                    if (dst == node) return seen
                    seen++
                }
            }
            return -1;
        }
        // Child node n of `node`, or null if none such
        nthChild(node, n) {
            let seen = 0
            for (const e of this.getEdges()) {
                const [src, dst] = e
                if (src == node) {
                    if (seen == n) return dst
                    seen++
                }
            }
            return null
        }
        // The leftmost descendant of this node
        leftmostDescendant(node) {
            const outgoing = this.getOutgoing(node)
            if (outgoing.length == 0) return node
            return this.leftmostDescendant(outgoing[0])
        }
        // The rightmost descendant of this node
        rightmostDescendant(node) {
            const outgoing = this.getOutgoing(node)
            if (outgoing.length == 0) return node
            return this.rightmostDescendant(outgoing[outgoing.length - 1])
        }
        deepestDescendants(node) {
            const outgoing = this.getOutgoing(node)
            let best = [node], depth = 0
            for (const c of outgoing) {
                const [ns, d] = this.deepestDescendants(c)
                if (d+1 > depth) {
                    depth = d+1
                    best = ns
                } else if (d+1 == depth) {
                    best = best.concat(ns)
                }
            }
            return [best, depth]
        }
        getEdges() {
            return this.edges
        }
        [Symbol.iterator]() {
            return this.edges[Symbol.iterator]()
        }

        // array of destination nodes for outgoing edges from n.
        // Do not mutate.
        getOutgoing(n) {
            this.buildOutgoing()
            return this.outgoing.get(n) || []
        }
        addEdges(...a) {
            for (const e of a) this.addEdge(e)
        }
        removeEdge(n1, n2) {
            const edges = this.edges
            delete this.outgoing
            for (let i = 0; i < edges.length; i++) {
                let [src, dst] = edges[i]
                if (n1 == src && n2 == dst) {
                    edges.splice(i, 1)
                    return
                }
            }
        }
        buildOutgoing() {
            if (this.outgoing) return
            this.outgoing = new Map()
            for (const e of this.edges) {
                let [src, dst] = e
                let a = this.outgoing.get(src)
                if (!a) {
                    a = []
                    this.outgoing.set(src, a)
                }
                a.push(dst)
            }
        }
    }

    class Node {
        constructor(tree, value) {
            this.value = value
            // A node is associated with a particular graphical object
            this.gobj = tree.style.drawNode(tree.figure, value)
            // this.positions.get(f) is an object that describes the position of this node
            // in frame i, as well as the animation plan for how to get 
            this.positions = new Map()
        }

        // Descendant node with value v or null if no such node exists.
        findNode(edges, v) {
            if (v == this.value) return this
            const outgoing = edges.outgoing.get(this) || []
            for (const c of outgoing) {
                const result = c.findNode(edges, v)
                if (result) return result
            }
            return null
        }
        getValue() {
            return this.value
        }
        graphic() {
            return this.gobj
        }
        toString() {
            return "Node(" + this.value + ")"
        }
    }

    // A TreeStyle encapsulates choices about how trees are graphically rendered
    class TreeStyle {
        // Create a graphical object representing the tree node
        drawNode(figure, obj) { return obj ? obj : figure.point() }

        // Create a graphical object representing the edge from node n1 to node n2
        drawEdge(figure, n1, n2) { return figure.connector(n1.gobj, n2.gobj) }

        // Optionally create some graphical objects indicating that n is the
        // root node. They are not included in the tree's bounding box
        decorateRoot(figure, n) {}

        // Amount of glue space to insert on either side of the tree, which is
        // weakly set equal to 0. The default implementation is that there is no glue.
        glue(figure) { return 0 }
    }

    // An AnimatedTree is a tree of nodes that can be animated over
    // multiple frames in ways that change the structure of the tree.
    // Transitions between different structures are smoothly animated.
    // The tree is laid out vertically with the root at the top.
    class AnimatedTree extends Constrain.Box {
        // Create a tree with the given root and list of children. Children
        // may be arrays that recursively specify subtrees in the same way.
        // The conversion of the tree data into graphical objects is specified
        // by the style parameter, which is a TreeStyle. If 'null' is passed
        // as the tree style, the figure style provides the tree styling operations
        // instead.
        constructor(figure, style, root, ...children) {
            super(figure)
            const frame = this.currentFrame = figure.currentFrame
            if (style) {
                this.style = style
            } else {
                this.style = new TreeStyle(figure)
                if (figure.hasStyle('drawNode'))
                    this.style.drawNode = figure.getStyle('drawNode')
                if (figure.hasStyle('drawEdge'))
                    this.style.drawEdge = figure.getStyle('drawEdge')
                if (figure.hasStyle('decorateRoot'))
                    this.style.decorateRoot = figure.getStyle('decorateRoot')
                if (figure.hasStyle('glue'))
                    this.style.glue = figure.getStyle('glue')
            }
            this.vertSpacings = new Map()
            this.horzSpacings = new Map()
            this.roots = new Map()
            const rootNode = new Node(this, root)
            this.roots.set(frame, rootNode)
            // this.edges.get(i) is the edge structure of the graph in frame i
            this.edges = new Map()
            const edges = new Edges()
            this.edges.set(frame, edges)
            this.createNodes(frame, rootNode, ...children)
            this.constraints = new Map() // map from frames to arrays of constraints
            this.bbox = this
            this.frameConstraints(frame)
            this.deferConstraints = false // whether to defer generating constraints
        }
        render() {
            // no extra rendering required
        }
        // Create tree nodes and edges based on the specification node + children
        // edges are created in the specified frame.
        createNodes(frame, node, ...children) {
            if (arguments.length <= 1) return
            for (const c of children) {
                let cnode
                if (Array.isArray(c)) {
                    cnode = new Node(this, c[0])
                    this.createNodes(frame, cnode, ...(c.slice(1)))
                } else {
                    cnode = new Node(this, c)
                }
                this.addEdge(frame, node, cnode)
            }
        }
        // Add an edge from node n1 to node n2 in the specified frame
        addEdge(frame, n1, n2) {
            const edges = this.getFrameEdges(frame)
            edges.addEdge(n1, n2)
        }
        addConstraints(frame, ...constraints) {
            const a = this.constraints.get(frame)
            if (!a) this.constraints.set(frame, [])
            this.constraints.push(...constraints)
        }
        getFrameEdges(frame) {
            return this.edges.get(frame) || this.getFrameEdges(this.figure.prevFrame(frame))
        }
        getFrameRoot(frame) {
            return this.roots.get(frame) || this.getFrameRoot(this.figure.prevFrame(frame))
        }
        getFramePos(frame,  node) {
            const result = node.positions.get(frame) 
            if (result) return result
            const pf = this.figure.prevFrame(frame)
            return pf && pf !== frame && this.getFramePos(this.figure.prevFrame(frame), node)
        }
        // Set up the constraints and connectors for this node in the given frame,
        // assuming the specified edges exist in the frame.
        frameNodeConstraints(frame, node, edges, horzSpacing, vertSpacing) {
            let prev = null, prev_sib = null
            const constraints = this.constraints.get(frame)
            const f = this.figure
            constraints || console.error("No constraints for " + frame)
            if (node.positions && node.positions.get(frame)) {
                console.error("cycle detected")
                return
            }
            let pos = f.point()
            node.positions.set(frame, pos)
            const outgoing = edges.getOutgoing(node) || []
            // console.log("outgoing from " + node.value + ":" + outgoing.map(n => n.value).join(","))
            for (const c of outgoing) {
                this.frameNodeConstraints(frame, c, edges, horzSpacing, vertSpacing)
                const cpos = c.positions.get(frame)
                if (c.value !== undefined) {
                    if (DEBUG)
                      this.inclusiveAfters.add(f.after(frame,
                        f.connector(pos, cpos).setStrokeStyle("#acf").setLineDash([3,3])
                      ))
                    const a = f.after(frame, this.style.drawEdge(f, node, c))
                    a.description = "Connecting in frame " + frame.index + " parent " + node.value + " to child " + c.value
                    // console.log(a.description)
                    this.exclusiveAfters.add(a)
                }

                const vconstr = f.after(frame,
                    f.equal(f.minus(cpos.y(), pos.y()), vertSpacing))
                vconstr.description = 'vertical separation of ' + node.value + ' and ' + c.value
                constraints.push(vconstr)
                this.inclusiveAfters.add(vconstr)
                if (prev_sib) {
                    const sib_rightmost = edges.rightmostDescendant(prev_sib),
                          c_leftmost =  edges.leftmostDescendant(c)
                          // console.log("because of siblings " + prev_sib + " and " + c + ", separating " + sib_rightmost.value + " and "  + c_leftmost.value)
                    const hconstr = f.after(frame,
                        f.equal(f.minus(c_leftmost.positions.get(frame).x(),
                                                  sib_rightmost.positions.get(frame).x()),
                                     f.plus(f.times(0.5, sib_rightmost.gobj.w()),
                                                 f.times(0.5, c_leftmost.gobj.w()),
                                                 horzSpacing)))
                    hconstr.description = 'Horizontal spacing of children of ' + node.value
                    constraints.push(hconstr)
                    this.inclusiveAfters.add(hconstr)
                }
                prev_sib = c
            }
            switch (outgoing.length) {
                case 0: break
                case 1: constraints.push(f.equal(pos.x(), outgoing[0].positions.get(frame).x()))
                        // console.log("frame " + frame.index + ": stacking " + node.value + " on " + outgoing[0].value)
                        break
                default:
                     constraints.push(f.equal(pos.x(),
                         f.average(outgoing[0].positions.get(frame).x(),
                                 outgoing[outgoing.length-1].positions.get(frame).x())))
            }
            /*
                const r = f.rectangle().at(obj_group).setStrokeStyle("orange").setFillStyle(null)
                f.sameSize(r, obj_group)
            */
            constraints.push(...f.align("none", "center",
                                    ...outgoing.map(c => c.positions.get(frame))))

            const pf = f.prevFrame(frame),
                  prevpos = pf && this.getFramePos(pf, node),
                  gobj = node.gobj,
                  target = gobj.target(),
                  gobj_constrs = prevpos
                    ? f.after(frame, f.equal(target, f.smooth(frame, prevpos, pos)))
                    : f.after(frame, f.equal(target, pos))
            for (const a of [gobj_constrs]) {
                this.exclusiveAfters.add(a)
                constraints.push(a)
            }
        }
        // copy edges from the previous frame to this frame
        copyEdges(frame) {
            const prevEdges = this.getFrameEdges(frame),
                  newEdges = new Edges(prevEdges)
            this.edges.set(frame, newEdges)
        }
        // Make the animation for this frame be swapping this node with its parent
        swapNodeWithParent(frame, node) {
            const prevEdges = this.getFrameEdges(frame),
                  newEdges = new Edges(prevEdges)
            if (!prevEdges) {
                console.error("No tree configuration for previous frame")
            }
            let parentNode
            const oldRoot = this.getFrameRoot(frame)
            parentNode = prevEdges.getParentNode(node)
            for (const e of prevEdges.getEdges()) {
                let [src, dst] = e
                if (src == parentNode && dst != node) {
                    newEdges.replaceEdge(node, dst, src, dst)
                } else if (dst == node && src != parentNode) {
                    newEdges.replaceEdge(src, parentNode, src, dst)
                } else if (src == node) {
                    newEdges.replaceEdge(parentNode, dst, src, dst)
                } else if (dst == parentNode) {
                    newEdges.replaceEdge(src, node, src, dst)
                }
            }
            newEdges.replaceEdge(node, parentNode, parentNode, node)
            this.edges.set(frame, newEdges)
            this.roots.set(frame, oldRoot == parentNode ? node : oldRoot)
            if (!this.deferConstraints) this.frameConstraints(frame)
        }
        emptyLeaf() {
            return new Node(this, undefined)
        }
        rotateNodeWithParent(frame, node) {
        //        gp          gp
        //         |           |
        //         p    R      n
        //        / \  ---→   / \
        //       n   c ←---  a   p
        //      / \      L      / \
        //      a  b           b   c
            const prevEdges = this.getFrameEdges(frame),
                  newEdges = new Edges(prevEdges)
            if (!prevEdges) {
                console.error("No tree configuration for previous frame")
            }
            const oldRoot = this.getFrameRoot(frame),
                  parentNode = prevEdges.getParentNode(node)
            if (!parentNode) return
            const gparentNode = prevEdges.getParentNode(parentNode),
                  rightRotate = (prevEdges.childIndex(node, parentNode) == 0)
            if (rightRotate) {
                const b = prevEdges.nthChild(node, 1)
                if (b) {
                    newEdges.replaceEdge(node, parentNode, node, b)
                    newEdges.replaceEdge(parentNode, b, parentNode, node)
                } else { // leaf
                    newEdges.addEdge(node, this.emptyLeaf())
                    newEdges.addEdge(node, parentNode)
                    newEdges.replaceEdge(parentNode, this.emptyLeaf(), parentNode, node)
                }
            } else {
                const b = prevEdges.nthChild(node, 0)
                if (b) {
                    newEdges.replaceEdge(parentNode, b, parentNode, node)
                    newEdges.replaceEdge(node, parentNode, node, b)
                } else {
                    newEdges.addEdge(node, parentNode)
                    newEdges.addEdge(node, this.emptyLeaf())
                    newEdges.replaceEdge(parentNode, this.emptyLeaf(), parentNode, node)
                }
            }
            if (gparentNode) {
                newEdges.replaceEdge(gparentNode, node, gparentNode, parentNode)
            }
            this.edges.set(frame, newEdges)
            this.roots.set(frame, oldRoot == parentNode ? node : oldRoot)
            if (!this.deferConstraints) this.frameConstraints(frame)
        }
        // In the specified frame, remove the leaf node `node`. If node2 is provided
        // replace with that node.
        removeLeaf(frame, node, node2) {
            const prevEdges = this.getFrameEdges(frame),
                  newEdges = new Edges(prevEdges),
                  oldRoot = this.getFrameRoot(frame)
            const parent = prevEdges.getParentNode(node)
            if (node2) {
                newEdges.replaceEdge(parent, node2, parent, node)
            } else {
                newEdges.removeEdge(parent, node)
            }
            this.edges.set(frame, newEdges)
            this.roots.set(frame, oldRoot)
            if (!this.deferConstraints) this.frameConstraints(frame)
        }
        // In the specified frame, create a new leaf node containing value at
        // the given position in the children of the given parent node.
        // Children at that position or later have their position increased. If
        // position is omitted, the new leaf is added as the last child.
        addLeaf(frame, value, parentNode, position) {
            const prevEdges = this.getFrameEdges(frame),
                  newEdges = new Edges(prevEdges)
            const node = new Node(this, value)
            this.figure.after(frame, node.gobj).description = 'Graphical object for added leaf ' + value
            newEdges.addEdge(parentNode, node, position)
            this.edges.set(frame, newEdges)
            if (!this.deferConstraints) this.frameConstraints(frame)
        }
        spliceNode(frame, node) {
            const prevEdges = this.getFrameEdges(frame),
                  newEdges = new Edges(prevEdges),
                  parentNode = prevEdges.getParentNode(node),
                  children = prevEdges.getChildren(node)
            newEdges.replaceEdge(parentNode, children[0], parentNode, node)
            this.edges.set(frame, newEdges)
            if (!this.deferConstraints) this.frameConstraints(frame)
        }
        frameConstraints(frame) {
            const f = this.figure
            if (this.constraints.get(frame)) {
                console.error("Oops, already have constraints for frame " + frame)
            }
            this.deferConstraints = false
            // Make all current tree constraints end either before this frame
            // starts or on this frame, depending on whether they are graphical
            // constraints or geometric ones.
            if (this.exclusiveAfters) this.exclusiveAfters.forEach(a => a.endBefore(frame))
            if (this.inclusiveAfters) this.inclusiveAfters.forEach(a => a.endWith(frame))
            this.exclusiveAfters = new Set()
            this.inclusiveAfters = new Set()

            // Now set up constraints for this frame
            const constraints = []
            const edges = this.edges.get(frame)
            const root = this.getFrameRoot(frame),
                  lchild = edges.leftmostDescendant(root),
                  rchild = edges.rightmostDescendant(root)

            // console.log('deepest descendants in frame ' + frame.index + ' at depth ' + depth,  ddescendants)
            this.constraints.set(frame, constraints)
            const horzSpacing = f.variable("horzSpacing" + frame.index),
                  vertSpacing = f.variable("vertSpacing" + frame.index)
            this.horzSpacings.set(frame, horzSpacing)
            this.vertSpacings.set(frame, vertSpacing)
            f.after(frame,
                f.geq(horzSpacing, 0),
                f.geq(vertSpacing, 0))
              .forEach(a => this.inclusiveAfters.add(a))
            this.frameNodeConstraints(frame, root, edges, horzSpacing, vertSpacing)
            let rootpos = root.positions.get(frame)
            let top = f.plus(rootpos.y(), f.times(-0.5, root.gobj.h()))
            const decoration = this.style.decorateRoot(f, root)
            if (decoration) {
                const a = f.after(frame, decoration)
                a.description = 'Root decoration for ' + root.value
                this.exclusiveAfters.add(a)
                top = f.min(top, decoration.y0())
            }
            const glue = this.style.glue(),
                  [ddescendants, depth] = edges.deepestDescendants(root)

            const deepest = []
            ddescendants.forEach(c => {
                deepest.push(f.plus(c.positions.get(frame).y(), 
                                    f.minus(c.gobj.y1(), c.gobj.target().y())))
                if (DEBUG)
                  f.inFrame(frame,
                    f.circle().setW(5).setFillStyle("green").at(
                        c.positions.get(frame).x(),
                            f.plus(c.positions.get(frame).y(), f.minus(c.gobj.y1(), c.gobj.target().y()))))
            })
            const prevFrame = this.figure.prevFrame(frame)
            if (prevFrame) {
               const [pddescendants, pdepth] = this.getFrameEdges(prevFrame)
                                                .deepestDescendants(this.getFrameRoot(prevFrame))
               pddescendants.forEach(c =>  {
                  deepest.push(f.plus(this.getFramePos(frame, c).y(), 
                                    f.minus(c.gobj.y1(), c.gobj.target().y())))
                  if (DEBUG)
                    f.inFrame(frame,
                      f.circle().setW(5).setFillStyle("red").at(
                        c.positions.get(frame).x(),
                            f.plus(this.getFramePos(frame, c).y(), 
                                    f.minus(c.gobj.y1(), c.gobj.target().y()))))
               })
            }
            const bottom = f.max(...deepest)
            const bbox_constraints = f.after(frame,
                f.geq(glue, 0),
                f.equal(glue, 0).changeCost(0.001),
                f.equal(this.y0(), top),
                f.equal(f.plus(glue, this.x0()), f.minus(lchild.positions.get(frame).x(),
                                                        f.times(0.5, lchild.gobj.w()))),
                f.equal(f.minus(this.x1(), glue), f.plus(rchild.positions.get(frame).x(),
                                                        f.times(0.5, rchild.gobj.w()))),
                f.equal(this.y1(), bottom)
            )
            for (const a of bbox_constraints) {
                this.inclusiveAfters.add(a)
                constraints.push(a)
            }
        }
        findNode(v) {
            for (const frame of this.roots.keys()) {
                const result = this.getFrameRoot(frame)
                                 .findNode(this.getFrameEdges(frame), v)
                if (result) return result
            }
            return null
        }
        view(frame) {
            return new TreeView(this, frame)
        }
        addFrame(length, name) {
            return new TreeView(this,
                this.figure.addFrame(name || "tree_animation").setLength(length))
        }
    }

    // A view of an AnimatedTree in a particular sequence of frames
    class TreeView {
        constructor(tree, frame) {
            this.tree = tree
            this.frame = frame || tree.figure.currentFrame
        }
        // Swap the position of the node with this value and that of its parent.
        swapNodeWithParent(value) {
            this.tree.swapNodeWithParent(this.frame, this.tree.findNode(value))
        }
        // Perform a tree rotation to move the node with the specified value above
        // its current parent.
        rotateNodeWithParent(value) {
            this.tree.rotateNodeWithParent(this.frame, this.tree.findNode(value))
        }
        getEdges() {
            return this.tree.getFrameEdges(this.frame)
        }
        // Create a new leaf node containing value at the given position in the
        // children of the given parent node. Children at that position or later
        // have their position increased. If position is omitted, the new leaf
        // is added as the last child.
        addLeaf(value, parentValue, position) {
            this.tree.addLeaf(this.frame, value,
                              this.tree.findNode(parentValue), position)
        }
        // Remove the leaf node with this value.
        removeLeaf(value) {
            const node = this.tree.findNode(value)
            this.tree.removeLeaf(this.frame, node)
        }
        replaceLeaf(value1, value2) {
            const node = this.tree.findNode(value1)
            const node2 = new Node(this.tree, value2)
            this.tree.removeLeaf(this.frame, node, node2)
        }
        spliceNode(value) {
            const node = this.tree.findNode(value)
            this.tree.spliceNode(this.frame, node)
        }
        rootGraphic() {
            return this.tree.getFrameRoot(this.frame).gobj
        }
        rootPosition() {
            return this.tree.getFrameRoot(this.frame).positions(this.frame)
        }
        findNode(v) {
            return this.tree.findNode(v)
        }
        findGraphic(v) {
            return this.findNode(v).gobj
        }
    }
    Constrain.Figure.prototype.tree = function(style, ...args) {
        this.ensureFrame()
        return new AnimatedTree(this, style, ...args)
    }
    return {
        AnimatedTree,
        TreeView,
        TreeStyle,
        Node,
        Edges,
    }
}()
