// Skrivet av Sabrina

// Enable double clicking from the Macintosh Finder or the Windows Explorer
#target illustrator

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function makeRectangle(layer, x, y, width, height, unitSize) {
    return layer.pathItems.rectangle(
        -(y * unitSize),
        x * unitSize,
        width * unitSize,
        height * unitSize);
}

function makeRoundedRectangle(layer, x, y, width, height, unitSize) {
    if ((width < (height * 2)) && (height < (width * 2))) {
        alert("En rundad rektangel måste vara dubbelt så bred som hög eller tvärtom.");
        return null;
    }

    var cornerRadius = Math.min(width, height) / 2;
    var shape = layer.pathItems.roundedRectangle(
        -(y * unitSize),
        x * unitSize,
        width * unitSize,
        height * unitSize,
        cornerRadius * unitSize,
        cornerRadius * unitSize);

    return shape;
}

function makeCircle(layer, x, y, width, height, unitSize) {
    /*
    if (width != height) {
        alert("A circle must have the same width as height!");
        return;
    }
    */

    // Ignore user errors and correct
    height = width;

    return layer.pathItems.ellipse(
        -(y * unitSize),
        x * unitSize,
        width * unitSize,
        height * unitSize);
}

function makeTriangle(layer, x, y, width, height, unitSize) {
    /*
    if (width != height) {
        alert("A triangle must have the same width as height!");
        return;
    }
    */

    // Ignore user errors and correct
    height = width;

    var shape = layer.pathItems.add();

    var topRight = new Point(x + width, -y);
    var bottomLeft = new Point(x, -(y + height));
    var bottomRight = new Point(x + width, -(y + height));

    shape.setEntirePath([
        [bottomLeft.x * unitSize, bottomLeft.y * unitSize],
        [topRight.x * unitSize, topRight.y * unitSize],
        [bottomRight.x * unitSize, bottomRight.y * unitSize],
    ]);

    return shape;
}

function makeParallellogram(layer, x, y, width, height, unitSize) {
    if (width < (height * 3)) {
        //alert("A parallellogram shape must have a width that is three times greater than it's height");
        alert("Ett parallellogram måste vara mer än tre gånger så bred som hög.");
        return null;
    }

    var shape = layer.pathItems.add();

    var topLeft = new Point(x, -y);
    var topRight = new Point(x + width, -y);
    var bottomLeft = new Point(x, -(y + height));
    var bottomRight = new Point(x + width, -(y + height));

    if (width < height) {
        // Vertical
        shape.setEntirePath([
            [topLeft.x * unitSize, topLeft.y * unitSize],
            [topRight.x * unitSize, (topRight.y - width) * unitSize],
            [bottomRight.x * unitSize, bottomRight.y * unitSize],
            [bottomLeft.x * unitSize, (bottomLeft.y + width) * unitSize],
        ]);
    }
    else {
        // Horizontal
        shape.setEntirePath([
            [bottomLeft.x * unitSize, bottomLeft.y * unitSize],
            [(topLeft.x + height) * unitSize, topLeft.y * unitSize],
            [topRight.x * unitSize, topRight.y * unitSize],
            [(bottomRight.x - height) * unitSize, bottomRight.y * unitSize],
        ]);
    }

    return shape;
}

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

function uiAddText(dialog, text, helpTip) {
    var element = dialog.add("statictext");
    element.helpTip = helpTip
    element.text = text;
}

function uiAddEditTextbox(dialog, text, defaultValue, helpTip) {
    var group = uiAddGroup(dialog);

    uiAddText(group, text, helpTip);

    var editTextbox = group.add("edittext");
    editTextbox.text = defaultValue;
    editTextbox.preferredSize.width = 50;

    return editTextbox;
}

function uiAddButton(dialog, text) {
    var button = dialog.add("button");
    button.text = text;
    return button;
}

// Document

var activeLayer = app.activeDocument.activeLayer;
var shapeOffsetY = 1;

// UI Dialog


/*
Code for Import https://scriptui.joonas.me — (Triple click to select): 
{"activeId":10,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":null,"windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Dialog","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-2":{"id":2,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-3":{"id":3,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-4":{"id":4,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Bredd:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"EditText","parentId":1,"style":{"enabled":true,"varName":"edittextWidth","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"1","justify":"left","preferredSize":[50,0],"alignment":null,"helpTip":null}},"item-6":{"id":6,"type":"StaticText","parentId":2,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Bredd/höjd per ruta (punkter):","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"EditText","parentId":2,"style":{"enabled":true,"varName":"edittextUnitSize","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"100","justify":"left","preferredSize":[50,0],"alignment":null,"helpTip":null}},"item-8":{"id":8,"type":"StaticText","parentId":3,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Höjd:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-9":{"id":9,"type":"EditText","parentId":3,"style":{"enabled":true,"varName":"edittextHeight","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"1","justify":"left","preferredSize":[50,0],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Skapa en enstaka figur i det öppnade dokumentet.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"buttonRectangle","text":"Skapa Rektangel","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"buttonRoundedRectangle","text":"Skapa rundad rektangel","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"buttonTriangle","text":"Skapa triangel","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-14":{"id":14,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"buttonParallellogram","text":"Skapa parallellogram","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-15":{"id":15,"type":"Button","parentId":0,"style":{"enabled":true,"varName":"buttonCircle","text":"Skapa cirkel","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,10,1,4,5,3,8,9,2,6,7,11,12,13,14,15],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
*/ 

// DIALOG
// ======
var dialog = new Window("dialog"); 
dialog.text = "Dialog"; 
dialog.orientation = "column"; 
dialog.alignChildren = ["center","top"]; 
dialog.spacing = 10; 
dialog.margins = 16; 

uiAddText(dialog, "Skapa en enstaka figur i det öppnade dokumentet.");

var edittextWidth = uiAddEditTextbox(dialog, "Bredd:", 1);
var edittextHeight = uiAddEditTextbox(dialog, "Höjd:", 1);
var edittextUnitSize = uiAddEditTextbox(dialog, "Bredd/höjd per ruta (punkter):", 100, "Använd samma som du använde när du skapade ditt mönster.");

var buttonRectangle = uiAddButton(dialog, "Skapa Rektangel");
buttonRectangle.onClick = function() {
    var width = Number(edittextWidth.text);
    var height = Number(edittextHeight.text);
    var unitSize = Number(edittextUnitSize.text);

    makeRectangle(activeLayer, 0, shapeOffsetY, width, height, unitSize);

    app.redraw();

    shapeOffsetY += height;
};

var buttonRoundedRectangle = uiAddButton(dialog, "Skapa rundad rektangel");
buttonRoundedRectangle.onClick = function() {
    var width = Number(edittextWidth.text);
    var height = Number(edittextHeight.text);
    var unitSize = Number(edittextUnitSize.text);

    if (makeRoundedRectangle(activeLayer, 0, shapeOffsetY, width, height, unitSize) == null) {
        return;
    }

    app.redraw();

    shapeOffsetY += height;
};

var buttonTriangle = uiAddButton(dialog, "Skapa triangel");
buttonTriangle.onClick = function() {
    var width = Number(edittextWidth.text);
    var height = Number(edittextHeight.text);
    var unitSize = Number(edittextUnitSize.text);

    makeTriangle(activeLayer, 0, shapeOffsetY, width, height, unitSize);

    app.redraw();

    shapeOffsetY += height;
};

var buttonParallellogram = uiAddButton(dialog, "Skapa parallellogram");
buttonParallellogram.onClick = function() {
    var width = Number(edittextWidth.text);
    var height = Number(edittextHeight.text);
    var unitSize = Number(edittextUnitSize.text);

    if (makeParallellogram(activeLayer, 0, shapeOffsetY, width, height, unitSize) != null) {
        return;
    }

    app.redraw();

    shapeOffsetY += height;
};

var buttonCircle = uiAddButton(dialog, "Skapa cirkel");
buttonCircle.onClick = function() {
    var width = Number(edittextWidth.text);
    var height = Number(edittextHeight.text);
    var unitSize = Number(edittextUnitSize.text);

    makeCircle(activeLayer, 0, shapeOffsetY, width, height, unitSize);

    app.redraw();

    shapeOffsetY += height;
};

dialog.show();