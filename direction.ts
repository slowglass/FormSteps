
class Direction {
    constructor(public value: number, public name: string, public code: string, public offset: Point, public degrees: number) { }

    public static readonly NONE =      new Direction(0, "None",      "",   new Point( 0, -1),   0);
    public static readonly NORTH =     new Direction(1, "North",     "N",  new Point( 0, -1),   0);
    public static readonly NORTHEAST = new Direction(2, "NorthEast", "NE", new Point( 1, -1),  45);
    public static readonly EAST =      new Direction(3, "East",      "E",  new Point( 1,  0),  90);
    public static readonly SOUTHEAST = new Direction(4, "SouthEast", "SE", new Point( 1,  1), 135);
    public static readonly SOUTH =     new Direction(5, "South",     "S",  new Point( 0,  1), 180);
    public static readonly SOUTHWEST = new Direction(6, "SouthWest", "SW", new Point(-1,  1), 225);
    public static readonly WEST =      new Direction(7, "West",      "W",  new Point(-1,  0), 270);
    public static readonly NORTHWEST = new Direction(8, "NorthWest", "NW", new Point(-1, -1), 315);
    static fromCode(c: string): Direction {
        switch (c) {
            case Direction.NORTH.code: return Direction.NORTH;
            case Direction.NORTHEAST.code: return Direction.NORTHEAST;
            case Direction.EAST.code: return Direction.EAST;
            case Direction.SOUTHEAST.code: return Direction.SOUTHEAST;
            case Direction.SOUTH.code: return Direction.SOUTH;
            case Direction.SOUTHWEST.code: return Direction.SOUTHWEST;
            case Direction.WEST.code: return Direction.WEST;
            case Direction.NORTHWEST.code: return Direction.NORTHWEST;
        }
        return Direction.NONE;
    }
};

class Side {
    constructor(public value: number, public name: string, public code: string) { }
    public static readonly LEFT =  new Side(0, "Left",  "L");
    public static readonly RIGHT = new Side(1, "Right", "R");
    static fromCode(c: string): Side {
        switch (c) {
            case Side.LEFT.code: return Side.LEFT;
            case Side.RIGHT.code: return Side.RIGHT;
        }
        return Side.LEFT;
    }
}

