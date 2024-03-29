// Skrivet av Sabrina

// Enable double clicking from the Macintosh Finder or the Windows Explorer
#target illustrator



// Utility

function getRandomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}

function getRandomArrayElement(array) {
    return array[getRandomInt(0, array.length)];
}

function getRandomWeightedIndex(table) {
    var sum = 0;
    for (var i = 0; i < table.length; i++) {
        sum += table[i];
    }

    var random = Math.random() * sum;
    for (var index = 0; index < table.length; index++) {
        if (random < table[index]) {
            return index;
        }
        random -= table[index];
    }

    return -1;
}

function makeColorObject(color) {
    var colorObject;
    if (color.r != undefined || color.g != undefined || color.b != undefined) {
        colorObject = new RGBColor();
        colorObject.red = color.r || 0;
        colorObject.green = color.g || 0;
        colorObject.blue = color.b || 0;
    }
    else {
        colorObject = new CMYKColor();
        colorObject.cyan = color.c || 0;
        colorObject.magenta = color.m || 0;
        colorObject.yellow = color.y || 0;
        colorObject.black = color.k || 0;
    }
    return colorObject;
}

// For debugging
function generateDistinctRGBColor(index) {
    var rgb = new RGBColor();
    rgb.red = ((index + 1) * 25) % 255;
    rgb.green = ((index + 1) * 75) % 255;
    rgb.blue = ((index + 1) * 115) % 255;
    return rgb;
}

function getArrayCount(array, value) {
    var count = 0;

    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) {
            count++;
        }
    }

    return count;
}

function getArrayMatchCount(array, matcher) {
    var count = 0;

    for (var i = 0; i < array.length; i++) {
        if (matcher(array[i])) {
            count++;
        }
    }

    return count;
}

function arrayContains(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) {
            return true;
        }
    }
    return false;
}

// Same as "arrayContains" but optimized to find values at the back of the array early.
function arrayContainsReverse(array, value) {
    for (var i = array.length - 1; i >= 0; i--) {
        if (array[i] == value) {
            return true;
        }
    }
    return false;
}



// Constants

const RGB_BLACK = { r: 0, g: 0, b: 0 };
const RGB_WHITE = { r: 255, g: 255, b: 255 };
const CMYK_WHITE = { c: 0, m: 0, y: 0, k: 0 };
const CMYK_BLACK = { c: 0, m: 0, y: 0, k: 100 };

// Enums

const ANCHOR_TOPLEFT = 1;
const ANCHOR_TOP = 2;
const ANCHOR_TOPRIGHT = 3;
const ANCHOR_LEFT = 4;
const ANCHOR_CENTER = 5;
const ANCHOR_RIGHT = 6;
const ANCHOR_BOTTOMLEFT = 7;
const ANCHOR_BOTTOM = 8;
const ANCHOR_BOTTOMRIGHT = 9;

const SHAPETYPE_RECTANGLE = 0x1;
const SHAPETYPE_ROUNDED_RECTANGLE = 0x2;
const SHAPETYPE_TRIANGLE = 0x4;
const SHAPETYPE_PARALLELLOGRAM = 0x8;
const SHAPETYPE_CIRCLE = 0x10;
const SHAPETYPE_ALL = 0xFFFFFFFF;
const SHAPETYPE_ALL_NO_RECTANGLE = SHAPETYPE_ALL ^ SHAPETYPE_RECTANGLE;

function GetEnumFlag(value, flag) {
    return (value & flag) == flag;
}

// Classes

// Classes do not work with the javascript version illustrator script is based on.
// Functions to imitate classes below.

// Point

function Point(x, y) {
    this.x = x;
    this.y = y;
}

// Grid

function Grid(width, height, unitSize) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.unitSize = unitSize;
    this.__content = new Array();
    this.__content[0] = 0; // The first element seems to get initialized to some arbitrary value by default.
    this.__left = 0;
    this.__right = width;
    this.__top = 0;
    this.__bottom = height;

    // Methods

    this.clone = function() {
        var theClone = new Grid(this.width, this.height, this.unitSize);
        var size = this.width * this.height;
        for (var i = 0; i < size; i++) {
            theClone.__content[i] = this.__content[i];
        }
        return theClone;
    }

    this.resize = function(width, height) {
        this.width = width;
        this.height = height;
        this.__right = width;
        this.__bottom = height;
        
        var oldContent = this.__content;
        this.__content = new Array();
        var size = width * height;
        for (var i = 0; i < size; i++) {
            this.__content[i] = oldContent[i];
        }
    };

    this.get = function (x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return -1;
        }
        return this.__content[x + y * this.width] || 0;
    };
    this.set = function(x, y, value) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return;
        }
        this.__content[x + y * this.width] = value;
    };

    this.setAll = function(value) {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                this.set(x, y, value);
            }
        }
    };

    this.setIndex = function(index, value) {
        this.__content[index] = value;
    };

    this.getGridWidth = function() {
        return this.width;
    };
    this.getGridHeight = function() {
        return this.height;
    };
    this.getUnitSize = function() {
        return this.unitSize;
    };

    this.contains = function(otherGrid) {
        return otherGrid.__left >= this.__left ||
                otherGrid.__right <= this.__right ||
                otherGrid.__top >= this.__top ||
                otherGrid.__bottom <= this.__bottom;
    };

    this.isRowOccupied = function(y, x, width) {
        for (var i = 0; i < width; i++) {
            if (this.get(x + i, y) != 0) {
                return true;
            }
        }
        return false;
    };
    this.isColumnOccupied = function(x, y, height) {
        for (var i = 0; i < height; i++) {
            if (this.get(x, y + i) != 0) {
                return true;
            }
        }
        return false;
    };
    
    // Returns a list of subgrids that contains the specified point.
    this.findSubgridsWithPoint = function(x, y) {
        var subgridList = new Array();

        // Start with 1x1 subgrid.
        var subgrid = new Subgrid(this, x, y, 1, 1);

        // Inflate height.
        subgrid.inflateVertical();

        //alert("Subgrid after vertical inflation -> [" + subgrid.x + ", " + subgrid.y + ", " + subgrid.width + ", " + subgrid.height + "]");

        var lastSavedSubgrid = null;

        while (subgrid.height > 0) {
            // Reset subgrid width to 1.
            subgrid.resizeHorizontal(x, 1);

            // Inflate width
            subgrid.inflateHorizontal();

            if (subgrid.hasValidCorner() && (lastSavedSubgrid == null || !lastSavedSubgrid.contains(subgrid))) {
                lastSavedSubgrid = subgrid.clone();
                subgridList.push(lastSavedSubgrid);
            }

            if (subgrid.y < y) {
                subgrid.resizeVertical(subgrid.y + 1, subgrid.height - 1);
            }
            else {
                subgrid.resizeVertical(subgrid.y, subgrid.height - 1);
            }
        }

        return subgridList;
    };
    
    this.makeBackground = function(layer, overflow) {
        overflow = overflow || 0;
        return layer.pathItems.rectangle(
            (this.getGridHeight() - (this.y - overflow)) * this.getUnitSize(),
            (this.x - overflow) * this.getUnitSize(),
            (this.width + overflow * 2) * this.getUnitSize(),
            (this.height + overflow * 2) * this.getUnitSize());
    };

    this.getRandomFittingShapeType = function(shapeType, shapeTable) {
        shapeType = shapeType || SHAPETYPE_ALL;

        var shapeTypes = new Array();
        var shapeWeights = new Array();
        var neighbours = this.getNeighbours();

        function isShapeType(shapeType) {
            var f = function(subgrid) {
                return subgrid.shapeType == shapeType;
            };
            return f;
        }

        for (var i = 0; i < shapeTable.length; i++) {
            var shapeData = shapeTable[i];
            if (GetEnumFlag(shapeType, shapeData.shapeType) && this.canBeShape(shapeData.shapeType)) {
                shapeTypes.push(shapeData.shapeType);
                shapeWeights.push(shapeData.weight * Math.pow(shapeData.repeatNeighbourMult, getArrayMatchCount(neighbours, isShapeType(shapeData.shapeType))));
            }
        }

        if (shapeTypes.length == 0) {
            return null;
        }

        var randomIndex = getRandomWeightedIndex(shapeWeights);

        if (randomIndex == -1) {
            return null;
        }

        return shapeTypes[randomIndex];
    };

    this.canBeShape = function(shapeType) {
        if (shapeType == SHAPETYPE_RECTANGLE) {
            return this.canBeRectangle();
        }
        else if (shapeType == SHAPETYPE_ROUNDED_RECTANGLE) {
            return this.canBeRoundedRectangle();
        }
        else if (shapeType == SHAPETYPE_TRIANGLE) {
            return this.canBeTriangle();
        }
        else if (shapeType == SHAPETYPE_CIRCLE) {
            return this.canBeCircle();
        }
        else if (shapeType == SHAPETYPE_PARALLELLOGRAM) {
            return this.canBeParallellogram();
        }
        return false;
    }

    this.makeShape = function(layer, shapeType) {
        if (this.shapeType != null) {
            throw "This subgrid has already been made into a shape.";
        }

        this.shapeType = shapeType;

        if (shapeType == SHAPETYPE_RECTANGLE) {
            return this.makeRectangle(layer);
        }
        else if (shapeType == SHAPETYPE_ROUNDED_RECTANGLE) {
            return this.makeRoundedRectangle(layer);
        }
        else if (shapeType == SHAPETYPE_TRIANGLE) {
            return this.makeTriangle(layer);
        }
        else if (shapeType == SHAPETYPE_CIRCLE) {
            return this.makeCircle(layer);
        }
        else if (shapeType == SHAPETYPE_PARALLELLOGRAM) {
            return this.makeParallellogram(layer);
        }

        return null;
    };

    this.makeRandomShape = function(layer, shapeTable) {
        return this.makeShape(layer, this.getRandomFittingShapeType(SHAPETYPE_ALL, shapeTable));
    };

    this.canBeRectangle = function() {
        // Always true
        return true;
    };
    this.makeRectangle = function(layer) {
        return layer.pathItems.rectangle(
            (this.getGridHeight() - this.y) * this.getUnitSize(),
            this.x * this.getUnitSize(),
            this.width * this.getUnitSize(),
            this.height * this.getUnitSize());
    };

    this.canBeRoundedRectangle = function() {
        // Shape must be twice as wide as high or vice versa.
        return (this.width >= (this.height * 2)) || (this.height >= (this.width * 2));
    };
    this.makeRoundedRectangle = function(layer) {
        // Sanity check
        if (!this.canBeRoundedRectangle()) {
            throw "This subgrid can't fit a rounded rectangle!";
        }

        var cornerRadius = Math.min(this.width, this.height) / 2;
        var shape = layer.pathItems.roundedRectangle(
            (this.getGridHeight() - this.y) * this.getUnitSize(),
            this.x * this.getUnitSize(),
            this.width * this.getUnitSize(),
            this.height * this.getUnitSize(),
            cornerRadius * this.getUnitSize(),
            cornerRadius * this.getUnitSize());

        return shape;
    };

    this.canBeCircle = function() {
        return this.width == this.height && this.width <= 2; // No big circles for now.
    }
    this.makeCircle = function(layer) {
        // Sanity check
        if (!this.canBeCircle()) {
            throw "This subgrid can't fit a circle!";
        }

        return layer.pathItems.ellipse(
            (this.getGridHeight() - this.y) * this.getUnitSize(),
            this.x * this.getUnitSize(),
            this.width * this.getUnitSize(),
            this.height * this.getUnitSize());
    }

    this.canBeTriangle = function() {
        return this.width == this.height && this.width <= 2; // No big triangles for now.
    };
    this.makeTriangle = function(layer) {
        // Sanity check
        if (!this.canBeTriangle()) {
            throw "This subgrid can't fit a triangle!";
        }

        var shape = layer.pathItems.add();

        var topRight = this.getAnchorPoint(ANCHOR_TOPRIGHT);
        var bottomLeft = this.getAnchorPoint(ANCHOR_BOTTOMLEFT);
        var bottomRight = this.getAnchorPoint(ANCHOR_BOTTOMRIGHT);

        shape.setEntirePath([
            [bottomLeft.x * this.getUnitSize(), bottomLeft.y * this.getUnitSize()],
            [topRight.x * this.getUnitSize(), topRight.y * this.getUnitSize()],
            [bottomRight.x * this.getUnitSize(), bottomRight.y * this.getUnitSize()],
            //[bottomLeft.x * this.getUnitSize(), bottomLeft.y * this.getUnitSize()]
        ]);

        return shape;
    };

    this.canBeParallellogram = function() {
        // Shape must be greater than three times as wide as high or vice versa.
        //return (this.width >= (this.height * 3)) || (this.height >= (this.width * 3));
        // For now only horizontal parallellograms are allowed.
        return this.width >= (this.height * 3);
    };
    this.makeParallellogram = function(layer) {
        // Sanity check
        if (!this.canBeParallellogram()) {
            throw "This subgrid can't fit a parallellogram!";
        }

        var shape = layer.pathItems.add();

        var topLeft = this.getAnchorPoint(ANCHOR_TOPLEFT);
        var topRight = this.getAnchorPoint(ANCHOR_TOPRIGHT);
        var bottomLeft = this.getAnchorPoint(ANCHOR_BOTTOMLEFT);
        var bottomRight = this.getAnchorPoint(ANCHOR_BOTTOMRIGHT);

        if (this.width < this.height) {
            // Vertical
            shape.setEntirePath([
                [topLeft.x * this.getUnitSize(), topLeft.y * this.getUnitSize()],
                [topRight.x * this.getUnitSize(), (topRight.y - this.width) * this.getUnitSize()],
                [bottomRight.x * this.getUnitSize(), bottomRight.y * this.getUnitSize()],
                [bottomLeft.x * this.getUnitSize(), (bottomLeft.y + this.width) * this.getUnitSize()],
                //[topLeft.x * this.getUnitSize(), topLeft.y * this.getUnitSize()]
            ]);
        }
        else {
            // Horizontal
            shape.setEntirePath([
                [bottomLeft.x * this.getUnitSize(), bottomLeft.y * this.getUnitSize()],
                [(topLeft.x + this.height) * this.getUnitSize(), topLeft.y * this.getUnitSize()],
                [topRight.x * this.getUnitSize(), topRight.y * this.getUnitSize()],
                [(bottomRight.x - this.height) * this.getUnitSize(), bottomRight.y * this.getUnitSize()],
                //[bottomLeft.x * this.getUnitSize(), bottomLeft.y * this.getUnitSize()]
            ]);
        }

        return shape;
    };

    this.getRandomColor = function(colorShades, colorRepeatNeighborMult) {
        var colors = new Array();
        var colorWeights = new Array();
        var neighbours = this.getNeighbours();

        function isColor(color) {
            var f = function(subgrid) {
                return subgrid.color === color;
            };
            return f;
        }

        for (var i = 0; i < colorShades.length; i++) {
            var color = colorShades[i];
            colors.push(color);
            colorWeights.push(Math.pow(colorRepeatNeighborMult, getArrayMatchCount(neighbours, isColor(color))));
        }

        return colorShades[getRandomWeightedIndex(colorWeights)];
    };

    this.setColor = function(argb) {
        this.color = argb;
    };

    /*
    this.debugPrint = function() {
        var msg = "--------------------";
        for (var y = 0; y < this.height; y++) {
            msg = msg.concat("\n  ");
            for (var x = 0; x < this.width; x++) {
                msg = msg.concat(String.fromCharCode(48 + this.get(x, y)));
            }
        }
        alert(msg.concat("\n--------------------"));
    };
    */
}

// Subgrid

function Subgrid(parent, x, y, width, height) {
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.__left = x;
    this.__right = x + width;
    this.__top = y;
    this.__bottom = y + height;

    // Inherited methods.
    
    this.contains = parent.contains;
    this.getRandomFittingShapeType = parent.getRandomFittingShapeType;
    this.canBeShape = parent.canBeShape;
    this.makeShape = parent.makeShape;
    this.makeRandomShape = parent.makeRandomShape;
    this.canBeRectangle = parent.canBeRectangle;
    this.makeRectangle = parent.makeRectangle;
    this.canBeRoundedRectangle = parent.canBeRoundedRectangle;
    this.makeRoundedRectangle = parent.makeRoundedRectangle;
    this.canBeCircle = parent.canBeCircle;
    this.makeCircle = parent.makeCircle;
    this.canBeTriangle = parent.canBeTriangle;
    this.makeTriangle = parent.makeTriangle;
    this.canBeParallellogram = parent.canBeParallellogram;
    this.makeParallellogram = parent.makeParallellogram;
    this.getRandomColor = parent.getRandomColor;
    this.setColor = parent.setColor;

    // Methods

    this.clone = function() {
        return new Subgrid(this.parent, this.x, this.y, this.width, this.height);
    }

    this.get = function (x, y) {
        return this.parent.get(this.x + x, this.y + y);
    };
    this.set = function(x, y, value) {
        this.parent.set(this.x + x, this.y + y, value);
    };
    this.setAll = function(value) {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                this.set(x, y, value);
            }
        }
    };

    this.getGridWidth = function() {
        return this.parent.getGridWidth();
    };
    this.getGridHeight = function() {
        return this.parent.getGridHeight();
    };
    this.getUnitSize = function() {
        return this.parent.getUnitSize();
    };

    this.isRowOccupied = function(y, x, width) {
        return this.parent.isRowOccupied(this.y + y, this.x + x, width);
    };
    this.isColumnOccupied = function(x, y, height) {
        return this.parent.isColumnOccupied(this.x + x, this.y + y, height);
    };

    this.resize = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.__left = x;
        this.__right = x + width;
        this.__top = y;
        this.__bottom = y + height;
    };
    this.resizeHorizontal = function(x, width) {
        this.resize(x, this.y, width, this.height);
    };
    this.resizeVertical = function(y, height) {
        this.resize(this.x, y, this.width, height);
    };
    this.resizeWithAnchor = function(anchor, width, height) {
        if (anchor == ANCHOR_TOPLEFT) {
            this.resize(this.x, this.y, width, height);
        }
        else if (anchor == ANCHOR_TOP) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_TOPRIGHT) {
            this.resize(this.x + (this.width - width), this.y, width, height);
        }
        else if (anchor == ANCHOR_LEFT) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_CENTER) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_RIGHT) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_BOTTOMLEFT) {
            this.resize(this.x, this.y + (this.height - height), width, height);
        }
        else if (anchor == ANCHOR_BOTTOM) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_BOTTOMRIGHT) {
            this.resize(this.x + (this.width - width), this.y + (this.height - height), width, height);
        }
        else {
            throw "Unknown anchor value: " + anchor;
        }
    };

    this.inflateHorizontal = function() {
        var deltaX = 0;
        while (!this.isColumnOccupied(deltaX - 1, 0, this.height)) {
            deltaX--;
        }

        var deltaWidth = 0;
        while (!this.isColumnOccupied(this.width + deltaWidth, 0, this.height)) {
            deltaWidth++;
        }

        this.resizeHorizontal(this.x + deltaX, this.width + (-deltaX) + deltaWidth);
    };
    this.inflateVertical = function() {
        var deltaY = 0;
        while (!this.isRowOccupied(deltaY - 1, 0, this.width)) {
            deltaY--;
        }

        var deltaHeight = 0;
        while (!this.isRowOccupied(this.height + deltaHeight, 0, this.width)) {
            deltaHeight++;
        }

        this.resizeVertical(this.y + deltaY, this.height + (-deltaY) + deltaHeight);
    };

    this.getAllValidCorners = function() {
        var corners = new Array();

        // Top-left
        if (this.get(-1, 0) != 0 && this.get(0, -1) != 0) {
            corners.push(ANCHOR_TOPLEFT);
        }

        // Top-right
        if (this.get(this.width, 0) != 0 && this.get(this.width - 1, -1) != 0) {
            corners.push(ANCHOR_TOPRIGHT);
        }

        // Bottom-left
        if (this.get(-1, this.height - 1) != 0 && this.get(0, this.height) != 0) {
            corners.push(ANCHOR_BOTTOMLEFT);
        }

        // Bottom-right
        if (this.get(this.width, this.height - 1) != 0 && this.get(this.width - 1, this.height) != 0) {
            corners.push(ANCHOR_BOTTOMRIGHT);
        }

        return corners;
    };

    this.hasValidCorner = function() {
        // Top-left
        if (this.get(-1, 0) != 0 && this.get(0, -1) != 0) {
            return true;
        }

        // Top-right
        if (this.get(this.width, 0) != 0 && this.get(this.width - 1, -1) != 0) {
            return true;
        }

        // Bottom-left
        if (this.get(-1, this.height - 1) != 0 && this.get(0, this.height) != 0) {
            return true;
        }

        // Bottom-right
        if (this.get(this.width, this.height - 1) != 0 && this.get(this.width - 1, this.height) != 0) {
            return true;
        }

        return false;
    };

    this.getAnchorPoint = function(anchor) {
        if (anchor == ANCHOR_TOPLEFT) {
            return new Point(this.x, this.getGridHeight() - this.y);
        }
        else if (anchor == ANCHOR_TOP) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_TOPRIGHT) {
            return new Point(this.x + this.width, this.getGridHeight() - this.y);
        }
        else if (anchor == ANCHOR_LEFT) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_CENTER) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_RIGHT) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_BOTTOMLEFT) {
            return new Point(this.x, this.getGridHeight() - (this.y + this.height));
        }
        else if (anchor == ANCHOR_BOTTOM) {
            throw "Unsupported (not needed right now...)";
        }
        else if (anchor == ANCHOR_BOTTOMRIGHT) {
            return new Point(this.x + this.width, this.getGridHeight() - (this.y + this.height));
        }
        else {
            throw "Unknown anchor value: " + anchor;
        }
    };

    this.subdivideHorizontal = function(childWidth) {
        var children = new Array();

        for (var x = 0; (x + childWidth) <= this.width; x += childWidth) {
            children.push(new Subgrid(this.parent, this.x + x, this.y, childWidth, this.height));
        }

        return children;
    };
    this.subdivideVertical = function(childHeight) {
        var children = new Array();

        for (var y = 0; (y + childHeight) <= this.height; y += childHeight) {
            children.push(new Subgrid(this.parent, this.x, this.y + y, this.width, childHeight));
        }

        return children;
    };

    this.getNeighbours = function() {
        var neighbours = new Array();
        var lastAdded = null;

        function addUniqueNeighbour(neighbour) {
            if (neighbour.length != undefined) {
                neighbour = neighbour[0];
            }
            if (neighbour != -1 && neighbour != lastAdded && !arrayContains(neighbours, subgrid)) {
                neighbours.push(neighbour);
                lastAdded = neighbour;
            }
        }

        for (var x = 0, n = this.width + 1; x < n; x++) {
            var subgrid = this.get(x, -1);
            addUniqueNeighbour(subgrid);
        }

        for (var x = -1; x < this.width; x++) {
            var subgrid = this.get(x, this.height);
            addUniqueNeighbour(subgrid);
        }

        for (var y = 0, n = this.height + 1; y < n; y++) {
            var subgrid = this.get(this.width, y);
            addUniqueNeighbour(subgrid);
        }

        for (var y = -1; y < this.height; y++) {
            var subgrid = this.get(-1, y);
            addUniqueNeighbour(subgrid);
        }

        return neighbours;
    };
}



// Script

const DEFAULT_SHAPE_TABLE = [
    {   
        shapeType: SHAPETYPE_RECTANGLE,
        weight: 2.0,
        repeatNeighbourMult: 0.1,
        repeatTotalMult: 1.0,
    },
    {
        shapeType: SHAPETYPE_ROUNDED_RECTANGLE,
        weight: 1.5,
        repeatNeighbourMult: 0.5,
        repeatTotalMult: 1.0,
    },
    {
        shapeType: SHAPETYPE_TRIANGLE,
        weight: 0.5,
        repeatNeighbourMult: 0.5,
        repeatTotalMult: 1.0,
    },
    {
        shapeType: SHAPETYPE_PARALLELLOGRAM,
        weight: 1.0,
        repeatNeighbourMult: 0.5,
        repeatTotalMult: 1.0,
    },
    {
        shapeType: SHAPETYPE_CIRCLE,
        weight: 0.25,
        repeatNeighbourMult: 0.5,
        repeatTotalMult: 1.0,
    },
];

const DEFAULT_SHAPE_SIZE_WEIGHTS = [0, 3, 3, 0.5, 0.5];
const DEFAULT_SECONDARY_SHAPE_SIZE_WEIGHTS = [0.5, 1, 1, 1, 1];

const SUBDIVIDE_MIN_SIZE = 2;
const DEFAULT_SUBDIVIDE_CHANCES = [0.15, 0.3, 0.45, 0.6];

const COLOR_TABLE_PRESETS = {
    "Utskrift CMYK Gul" : {
        colorSpace: "cmyk",
        foreground : CMYK_WHITE,
        background : { c: 19, m: 42, y: 100, k: 59 },
        shades : [{ c: 0, m: 34, y: 75, k: 0 }, { c: 0, m: 3, y: 48, k: 0 }],
    },
    "Utskrift CMYK Röd" : {
        colorSpace: "cmyk",
        foreground : CMYK_WHITE,
        background : { c: 16, m: 97, y: 86, k: 54 },
        shades : [{ c: 0, m: 88, y: 82, k: 0 }, { c: 0, m: 33, y: 10, k: 0 }],
    },
    "Utskrift CMYK Lila" : {
        colorSpace: "cmyk",
        foreground : CMYK_WHITE,
        background : { c: 97, m: 85, y: 0, k: 37 },
        shades : [{ c: 64, m: 55, y: 0, k: 0 }, { c: 24, m: 29, y: 0, k: 0 }],
    },
    "Utskrift CMYK Grön" : {
        colorSpace: "cmyk",
        foreground : CMYK_WHITE,
        background : { c: 87, m: 0, y: 100, k: 50 },
        shades : [{ c: 77, m: 0, y: 100, k: 0 }, { c: 34, m: 0, y: 42, k: 0 }],
    },
    "Utskrift CMYK Blå" : {
        colorSpace: "cmyk",
        foreground : CMYK_WHITE,
        background : { c: 97, m: 21, y: 33, k: 73 },
        shades : [{ c: 98, m: 0, y: 28, k: 4 }, { c: 45, m: 0, y: 18, k: 0 }],
    },
    "Utskrift CMYK Svartvitt" : {
        colorSpace: "cmyk",
        foreground : CMYK_WHITE,
        background : CMYK_BLACK,
        shades : [{ c: 33, m: 23, y: 35, k: 63 }, { c: 0, m: 0, y: 1, k: 20 }],
    },

    "Utskrift RGB Gul" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : { r: 115, g: 83, b: 29 },
        shades : [{ r: 255, g: 181, b: 73 }, { r: 248, g: 229, b: 154 }],
    },
    "Utskrift RGB Röd" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : { r: 124, g: 37, b: 41 },
        shades : [{ r: 238, g: 39, b: 55 }, { r: 252, g: 175, b: 192 }],
    },
    "Utskrift RGB Lila" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : { r: 44, g: 45, b: 101 },
        shades : [{ r: 106, g: 109, b: 205 }, { r: 197, g: 180, b: 227 }],
    },
    "Utskrift RGB Grön" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : { r: 3, g: 95, b: 29 },
        shades : [{ r: 67, g: 176, b: 42 }, { r: 173, g: 220, b: 145 }],
    },
    "Utskrift RGB Blå" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : { r: 0, g: 72, b: 81 },
        shades : [{ r: 0, g: 151, b: 169 }, { r: 120, g: 213, b: 225 }],
    },
    "Utskrift RGB Svartvitt" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : RGB_BLACK,
        shades : [{ r: 101, g: 102, b: 92 }, { r: 234, g: 234, b: 234 }],
    },

    "Web RGB Röd" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : { r: 124, g: 37, b: 41 },
        shades : [{ r: 207, g: 39, b: 50 }, { r: 255, g: 163, b: 181 }],
    },
    "Web RGB Lila" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : { r: 44, g: 45, b: 101 },
        shades : [{ r: 106, g: 108, b: 205 }, { r: 180, g: 181, b: 223 }],
    },
    "Web RGB Grön" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : { r: 3, g: 90, b: 29 },
        shades : [{ r: 0, g: 138, b: 21 }, { r: 161, g: 216, b: 132 }],
    },
    "Web RGB Blå" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : { r: 0, g: 72, b: 81 },
        shades : [{ r: 0, g: 130, b: 155 }, { r: 114, g: 202, b: 214 }],
    },
    "Web RGB Svartvitt" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : RGB_BLACK,
        shades : [{ r: 101, g: 102, b: 92 }, { r: 234, g: 234, b: 234 }],
    },

    "Färgglad!" : {
        colorSpace: "rgb",
        foreground : RGB_WHITE,
        background : RGB_BLACK,
        shades : [
            { r: 255, g: 181, b: 73 }, { r: 248, g: 229, b: 154 },
            { r: 207, g: 39, b: 50 }, { r: 255, g: 163, b: 181 },
            { r: 106, g: 108, b: 205 }, { r: 180, g: 181, b: 223 },
            { r: 0, g: 138, b: 21 }, { r: 161, g: 216, b: 132 },
            { r: 0, g: 130, b: 155 }, { r: 114, g: 202, b: 214 },
        ],
    },
}

// Configuration variables

var gridWidth = 12;
var gridHeight = 12;
var gridUnitSize = 100;
var preferHorizontalShapeChance = 0.5;
var shapeTable = DEFAULT_SHAPE_TABLE;
var shapeSizeWeights = DEFAULT_SHAPE_SIZE_WEIGHTS.join();
var secondaryShapeSizeWeights = DEFAULT_SECONDARY_SHAPE_SIZE_WEIGHTS.join();
var subdivideSizeChance = DEFAULT_SUBDIVIDE_CHANCES.join();
var treatSubdividedAsSingle = true; // TODO
var colorSelection = "Utskrift CMYK Gul";
var colorRepeatNeighborMult = 0.25;
var repeat = 1;

// -------------------------------------



// UI helper functions
// Resource: https://scriptui.joonas.me/

function uiAddGroup(dialog) {
    var group = dialog.add("group");
    group.orientation = "row";
    group.alignChildren = ["left","center"];
    group.spacing = 10;
    group.margins = 0;
    return group;
}

function uiAddDivider(dialog) {
    var divider = dialog.add("panel");
    divider.alignment = "fill";
}

function uiAddText(dialog, text, helpTip) {
    var element = dialog.add("statictext");
    element.helpTip = helpTip || null;
    element.text = text;
}

function uiAddURL(dialog, url) {
    var element = dialog.add('edittext {properties: {readonly: true}}');
    element.text = url;
}

function uiAddEditTextbox(dialog, text, defaultValue, helpTip) {
    var group = uiAddGroup(dialog);

    uiAddText(group, text, helpTip);

    var editTextbox = group.add("edittext");
    editTextbox.text = defaultValue;
    editTextbox.preferredSize.width = 50;

    return editTextbox;
}

function uiAddCheckbox(dialog, text, helpTip) {
    var checkbox = dialog.add("checkbox");
    checkbox.helpTip = helpTip || null;
    checkbox.text = text;
    return checkbox;
}

function uiAddDropdown(dialog, text, values, helpTip) {
    var group = uiAddGroup(dialog);

    uiAddText(group, text, helpTip);

    var dropdown = group.add("dropdownlist", undefined, undefined, { items: values });
    dropdown.helpTip = helpTip || null;
    dropdown.selection = 0;

    return dropdown;
}

function uiAddPastebox(dialog, helpTip) {
    var pastebox = dialog.add('edittext {properties: {multiline: true, scrollable: true}}');
    pastebox.helpTip = helpTip || null;
    pastebox.preferredSize.width = 450;
    pastebox.preferredSize.height = 200;
    return pastebox;
}

function uiAddButton(dialog, text) {
    var button = dialog.add("button");
    button.text = text;
    return button;
}

function generateDropdownValues(table) {
    var values = new Array();
    for (var key in table) {
        values.push(key);
    }
    return values;
}

function generateWeightArray(separatedValues) {
    separatedValues = separatedValues.split(",");
    for (var i = 0; i < separatedValues.length; i++) {
        separatedValues[i] = Number(separatedValues[i]);
    }
    return separatedValues;
}

// The main function that gets called on a successful dialog.

function main() {
    gridWidth = Number(edittextGridWidth.text);
    gridHeight = Number(edittextGridHeight.text);
    gridUnitSize = Number(edittextGridUnitSize.text);

    shapeTable[0].weight = Number(edittextRectangleWeight.text);
    shapeTable[0].repeatNeighbourMult = Number(edittextRectangleRepeat.text);
    shapeTable[1].weight = Number(edittextRoundedRectangleWeight.text);
    shapeTable[1].repeatNeighbourMult = Number(edittextRoundedRectangleRepeat.text);
    shapeTable[2].weight = Number(edittextTriangleWeight.text);
    shapeTable[2].repeatNeighbourMult = Number(edittextTriangleRepeat.text);
    shapeTable[3].weight = Number(edittextParallellogramWeight.text);
    shapeTable[3].repeatNeighbourMult = Number(edittextParallellogramRepeat.text);
    shapeTable[4].weight = Number(edittextCircleWeight.text);
    shapeTable[4].repeatNeighbourMult = Number(edittextCircleRepeat.text);

    preferHorizontalShapeChance = Number(edittextPreferHorizontalShapeChance.text);
    shapeSizeWeights = generateWeightArray(edittextShapeSizeWeights.text);
    secondaryShapeSizeWeights = generateWeightArray(edittextSecondaryShapeSizeWeights.text);
    subdivideSizeChance = generateWeightArray(edittextSubdivideSizeChance.text);
    //treatSubdividedAsSingle = treatSubdividedAsSingle; // TODO
    colorSelection = dropdownColor.selection;
    var useWhitebackground = checkboxWhiteBackground.value;
    colorRepeatNeighborMult = Number(edittextColorRepeatNeighborMult.text);

    repeat = Number(edittextRepeat.text);

    var colorTable = COLOR_TABLE_PRESETS[colorSelection];

    if (colorTable == null) {
        throw "colorTable was null";
    }

    var docColorSpace;
    if (colorTable.colorSpace == "rgb") {
        docColorSpace = DocumentColorSpace.RGB;
    }
    else if (colorTable.colorSpace = "cmyk") {
        docColorSpace = DocumentColorSpace.CMYK;
    }
    else {
        throw "Unknown color space: " + colorTable.colorSpace;
    }
    
    var colorBackground;
    var colorShades = colorTable.shades;

    if (!useWhitebackground) {
        colorBackground = colorTable.background;
        colorShades.push(colorTable.foreground);
    }
    else {
        colorShades.push(colorTable.background);
    }
    
    var baseGrid = new Grid(gridWidth, gridHeight, gridUnitSize);

    if (edittextPattern.text != "") {
        var patternIndex = 0;
        var patternLines = 1;

        for (var i = 0; i < edittextPattern.text.length; i++) {
            var ch = edittextPattern.text[i];

            if (ch == '\n') {
                patternLines++;
                continue;
            }

            if (ch.charCodeAt(0) < 32) {
                continue;
            }

            if ((ch == ' ' || ch == '.' || ch == ',' || ch == ':' || ch == ';' || ch == '\'') == checkboxPatternInvert.value) {
                baseGrid.setIndex(patternIndex, -1);
            }

            patternIndex++;
        }

        gridWidth = patternIndex / patternLines;
        gridHeight = patternLines;
        baseGrid.resize(gridWidth, gridHeight);
    }

    // Pattern

    /*
    var patternFile = File("L:\\Loggor & Grafik\\Verktyg och skript\\pattern.txt");
    patternFile.open('r');
    if (patternFile.exists && patternFile.error != null) {
        var patternIndex = 0;

        while (!patternFile.eof) {
            var ch = patternFile.readch();

            if (ch.charCodeAt(0) < 32) {
                continue;
            }

            if ((ch == ' ' || ch == '.' || ch == ',' || ch == ':' || ch == ';' || ch == '\'') == false) {
                baseGrid.setIndex(patternIndex, -1);
            }

            patternIndex++;
        }
    }
    */

    var step = false;

    // The magic

    var doc;
    var layer;
    var grid;

    // Safety precaution
    var maxIterations = 1000;

    var addShapeProc = function() {
        while (maxIterations-- > 0) {
            var points = new Array();

            // Add unoccupied points.
            for (var x = 0; x < gridWidth; x++) {
                for (var y = 0; y < gridHeight; y++) {
                    if (grid.get(x, y) == 0) {
                        points.push(new Point(x, y));
                    }
                }
            }

            if (points.length == 0) {
                // We are finished.
                return false;
            }

            // Pick random point.
            var point = getRandomArrayElement(points);

            var subgrids = grid.findSubgridsWithPoint(point.x, point.y);

            if (subgrids.length == 0) {
                //throw "No valid subgrids!";
                // It can happen but it's very rare so just start over with a new random point.
                continue;
            }

            var subgrid = getRandomArrayElement(subgrids);

            var corners = subgrid.getAllValidCorners();

            if (corners.length == 0) {
                // Should not happen!
                throw "No valid corners!";
            }

            var corner = getRandomArrayElement(corners);

            var newSubgridWidth;
            var newSubgridHeight;

            if (Math.random() < preferHorizontalShapeChance) {
                newSubgridHeight = getRandomWeightedIndex(shapeSizeWeights);
                newSubgridWidth = getRandomWeightedIndex(secondaryShapeSizeWeights);
            }
            else {
                newSubgridWidth = getRandomWeightedIndex(shapeSizeWeights);
                newSubgridHeight = getRandomWeightedIndex(secondaryShapeSizeWeights);
            }

            // Truncate
            newSubgridWidth = Math.min(subgrid.width - 1, newSubgridWidth) + 1;
            newSubgridHeight = Math.min(subgrid.height - 1, newSubgridHeight) + 1;

            subgrid.resizeWithAnchor(corner, newSubgridWidth, newSubgridHeight);

            var subdivided = false;

            if (subgrid.width >= SUBDIVIDE_MIN_SIZE && subgrid.height >= SUBDIVIDE_MIN_SIZE) {
                var subdivideHorizontal = Math.random();
                var subdivideVertical = Math.random();
                var wantSubdivideHorizontal = subdivideHorizontal < subdivideSizeChance[subgrid.width - SUBDIVIDE_MIN_SIZE];
                var wantSubdivideVertical = subdivideVertical < subdivideSizeChance[subgrid.height - SUBDIVIDE_MIN_SIZE];

                var subsubgrids = null;

                if (wantSubdivideHorizontal && subdivideHorizontal >= subdivideVertical) {
                    // Horizontal
                    //subsubgrids = subgrid.subdivideVertical(getRandomInt(1, Math.max(2, 1 + Math.floor(subgrid.width / 2))));
                    subsubgrids = subgrid.subdivideVertical(1);
                }
                else if (wantSubdivideVertical) {
                    // Vertical
                    //subsubgrids = subgrid.subdivideVertical(getRandomInt(1, Math.max(2, 1 + Math.floor(subgrid.height / 2))));
                    subsubgrids = subgrid.subdivideVertical(1);
                }

                if (subsubgrids) {
                    // Decide shape

                    var shapeType = subsubgrids[0].getRandomFittingShapeType(SHAPETYPE_ROUNDED_RECTANGLE | SHAPETYPE_PARALLELLOGRAM, shapeTable);

                    if (shapeType != null) {
                        var color = subgrid.getRandomColor(colorShades, colorRepeatNeighborMult);

                        for (var i = 0; i < subsubgrids.length; i++) {
                            var shape = subsubgrids[i].makeShape(layer, shapeType);
                            shape.closed = true;
                            shape.fillColor = makeColorObject(color);

                            if (treatSubdividedAsSingle) {
                                subsubgrids[i].setAll(subsubgrids);
                            }
                            else {
                                subsubgrids[i].setAll(subsubgrids[i]);
                            }

                            subsubgrids[i].setColor(color);
                        }

                        subdivided = true;

                        return true;
                    }
                }
            }

            if (!subdivided) {
                // Mark subgrid as occupied.
                subgrid.setAll(subgrid);

                var shape = subgrid.makeRandomShape(layer, shapeTable);

                shape.closed = true;

                var color = subgrid.getRandomColor(colorShades, colorRepeatNeighborMult);

                shape.fillColor = makeColorObject(color);
                subgrid.setColor(color);

                return true;
            }
        }

        return false;
    }

    var mainProc = function() {
        doc = app.documents.add(docColorSpace, gridWidth * gridUnitSize, gridHeight * gridUnitSize);
        doc.defaultStroked = false;

        layer = doc.layers[0];
        //var artboard = doc.artboards[0];

        grid = baseGrid.clone();

        if (!useWhitebackground) {
            var backgroundShape = grid.makeBackground(layer, 0.25);
            backgroundShape.fillColor = makeColorObject(colorBackground);
        }

        while (addShapeProc()) {
        }
    };

    if (step) {
        doc = app.documents.add(docColorSpace, gridWidth * gridUnitSize, gridHeight * gridUnitSize);
        doc.defaultStroked = false;

        layer = doc.layers[0];
        //var artboard = doc.artboards[0];

        grid = baseGrid.clone();

        if (!useWhitebackground) {
            var backgroundShape = grid.makeBackground(layer, 0.25);
            backgroundShape.fillColor = makeColorObject(colorBackground);
        }

        // Step dialog
        var stepDialog = new Window("dialog");
        stepDialog.text = "Steg";
        stepDialog.orientation = "column"; // Might not be deprecated with Illustrators old javascript. Don't remove!
        stepDialog.alignChildren = ["center","top"];
        stepDialog.spacing = 10;
        stepDialog.margins = 16;

        var buttonNext = uiAddButton(stepDialog, "Nästa");
        buttonNext.onClick = function() {
            addShapeProc();
            app.redraw();
        };

        stepDialog.show();
    }
    else {
        while (repeat-- > 0) {
            mainProc();
        }
    }
}

// UI

var dialog = new Window("dialog");
dialog.text = "LKPG Graphics Script";
dialog.orientation = "column"; // Might not be deprecated with Illustrators old javascript. Don't remove!
dialog.alignChildren = ["center","top"];
dialog.spacing = 10;
dialog.margins = 16;

uiAddText(dialog, "Tips: Håll muspekaren över ett alternativ för att få mer information.");

uiAddDivider(dialog);

var dialogGroup = uiAddGroup(dialog);

var leftDialogGroup = uiAddGroup(dialogGroup);
leftDialogGroup.orientation = "column"; 

uiAddDivider(dialogGroup);

var rightDialogGroup = uiAddGroup(dialogGroup);
rightDialogGroup.orientation = "column"; 

uiAddText(leftDialogGroup, "STORLEK");
var edittextGridWidth = uiAddEditTextbox(leftDialogGroup, "Bredd (antal rutor):", 12);
var edittextGridHeight = uiAddEditTextbox(leftDialogGroup, "Höjd (antal rutor):", 12);
var edittextGridUnitSize = uiAddEditTextbox(leftDialogGroup, "Bredd/höjd per ruta (punkter):", 100, "Tips: Ändra inte denna och anpassa storleken i Illustrator efteråt istället.");

uiAddDivider(leftDialogGroup);

uiAddText(leftDialogGroup, "FORMER");
var edittextRectangleWeight = uiAddEditTextbox(leftDialogGroup, "Rektangel vikt:", shapeTable[0].weight, "Högre värden ger större chans att en rektangel skapas. Ange 0 för att inte ha rektanglar.");
var edittextRectangleRepeat = uiAddEditTextbox(leftDialogGroup, "(WIP) Upprepa rektanglar:", 0.25, "TODO");
var edittextRoundedRectangleWeight = uiAddEditTextbox(leftDialogGroup, "Rundad rektangel vikt:", shapeTable[1].weight, "Högre värden ger större chans att en rundad rektangel skapas. Ange 0 för att inte ha rundade rektanglar.");
var edittextRoundedRectangleRepeat = uiAddEditTextbox(leftDialogGroup, "(WIP) Upprepa rundade rektanglar:", 0.5, "TODO");
var edittextTriangleWeight = uiAddEditTextbox(leftDialogGroup, "Triangel vikt:", shapeTable[2].weight, "Högre värden ger större chans att en triangel skapas. Ange 0 för att inte ha trianglar.");
var edittextTriangleRepeat = uiAddEditTextbox(leftDialogGroup, "(WIP) Upprepa trianglar:", 0.5, "TODO");
var edittextParallellogramWeight = uiAddEditTextbox(leftDialogGroup, "Parallellogram vikt:", shapeTable[3].weight, "Högre värden ger större chans att ett parallellogram skapas. Ange 0 för att inte ha parallellogram. Notera att denna form har högre krav än de andra och som resultat kommer det bli färre av den oavsett angivet värde här.");
var edittextParallellogramRepeat = uiAddEditTextbox(leftDialogGroup, "(WIP) Upprepa parallellogram:", 0.5, "TODO");
var edittextCircleWeight = uiAddEditTextbox(leftDialogGroup, "Cirkel vikt:", shapeTable[4].weight, "Högre värden ger större chans att en cirkel skapas. Ange 0 för att inte ha cirklar.");
var edittextCircleRepeat = uiAddEditTextbox(leftDialogGroup, "(WIP) Upprepa cirklar:", 0.5, "TODO");

uiAddDivider(leftDialogGroup);

uiAddText(leftDialogGroup, "FÄRGER");
var dropdownColor = uiAddDropdown(leftDialogGroup, "Färg:", generateDropdownValues(COLOR_TABLE_PRESETS));
var checkboxWhiteBackground = uiAddCheckbox(leftDialogGroup, "Vit bakgrund", "Normalt används den mörka nyansen som bakgrund med former i vit och de två ljusaste nyanserna.  Aktivera detta alternativ för att ha vit bakgrund och ha former i alla tre nyanser.");
var edittextColorRepeatNeighborMult = uiAddEditTextbox(leftDialogGroup, "Upprepa färger:", colorRepeatNeighborMult, "Måste vara större än 0. Värden mindre än 1 minskar chansen att färger upprepas för former placerade bredvid varandra.");

// WIP
/*
var uiColorSpace = uiAddDropdown(leftDialogGroup, "Färgrymd:", "CMYK,RGB");
var uiColorType = uiAddDropdown(leftDialogGroup, "Typ:", "Utskrift,Web");
var uiColor = uiAddDropdown(leftDialogGroup, "Färg:", "Gul,Röd,Lila,Grön,Blå,Svartvitt,Färgglad (Bara för skojs skull)");
*/

//uiAddDivider(dialog);

uiAddText(rightDialogGroup, "MÖNSTER");
uiAddURL(rightDialogGroup, "https://www.ascii-art-generator.org/");
uiAddText(rightDialogGroup, "Klistra in mönster i rutan nedanför");
var edittextPattern = uiAddPastebox(rightDialogGroup);
var checkboxPatternInvert = uiAddCheckbox(rightDialogGroup, "Invertera");

uiAddDivider(rightDialogGroup);

uiAddText(rightDialogGroup, "AVANCERADE ALTERNATIV (Du vill förmodligen inte röra dessa!)");
var edittextPreferHorizontalShapeChance = uiAddEditTextbox(rightDialogGroup, "Föredra vågräta/liggande former:", preferHorizontalShapeChance, "Hur ofta en form skapas där höjden bestäms innan bredden.");
var edittextShapeSizeWeights = uiAddEditTextbox(rightDialogGroup, "Formstorlek 1:a dimension frekvenser (1, 2, 3, ...):", shapeSizeWeights, "Höjd eller bredd. Se alternativet ovan.");
var edittextSecondaryShapeSizeWeights = uiAddEditTextbox(rightDialogGroup, "Formstorlek 2:a dimension frekvenser (1, 2, 3, ...):", secondaryShapeSizeWeights);
var edittextSubdivideSizeChance = uiAddEditTextbox(rightDialogGroup, "Chans för repeterade former beroende på storlek (2, 3, 4, ...):", subdivideSizeChance);

uiAddDivider(dialog);

var edittextRepeat = uiAddEditTextbox(dialog, "Hur många dokument som ska skapas:", repeat);
edittextRepeat.text = repeat;

var buttonStart = uiAddButton(dialog, "Tryck här för att skapa mönster");
buttonStart.onClick = function() {
    dialog.close();
    main();
};

// Show main dialog
dialog.show();