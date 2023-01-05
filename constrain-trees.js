Constrain.Trees = function() {
    // A mutable, ordered set of edges [src, dst]
    class Edges {
        constructor(oldEdges) {
            if (arguments.length == 0) {
                this.edges = []
            } else {
                this.edges = new Array(...oldEdges.edges)
            }
        }
        // Add edge [n1, n2] at the end of the list
        addEdge(n1, n2) {
            this.edges.push([n1, n2])
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
                let [src, dst] = e
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
            this.gobj = tree.style.drawNode(value)
            // this.positions.get(f) is an object that describes the position of this node
            // in frame i, as well as the animation plan for how to get 
            this.positions = new Map()
            // this.groups.get(f) is the group of positions of descendants of this node in frame i
            this.groups = new Map()
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
        toString() {
            return "Node(" + this.value + ")"
        }
    }

    // A TreeStyle encapsulates choices about how trees are graphically rendered
    class TreeStyle {
        constructor(figure) {
            this.figure = figure
            if (!(figure instanceof Constrain.Figure)) {
                console.error("Not a figure")
            }
        }
        // Create a graphical object representing the tree node with value `info`
        drawNode(info) {
            return this.figure.label(info)
        }
        // Create a graphical object representing the edge from gobj1 to gobj2
        drawEdge(gobj1, gobj2) {
            return this.figure.connector(gobj1, gobj2)
        }
        // Optionally create some graphical objects indicating that gobj is the root node
        decorateRoot(gobj) {}
    }

    // An AnimatedTree is a tree of nodes that can be animated over
    // multiple frames in ways that change the structure of the tree.
    // Transitions between different structures are smoothly animated.
    // The tree is laid out vertically with the root at the top.
    class AnimatedTree {
        constructor(figure, style, root, ...children) {
            this.figure = figure
            const frame = this.currentFrame = figure.currentFrame
            this.style = style
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
            this.style.decorateRoot(rootNode.gobj)
            this.constraints = new Map() // map from frames to arrays of constraints
            this.bbox = figure.box()
            this.frameConstraints(frame)
        }
        // Create tree nodes and edges based on the specification node + children
        // edges are created in the specified frame.
        createNodes(frame, node, ...children) {
            const child_group = []
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
            // child_group.push(cnode.group)
            // this[children.length-1] = cnode
        }
        // Add an edge from node n1 to node n2 in the specified frame
        addEdge(frame, n1, n2) {
            const edges = this.edges.get(frame)
            edges.addEdge(n1, n2)
        }
        addConstraints(frame, ...constraints) {
            const a = this.constraints.get(frame)
            if (!a) this.constraints.set(frame, [])
            this.constraints.push(...constraints)
        }
        // Set up the constraints and connectors for this node in the given frame,
        // assuming the specified edges exist in the frame.
        frameNodeConstraints(frame, node, edges, horzSpacing, vertSpacing) {
            let prev = null, prev_sib = null
            const constraints = this.constraints.get(frame)
            const figure = this.figure
            constraints || console.error("No constraints for " + frame)
            if (node.positions.get(frame)) {
                console.error("cycle detected")
                return
            }
            let pos = figure.point()
            // const cols = [ '#00f', '#f00', '#0f0', '#f0f', '#0ff']
            // figure.circle().setW(5).at(pos).setFillStyle(cols[frame.index])
            node.positions.set(frame, pos)
            const outgoing = edges.getOutgoing(node) || []
            // console.log("outgoing from " + node.value + ":" + outgoing.map(n => n.value).join(","))
            for (const c of outgoing) {
                this.frameNodeConstraints(frame, c, edges, horzSpacing, vertSpacing)
                const cgroup = c.groups.get(frame),
                      cpos = c.positions.get(frame)
                if (c.value !== undefined) {
                    /*
                    this.exclusiveAfters.add(figure.after(frame,
                        figure.connector(pos, cpos).setStrokeStyle("#acf").setLineDash([3,3]))
                    )
                    */
                    const a = figure.after(frame, this.style.drawEdge(node.gobj, c.gobj))
                    a.description = "Connecting in frame " + frame.index + " parent " + node.value + " to child " + c.value
                    this.exclusiveAfters.add(a)
                }

                const vconstr = figure.after(frame,
                    figure.equal(figure.minus(cpos.y(), pos.y()), vertSpacing))
                constraints.push(vconstr)
                this.inclusiveAfters.add(vconstr)
                if (prev_sib) {
                    const sib_rightmost = edges.rightmostDescendant(prev_sib),
                          c_leftmost =  edges.leftmostDescendant(c)
                          // console.log("because of siblings " + prev_sib + " and " + c + ", separating " + sib_rightmost.value + " and "  + c_leftmost.value)
                    const hconstr = figure.after(frame,
                        figure.equal(figure.minus(c_leftmost.positions.get(frame).x(),
                                    sib_rightmost.positions.get(frame).x()),
                              figure.plus(figure.times(0.5, sib_rightmost.gobj.w()),
                                   figure.times(0.5, c_leftmost.gobj.w()),
                                   horzSpacing)))
                    constraints.push(hconstr)
                    this.inclusiveAfters.add(hconstr)
                }
                prev_sib = c
            }
            const node_group = outgoing.map(n => n.groups.get(frame))
            node_group.push(node.gobj)
            switch (outgoing.length) {
                case 0: break
                case 1: constraints.push(figure.equal(pos.x(), outgoing[0].positions.get(frame).x()))
                        // console.log("frame " + frame.index + ": stacking " + node.value + " on " + outgoing[0].value)
                        break
                default:
                     constraints.push(figure.equal(pos.x(),
                         figure.average(outgoing[0].positions.get(frame).x(),
                                 outgoing[outgoing.length-1].positions.get(frame).x())))
            }
            node.groups.set(frame, figure.group(...node_group))
            constraints.push(...figure.align("distribute", "center",
                                    ...outgoing.map(c => c.positions.get(frame))))

            const pf = figure.prevFrame(frame),
                  prevpos = pf && node.positions.get(pf)
            const gobj_constrs = prevpos
              ? figure.after(frame,
                    figure.equal(node.gobj.x(), figure.smooth(frame, prevpos.x(), pos.x())),
                    figure.equal(node.gobj.y(), figure.smooth(frame, prevpos.y(), pos.y())))
              : figure.after(frame, 
                    figure.equal(node.gobj.x(), pos.x()),
                    figure.equal(node.gobj.y(), pos.y()))
            for (const a of gobj_constrs) {
                this.exclusiveAfters.add(a)
                constraints.push(a)
            }
        }
        // copy edges from the previous frame to this frame
        copyEdges(frame) {
            const prevFrame = this.figure.prevFrame(frame),
                  prevEdges = this.edges.get(prevFrame),
                  newEdges = new Edges(prevEdges)
            this.edges.set(frame, newEdges)
        }
        // Make the animation for this frame be swapping this node with its parent
        swapNodeWithParent(frame, node) {
            const prevFrame = this.figure.prevFrame(frame),
                  prevEdges = this.edges.get(prevFrame),
                  newEdges = new Edges(prevEdges)
            if (!prevEdges) {
                console.error("No tree configuration for previous frame")
            }
            let parentNode
            const oldRoot = this.roots.get(prevFrame)
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
            this.frameConstraints(frame)
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
            const prevFrame = this.figure.prevFrame(frame),
                  prevEdges = this.edges.get(prevFrame),
                  newEdges = new Edges(prevEdges)
            if (!prevEdges) {
                console.error("No tree configuration for previous frame")
            }
            const oldRoot = this.roots.get(prevFrame),
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
            this.frameConstraints(frame)
        }
        glue() {
            return 0
        }
        frameConstraints(frame) {
            const figure = this.figure
            console.log("Setting up constraints for frame " + frame)
            if (this.constraints.get(frame)) {
                console.error("Oops, already have constraints for frame " + frame)
            }
            // Make all current tree constraints end either before this frame
            // starts or on this frame, depending on whether they are graphical
            // constraints or geometric ones.
            if (this.exclusiveAfters) this.exclusiveAfters.forEach(a => {
                a.endBefore(frame)
            })
            if (this.inclusiveAfters) this.inclusiveAfters.forEach(a => {
                a.endWith(frame)
            })
            this.exclusiveAfters = new Set()
            this.inclusiveAfters = new Set()

            // Now set up constraints for this frame
            const constraints = []
            const edges = this.edges.get(frame)
            const root = this.roots.get(frame),
                  lchild = edges.leftmostDescendant(root),
                  rchild = edges.rightmostDescendant(root),
                  [dchildren, depth] = edges.deepestDescendants(root)
            this.constraints.set(frame, constraints)
            const horzSpacing = figure.variable("horzSpacing" + frame.index),
                  vertSpacing = figure.variable("vertSpacing" + frame.index)
            this.horzSpacings.set(frame, horzSpacing)
            this.vertSpacings.set(frame, vertSpacing)
            figure.after(frame,
                figure.geq(horzSpacing, 0),
                figure.geq(vertSpacing, 0)).forEach(a => 
                    this.inclusiveAfters.add(a)
                )
            this.frameNodeConstraints(frame, root, edges, horzSpacing, vertSpacing)
            //const prevFrame = figure.prevFrame(frame) || frame
            const glue = this.glue()
            const bbox_constraints = // figure.after(prevFrame, 
            [
                figure.geq(glue, 0),
                figure.equal(glue, 0).changeCost(0.001),
                figure.equal(this.bbox.y0(), figure.plus(root.positions.get(frame).y(), figure.times(-0.5, root.gobj.h()))),
                figure.equal(figure.plus(glue, this.bbox.x0()), figure.minus(lchild.positions.get(frame).x(),
                                                        figure.times(0.5, lchild.gobj.w()))),
                figure.equal(figure.minus(this.bbox.x1(), glue), figure.plus(rchild.positions.get(frame).x(),
                                                        figure.times(0.5, rchild.gobj.w()))),
                figure.equal(this.bbox.y1(), 
                    figure.max(...dchildren.map(c =>
                        figure.plus(c.positions.get(frame).y(), 
                                    figure.times(0.5, c.gobj.h())))))
            ]
/*
            )
            for (const a of bbox_constraints) {
                this.exclusiveAfters.add(a)
                constraints.push(a)
            }
*/

        }
        findNode(v) {
            for (const frame of this.roots.keys()) {
                const result = this.roots.get(frame)
                                 .findNode(this.edges.get(frame), v)
                if (result) return result
            }
            return null
        }
        view(frame) {
            return new TreeView(this, frame)
        }
        addFrame(length, name) {
            return new TreeView(this, this.figure.addFrame(name || "tree_animation").setLength(length))
        }
    }

    // A view of an AnimatedTree in a particular sequence of frames
    class TreeView {
        constructor(tree, frame) {
            this.tree = tree
            this.frame = frame || tree.figure.currentFrame
        }
        swapNodeWithParent(value) {
            this.tree.swapNodeWithParent(this.frame, this.tree.findNode(value))
        }
        rotateNodeWithParent(value) {
            this.tree.rotateNodeWithParent(this.frame, this.tree.findNode(value))
        }
        getEdges() {
            return this.tree.getEdges(this.frame)
        }
        addLeaf(value, parentValue) {
            this.tree.addLeaf(this.frame, this.tree.findnode(value),
                                this.tree.findnode(parentvalue))
        }
        rootGraphicalObject() {
            return this.tree.roots.get(this.frame).gobj
        }
        rootPosition() {
            return this.tree.roots.get(this.frame).positions(this.frame)
        }
        findNode(n) {
            return this.tree.findNode(n)
        }
        findNodeObj(n) {
            return this.findNode(n).gobj
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
