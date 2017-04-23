class Point {
    constructor(public x: number, public y: number) { }
    clone(): Point {
        return new Point(this.x, this.y);
    }

    private static apply(fn: Function, p1: Point, p2: Point) : Point {
        return new Point(fn(p1.x, p2.x), fn(p1.y, p2.y));
    }

    private apply(fn: Function) {
        this.x = fn(this.x);
        this.y = fn(this.y);
    }

    public floor() { this.apply(Math.floor); }
    public ceil() { this.apply(Math.ceil); }

    public toString(): string { return "(" + this.x + "," + this.y + ")"; }
    static min(p1: Point, p2: Point): Point { return Point.apply(Math.min, p1, p2); }
    static max(p1: Point, p2: Point): Point { return Point.apply(Math.max, p1, p2); }
};

class Dimension extends Point {
    constructor(x: number, y: number) { super(x, y); }
    clone(): Dimension {
        return new Dimension(this.x, this.y);
    }
};
