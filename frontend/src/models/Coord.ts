export class Coord {
    private readonly _row: number;
    private readonly _col: number;

    constructor(row: number, col: number) {
        this._row = row;
        this._col = col;
    }

    get row(): number {
        return this._row;
    }
    get col(): number {
        return this._col;
    }
    
    toString(): string {
        return `(${this._row}, ${this._col})`;
    }

    equals(other: Coord): boolean {
        return this._row === other._row && this._col === other._col;
    }
}