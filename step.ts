class Step {
    private static usedSquares: Map<string, Square> = new Map<string, Square>();

    private static counter = 0;

    public readonly index: number;
    public readonly square: Square;

    constructor(
        public readonly name: string,
        public readonly desc: string,
        public readonly left: Foot,
        public readonly right: Foot) {
        this.index = (Step.counter++);


        var bl = Point.min(this.left.location, this.right.location);
        var tr = Point.max(this.left.location, this.right.location);
        var sq = new Square(bl, tr);
        if (Step.usedSquares.has(sq.label)) {
            this.square = Step.usedSquares.get(sq.label);
        } else {
            this.square = sq;
            Step.usedSquares.set(sq.label, sq);
        }  
    }

    move(name: string, desc: string, left: string, right: string): Step {
        if (name == null) name = this.name;
        return new Step(name, desc, this.left.move(left), this.right.move(right));
    }
    /*
    display(svg: any, origin: Point, border: number, scale: number, style: any) {
        var bl: Point = Square.trans(this.bottomLeft, origin, border, scale);
        var tr: Point = Square.trans(this.topRight, origin, border, scale);
        //svg.rect(bl.x, bl.y, tr.x-bl.x, tr.y-bl.y, style);
    }

    displayStance(svg: any, origin: Point, border: number, scale: number, style: any) {
        var tL: Point = Square.trans(this.left.location, origin, border, scale);
        var tR: Point = Square.trans(this.right.location, origin, border, scale);

        //if (this.left.footWeight != FootWeight.FLOATING && this.right.footWeight != FootWeight.FLOATING)
        //    svg.line(tL.x, tL.y, tR.x, tR.y, style);

        this.left.display(svg, origin, border, scale, style);
        this.right.display(svg, origin, border, scale, style);
    }
    */
};
