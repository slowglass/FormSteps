class FootWeight {
    constructor(public value: number, public name: string, public code: string) { }
    public static readonly FLAT         = new FootWeight(0, "Flat",           "" );
    public static readonly HANGING_TOE =  new FootWeight(1, "Hanging (Toe)",  "T");
    public static readonly HANGING_HEAL = new FootWeight(2, "Hanging (Heal)", "H");
    public static readonly FLOATING =     new FootWeight(3, "Floating",       "F");

    static fromCode(c: string): FootWeight {
        switch (c) {
            case FootWeight.FLAT.code:         return FootWeight.FLAT;
            case FootWeight.HANGING_TOE.code:  return FootWeight.HANGING_TOE;
            case FootWeight.HANGING_HEAL.code: return FootWeight.HANGING_HEAL;
            case FootWeight.FLOATING.code:     return FootWeight.FLOATING;
        }
        return FootWeight.FLAT;
    }
};

class Foot {
    constructor(
        public readonly location: Point,
        public readonly angle: Direction,
        public readonly footWeight: FootWeight, 
        public readonly side: Side) {
    }

    static fromCode(str: string, side: any) : Foot {
        var arr = str.split(":");

        var location = Direction.fromCode(arr[0]).offset;
        var angle = Direction.fromCode(arr[1]);
        var footWeight = (arr.length > 2) ? FootWeight.fromCode(arr[2]) : FootWeight.FLAT;
        return new Foot(location, angle, footWeight, side);
    }

    move(str: string): Foot {
        if (str == null) return new Foot(this.location, this.angle, this.footWeight, this.side);

        var arr = str.split(":");
        var dirMoved = Direction.fromCode(arr[0]);
        var angle = ((arr.length > 1) && (arr[1].length > 0)) ? Direction.fromCode(arr[1]) : this.angle;
        var footWeight = ((arr.length > 2) && (arr[2].length > 0)) ? FootWeight.fromCode(arr[2]) : this.footWeight;
        var dist: number = (arr.length > 3) ? Number.parseFloat(arr[3]) : 1;

        var loc = new Point(this.location.x, this.location.y);
        
        if (dirMoved != Direction.NONE) {
            loc.x += (dirMoved.offset.x * dist);
            loc.y += (dirMoved.offset.y * dist);
        }

        return new Foot(loc, angle, footWeight, this.side);
    }

    
    display(svg: any, origin: Point, border: number, scale: number, style: any) {
        if (this.footWeight == FootWeight.FLOATING) return;

        var c: Point = Square.trans(this.location, origin, border, scale);

        var s = jQuery.extend({}, style);
        var sideOffset = (this.side == Side.LEFT) ? -3 : 3;
        s.stroke = (this.side == Side.LEFT) ? "red" : "blue";

        // Draw Toe
        s.fill = (this.footWeight == FootWeight.HANGING_TOE) ? "transparent" : s.stroke;
        s.transform = "translate(" + c.x + " " + c.y + ") rotate(" + this.angle.degrees + ") translate(" + sideOffset + " -3)";
        //svg.ellipse('', '', 3, 4, s);

        // Draw Heal
        s.fill = (this.footWeight == FootWeight.HANGING_HEAL) ? "transparent" : s.stroke;
        s.transform = "translate(" + c.x + " " + c.y + ") rotate(" + this.angle.degrees + ") translate(" + sideOffset + " 3)";
        //svg.ellipse('', '', 2, 3, s);
    }
}   
