Constrain.Trees = function() {
    // An ordered set of edges
    class Edges {
        constructor(oldEdges) {
            if (arguments.length == 0) {
                this.edges = []
            } else {
                this.edges = new Array(...oldEdges.edges)
            }
        }
        // Add edge at the end of the list
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
        // The nth child of this node, or null if none such
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
            this.buildOutgoing()
            const outgoing = this.getOutgoing(node)
            if (outgoing.length == 0) return node
            return this.leftmostDescendant(outgoing[0])
        }
        // The rightmost descendant of this node
        rightmostDescendant(node) {
            this.buildOutgoing()
            const outgoing = this.getOutgoing(node)
            if (outgoing.length == 0) return node
            return this.rightmostDescendant(outgoing[outgoing.length - 1])
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
            this.gobj = tree.mapper(value)
            // this.positions.get(f) is an object that describes the position of this node
            // in frame i, as well as the animation plan for how to get 
            this.positions = new Map()
            // this.groups.get(f) is the group of descendants of this node in frame i
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

    // An AnimatedTree is a tree of nodes that can be animated over
    // multiple frames in a way that changes the structure of the tree.
    class AnimatedTree {
        constructor(fig, mapper, root, ...children) {
            this.figure = fig
            const frame = fig.currentFrame
            this.mapper = mapper
            this.vertSpacing = fig.variable("vertSpacing")
            this.horzSpacing = fig.variable("horzSpacing")
            this.roots = new Map()
            const rootNode = new Node(this, root)
            this.roots.set(frame, rootNode)
            // this.edges.get(i) is the edge structure of the graph in frame i
            this.edges = new Map()
            const edges = new Edges()
            this.edges.set(frame, edges)
            this.createNodes(frame, rootNode, ...children)
            this.constraints = new Map() // map from frames to arrays of constraints
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
        frameNodeConstraints(frame, node, edges) {
            let prev = null, prev_sib = null
            const constraints = this.constraints.get(frame)
            constraints || console.error("No constraints for " + frame)
            if (node.positions.get(frame)) {
                console.error("cycle detected")
                return
            }
            let pos = this.figure.point()
            node.positions.set(frame, pos)
            const outgoing = edges.getOutgoing(node) || []
            // console.log("outgoing from " + node.value + ":" + outgoing.map(n => n.value).join(","))
            for (const c of outgoing) {
                this.frameNodeConstraints(frame, c, edges)
                const cgroup = c.groups.get(frame),
                      cpos = c.positions.get(frame)
                if (c.value !== undefined)
                this.figure.inFrame(frame,
                    this.figure.connector(node.gobj, c.gobj)
                )

                constraints.push(this.figure.geq(this.vertSpacing, 0),
                                 this.figure.geq(this.horzSpacing, 0),
                                 this.figure.equal(this.figure.minus(cpos.y(), pos.y()), this.vertSpacing))
                if (prev_sib) {
                    const sib_rightmost = edges.rightmostDescendant(prev_sib),
                          c_leftmost =  edges.leftmostDescendant(c)
                          // console.log("because of siblings " + prev_sib + " and " + c + ", separating " + sib_rightmost.value + " and "  + c_leftmost.value)
                    constraints.push(
                        this.figure.equal(this.figure.minus(c_leftmost.positions.get(frame).x(),
                                    sib_rightmost.positions.get(frame).x()),
                              this.figure.plus(this.figure.times(0.5, sib_rightmost.gobj.w()),
                                   this.figure.times(0.5, c_leftmost.gobj.w()),
                                   this.horzSpacing)))
                }
                prev_sib = c
            }
            const node_group = outgoing.map(n => n.groups.get(frame))
            node_group.push(node.gobj)
            switch (outgoing.length) {
                case 0: break
                case 1: constraints.push(equal(pos.x(), outgoing[0].positions.get(frame).x()))
                        // console.log("frame " + frame.index + ": stacking " + node.value + " on " + outgoing[0].value)
                        break
                default:
                     constraints.push(this.figure.equal(pos.x(),
                         this.figure.average(outgoing[0].positions.get(frame).x(),
                                 outgoing[outgoing.length-1].positions.get(frame).x())))
            }
            node.groups.set(frame, this.figure.group(...node_group))
            constraints.push(...this.figure.align("distribute", "center",
                                    ...outgoing.map(c => c.positions.get(frame))))

            const pf = this.figure.prevFrame(frame),
                  prevpos = pf && node.positions.get(pf)
            if (prevpos) {
                // interpolate position between two positions XXX need more options here
                constraints.push(this.figure.inFrame(frame,
                    this.figure.equal(node.gobj.x(), this.figure.smooth(frame, prevpos.x(), pos.x())),
                    this.figure.equal(node.gobj.y(), this.figure.smooth(frame, prevpos.y(), pos.y()))))
            } else {
                // first frame: just set the position
                constraints.push(this.figure.inFrame(frame, this.figure.equal(node.gobj.x(), pos.x())))
                constraints.push(this.figure.inFrame(frame, this.figure.equal(node.gobj.y(), pos.y())))
            }
        }

        
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
            const oldRoot = this.roots.get(prevFrame)
            const parentNode = prevEdges.getParentNode(node)
            if (!parentNode) return
            const gparentNode = prevEdges.getParentNode(parentNode)
            const rightRotate = (prevEdges.childIndex(node, parentNode) == 0)
            if (rightRotate) {
                const b = prevEdges.nthChild(node, 1)
                newEdges.replaceEdge(node, parentNode, node, b)
                newEdges.replaceEdge(parentNode, b, parentNode, node)
            } else {
                const b = prevEdges.nthChild(node, 0)
                newEdges.replaceEdge(parentNode, b, parentNode, node)
                newEdges.replaceEdge(node, parentNode, node, b)
            }
            if (gparentNode) {
                newEdges.replaceEdge(gparentNode, node, gparentNode, parentNode)
            }
            this.edges.set(frame, newEdges)
            this.roots.set(frame, oldRoot == parentNode ? node : oldRoot)
            this.frameConstraints(frame)
        }
        frameConstraints(frame) {
            console.log("Setting up constraints for frame " + frame)
            if (this.constraints.get(frame)) {
                console.error("Oops, already have constraints for frame " + frame)
            }
            const constraints = []
            this.constraints.set(frame, constraints)
            this.frameNodeConstraints(frame, this.roots.get(frame), this.edges.get(frame))
        }
        findNode(v) {
            for (const frame of this.roots.keys()) {
                const result = this.roots.get(frame)
                                 .findNode(this.edges.get(frame), v)
                if (result) return result
            }
            return null
        }
        allFramesGroup() {
            const groups = new Set()
            for (const frame of this.roots.keys()) {
                const root = this.roots.get(frame)
                const group = root.groups.get(frame)
                groups.add(group)
            }

            return group(...groups)
        }
        view(frame) {
            return new TreeView(this, frame)
        }
        addFrame(length, name) {
            return new TreeView(this, this.figure.addFrame(name || "tree_animation").setLength(length))
        }
    }

    // A view of an AnimatedTree in a particular frame
    class TreeView {
        constructor(tree, frame) {
            this.tree = tree
            this.frame = frame
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
            this.tree.addleaf(this.frame, this.tree.findnode(value),
                                this.tree.findnode(parentvalue))
        }
    }
    Constrain.Figure.prototype.tree = function(mapper, ...args) {
        this.ensureFrame()
        return new AnimatedTree(this, mapper, ...args)
    }
    return {
        AnimatedTree,
        TreeView,
        Node,
        Edges,
    }
}()
