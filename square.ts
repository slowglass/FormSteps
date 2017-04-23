class Square {
    static trans(p: Point, origin: Point, border: number, scale: number) {
        var x = border + (p.x - origin.x) * scale;
        var y = border + (p.y - origin.y) * scale;
        return new Point(x, y);
    }

    public readonly size: Dimension;
    public readonly label: string;

    constructor(
        public readonly bottomLeft: Point,
        public readonly topRight: Point) {
        
        if (this.bottomLeft.x == this.topRight.x) this.topRight.x = this.topRight.x+1;
        if (this.bottomLeft.y == this.topRight.y) this.bottomLeft.y = this.bottomLeft.y-1;

        this.size = new Dimension(this.topRight.x - this.bottomLeft.x, this.topRight.y - this.bottomLeft.y);
        this.label = "BL:" + this.bottomLeft.toString() + " TR:" + this.topRight.toString();
    }

    toString(): string { return this.label; }
};
