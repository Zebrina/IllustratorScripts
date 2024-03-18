// Skrivet av Sabrina

// Enable double clicking from the Macintosh Finder or the Windows Explorer
#target illustrator

// CONSTANTS

const TITLE = "Dupliceringsskript";

const ERR_ABORT = "Skript avbrutet";
const ERR_INPUT = "Felaktigt värde";

// FUNCTIONS

function promptEx(text, defaultValue) {
  if (defaultValue == undefined) {
    defaultValue = "";
  }
  var input = prompt(text, defaultValue, TITLE);
  if (input == null) {
    throw ERR_ABORT;
  }
  return input;
}

// Usage: anyOf(number, 1, 2, 3) -> returns true if number is 1, 2 or 3
function anyOf() {
  if (arguments.length >= 2) {
    var value = arguments[0];
    for (var i = 1; i < arguments.length; ++i) {
      if (arguments[i] == value) {
        return true;
      }
    }
  }
  return false;
}

// CODE

function main() {
  var sourceDoc = app.activeDocument;

  if (sourceDoc.dataSets.length == 0) {
    alert("Dokumentet har inga datauppsättningar.");
    return;
  }

  var dataSetStart = promptEx("Första datauppsätting:", "1");
  dataSetStart = parseInt(dataSetStart) - 1;
  if (isNaN(dataSetStart)) {
    alert(ERR_INPUT);
    return;
  }
  else if (dataSetStart < 0) {
    dataSetStart = 0;
  }
  else if (dataSetStart >= sourceDoc.dataSets.length) {
    alert("Dokumentet har endast " + sourceDoc.dataSets.length + " datauppsättningar.");
    return;
  }

  var dataSetCount = promptEx("Antal datauppsättningar (lämna tomt för alla):");
  if (dataSetCount == "") {
    dataSetCount = 999999;
  }
  else {
    dataSetCount = parseInt(dataSetCount);
    if (isNaN(dataSetCount)) {
      alert(ERR_INPUT);
      return;
    }
  }

  var objectsPerLine = promptEx("Antal datauppsättningar per rad:", "10", "TITEL");
  objectsPerLine = parseInt(objectsPerLine);
  if (isNaN(objectsPerLine)) {
    alert(ERR_INPUT);
    return;
  }

  var useCropBox = false;
  // DOES NOT WORK??? "The property was not initialized (sourceDoc.cropBox??)"
  /*
  if (sourceDoc.cropBox != null) {
    useCropBox = promptEx("Använd beskuret område? (j/n)", "n");
    useCropBox = useCropBox.toLowerCase();
    if (anyOf(useCropBox, "j", "ja", "sant")) {
      useCropBox = true;
    }
    else if (anyOf(useCropBox, "n", "nej", "falskt")) {
      useCropBox = false;
    }
    else {
      alert(ERR_INPUT);
      return;
    }
  }
  */

  var docWidth;
  var docHeight;
  if (useCropBox) {
    docWidth = sourceDoc.cropBox[2] - sourceDoc.cropBox[0];
    docHeight = sourceDoc.cropBox[1] - sourceDoc.cropBox[3];
  }
  else {
    docWidth = sourceDoc.width;
    docHeight = sourceDoc.height;
  }

  // Make sure dataSetCount is not greater than what is available
  dataSetCount = Math.min(dataSetCount, sourceDoc.dataSets.length - dataSetStart);

  var numLines = Math.ceil(dataSetCount / objectsPerLine);

  // Calculate new document bounds
  var newDocWidth, newDocHeight;
  if (numLines == 1) {
    // If only one single line limit width to the number of datasets
    newDocWidth = docWidth * dataSetCount;
    newDocHeight = docHeight;
  }
  else {
    newDocWidth = docWidth * objectsPerLine;
    newDocHeight = docHeight * numLines;
  }

  var newDoc = app.documents.add(sourceDoc.documentColorSpace, newDocWidth, newDocHeight);
  // Delete initial layer
  newDoc.layers.removeAll();

  // Activate source document so we can update dataSetStart
  sourceDoc.activate();

  //pageItem.translate(docWidth * -((objectsPerLine - 1) / 2), docHeight * -((numLines - 1) / 2));

  var x = 0;
  var y = 0;
  var dataSetMax = dataSetStart + dataSetCount;
  for (var dataSetIndex = dataSetStart; dataSetIndex < dataSetMax; ++dataSetIndex) {
    sourceDoc.dataSets[dataSetIndex].display();
    for (var i = 0; i < sourceDoc.layers.length; ++i) {
      var refLayer = sourceDoc.layers[i];
      var newLayer = newDoc.layers.add();
      newLayer.name = refLayer.name + " " + (dataSetIndex + 1);
      for (var j = 0; j < refLayer.pageItems.length; ++j) {
        var newItem = refLayer.pageItems[j].duplicate(newLayer, ElementPlacement.PLACEATEND);
        newItem.translate(docWidth * (x - ((objectsPerLine - 1) / 2)), docHeight * (y - ((numLines - 1) / 2)));
      }
    }
    ++x;
    if (x >= objectsPerLine) {
      x = 0;
      ++y;
    }
    /*
    ++y;
    if (y >= numLines) {
      y = 0;
      ++x;
    }
    */
  }
}

main();

alert("Klar!");
